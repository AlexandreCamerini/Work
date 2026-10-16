# Photo App — skeleton com pipeline Hugging Face

Upload de foto → moderação (gate) → tagging / caption / remoção de fundo, cada um
via um modelo do Hugging Face Hub, acessado por uma interface trocável entre execução
local e HF Inference Endpoint.

## Arquitetura

```
api/routes.py           → upload dispara um job; consulta de status por job_id
pipeline/queue.py       → fila in-process (troque por Redis/RQ quando o volume pedir)
pipeline/orchestrator.py→ moderação é GATE bloqueante; demais estágios rodam em paralelo e são best-effort
models/*.py             → um wrapper por modelo HF (moderation, clip_tagging, captioning, background_removal)
inference/registry.py   → escolhe Local/HFEndpoint/SelfHosted por env var (INFERENCE_BACKEND)
inference_server/       → servidor standalone pra rodar numa VM própria (ver "Hospedagem sem custo")
storage/local_storage.py→ storage em disco local (trocar por S3/GCS implementando PhotoStorage)
```

## Por que essa separação

- **`models/` nunca importa `transformers` nem `httpx` diretamente** — só fala com
  `inference/registry.get_backend()`. Trocar de execução local para Inference Endpoint
  é mudar `INFERENCE_BACKEND=hf_endpoint` no `.env`, não reescrever código.
- **Moderação é gate, não estágio.** Nenhuma foto chega a tagging/caption/bg-removal
  sem passar pelo classificador NSFW primeiro. Ver `pipeline/orchestrator.py`.
- **Estágios pós-gate são best-effort e paralelos** (`asyncio.gather` com
  `return_exceptions=True`): a falha de um modelo (ex.: captioning fora do ar) não derruba
  os outros, porque cada resultado alimenta uma feature independente da UI.

## Rodando

```bash
cd photo_app
pip install -r requirements.txt
cp .env.example .env
uvicorn photo_app.main:app --reload
```

```bash
curl -F "file=@foto.jpg" http://localhost:8000/photos/upload
curl http://localhost:8000/photos/jobs/<job_id>
```

## Onde cada modelo roda (decisão de custo/latência)

| Modelo | Tarefa | Client (transformers.js/ONNX) | Server local | HF Endpoint |
|---|---|---|---|---|
| `Falconsai/nsfw_image_detection` | moderação | não recomendado (bypassável) | sim | sim |
| `openai/clip-vit-base-patch32` | tagging | sim, leve | sim | sim |
| `briaai/RMBG-2.0` | remoção de fundo | sim, candidato forte | sim | sim |
| `Salesforce/blip-image-captioning-base` | caption | não (custo de latência) | sim | sim |

Regra prática: modelo pequeno e sem risco de bypass → client. Modelo pesado ou que
decide algo de negócio (moderação) → sempre server-side.

## Hospedagem sem custos (`INFERENCE_BACKEND=self_hosted`)

Não existe GPU grátis para produção 24/7 — Colab, Kaggle e HF Spaces ZeroGPU são free
tiers de *prototipagem* (sessão com timeout, fila compartilhada, cold start alto), não
backend de serviço real. O que existe de fato grátis e permanente é CPU: uma VM
**Oracle Cloud Always Free** (Ampere A1, até 4 OCPU + 24GB RAM, ARM64, sem expirar).

Isso cobre os modelos leves do pipeline atual (CLIP tagging, RMBG) — não cobre diffusion
ou modelos de vídeo pesados, que exigem GPU paga (Modal, RunPod) quando o produto validar
que vale o custo.

### Deploy na VM Oracle

1. Criar a instância Always Free (shape `VM.Standard.A1.Flex`, Ubuntu ARM64) e abrir a
   porta 8001 no Security List/NSG.
2. Na VM:
   ```bash
   git clone <este-repo> && cd Work/photo_app/inference_server
   pip install -r requirements.txt
   export INFERENCE_SERVER_TOKEN=$(openssl rand -hex 32)   # guarde este valor
   uvicorn main:app --host 0.0.0.0 --port 8001
   ```
3. No backend principal (Railway, etc.), configurar:
   ```
   INFERENCE_BACKEND=self_hosted
   SELF_HOSTED_INFERENCE_URL=http://<ip-publico-da-vm>:8001
   SELF_HOSTED_INFERENCE_TOKEN=<mesmo-valor-do-passo-2>
   ```

### Por que o protocolo não reusa o path do arquivo

`LocalBackend` roda no mesmo processo do resto do app, então passar `image_path` funciona.
`SelfHostedBackend` chama uma máquina diferente — o path não existe lá. Por isso ele lê os
bytes do arquivo e envia via `multipart/form-data`; o servidor em `inference_server/main.py`
nunca recebe nem resolve paths, só bytes de imagem — reduz a superfície de ataque de um
endpoint que, por estar numa VM Oracle, já está exposto num IP público.

### Risco que o token não resolve sozinho

O Bearer token evita acesso não autenticado, mas **não** criptografa o tráfego — `http://`
simples entre Railway e a VM Oracle passa a imagem do usuário em texto claro pela internet.
Pra dados sensíveis, isso exige TLS (reverse proxy com Caddy/nginx + Let's Encrypt na VM,
grátis) antes de ir pra produção — não implementado aqui por escopo, mas é bloqueador, não
nice-to-have, se as fotos não forem publicamente triviais.

## O que falta para produção (não implementado neste skeleton, por escopo)

- Fila persistente (Redis/RQ ou Celery) — a fila atual é in-memory e perde jobs em
  restart do processo.
- Storage em objeto (S3/GCS) — implementar `PhotoStorage`.
- Autenticação/autorização nas rotas.
- Rate limiting no upload.
- Métrica de latência por estágio (já capturada em `InferenceResult.latency_ms`, falta
  exportar para observabilidade).

## Testes

```bash
pytest tests/ -v
```

Os testes mockam `inference/registry.get_backend` (ou `httpx.post`, no caso do
`SelfHostedBackend`), então rodam sem `transformers`/`torch` instalados — só a lógica de
orquestração, o gate de moderação e o contrato HTTP do backend self-hosted são exercitados.
