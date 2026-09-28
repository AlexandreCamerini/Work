# Photo App — skeleton com pipeline Hugging Face

Upload de foto → moderação (gate) → tagging / caption / remoção de fundo, cada um
via um modelo do Hugging Face Hub, acessado por uma interface trocável entre execução
local e HF Inference Endpoint.

## Arquitetura

```
api/routes.py          → upload dispara um job; consulta de status por job_id
pipeline/queue.py       → fila in-process (troque por Redis/RQ quando o volume pedir)
pipeline/orchestrator.py→ moderação é GATE bloqueante; demais estágios rodam em paralelo e são best-effort
models/*.py             → um wrapper por modelo HF (moderation, clip_tagging, captioning, background_removal)
inference/registry.py   → escolhe LocalBackend ou HFEndpointBackend por env var (INFERENCE_BACKEND)
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

Os testes mockam `inference/registry.get_backend`, então rodam sem `transformers`/`torch`
instalados — só a lógica de orquestração e o gate de moderação são exercitados.
