# POC — Jev (TypeSafe) como camada "Sistema 1"

Objetivo: decidir **com dados** se o Jev entra no stack como camada de
decisão rápida (roteamento, triagem, guardrails), com o Claude como
"Sistema 2". O harness compara três providers na mesma tarefa e aplica um
gate de aceite automático.

## Tarefa avaliada

As 8 decisões binárias do diagnóstico do `prompt_optimizer`
(`decision_eval/questions.py`): tarefa explícita, papel, contexto, formato,
exemplos, restrições, ausência de linguagem agressiva, tags XML.
Cada prompt gera 8 decisões enviadas **numa única requisição** por provider,
que é o caso de uso nativo do Jev (várias Nouls paralelas sobre o mesmo
`state`).

| Provider | Como decide | Probabilidade |
|---|---|---|
| `rules` | regex do motor atual | 0 ou 1 (sem incerteza) |
| `jev` | `POST /v1/systemone`, uma `noul` por critério | calibrada por treino (RLCD) |
| `claude` | Haiku 4.5 + structured outputs | **verbalizada** pelo modelo |

## Métricas

- **Acurácia** (limiar 0.5) e **Brier**.
- **ECE** — erro de calibração sobre a confiança `max(p, 1-p)`, 10 bins.
- **Cobertura/acurácia auto** — fração de decisões com confiança ≥
  `--auto-threshold` (padrão 0.9) e a acurácia nelas. É o número que importa
  para o padrão de degradação: é o que o código executaria sem revisão.
- **Latência p50/p95** por requisição e **US$/1k decisões**.

## Gate de aceite (`decision_eval/gate.py`)

O Jev é **APROVADO** só se, contra o Claude:

1. amostra ≥ 200 exemplos (abaixo disso: **INCONCLUSIVO**);
2. taxa de erro de requisição ≤ 5%;
3. acurácia ≥ acurácia do Claude − 0,02;
4. ECE ≤ 0,05;
5. ≥ 10x melhor em latência p95 **ou** em custo/1k decisões.

## Como rodar

```bash
pip install -r requirements.txt

# Smoke test, sem custo e sem rede
python -m decision_eval --providers rules

# POC completo
export TYPESAFE_API_KEY=...        # https://typesafe.ai
export ANTHROPIC_API_KEY=...       # ou `ant auth login`
python -m decision_eval --providers rules,jev,claude --out results/
```

Opções: `--data` (JSONL próprio), `--limit N`, `--concurrency` (padrão 4),
`--auto-threshold`. Variáveis: `JEV_MODEL` (padrão `jev-1.13.0`, fixado de
propósito — limiares calibrados não sobrevivem a `jev-latest`),
`TYPESAFE_BASE_URL`, `CLAUDE_EVAL_MODEL` (`claude-haiku-4-5` padrão;
`claude-sonnet-5`/`claude-opus-5` aceitos).

Saídas em `--out`: `predictions.jsonl` (bruto, permite recalcular métricas
sem nova chamada paga), `metrics.json`, `report.md`.

Custo estimado do POC com 300 exemplos: Jev < US$ 0,01; Haiku ≈ US$ 0,45
(~900 tokens de entrada e ~120 de saída por requisição).

## Degradação

- Provider sem credencial ou que falha no **preflight** (1º exemplo) é
  pulado com aviso — não gasta o lote em erros.
- Erro em requisição individual vira `Prediction.error`: sai das métricas
  de qualidade e entra na taxa de erro (critério 2 do gate).
- Jev: retry em 429/5xx respeitando `Retry-After` (máx. 3); 4xx falha direto.
- Claude: `refusal` e saída não parseável viram erro; retries ficam com o SDK.

## Limitações — leia antes de confiar no resultado

1. **Dataset seed = 32 exemplos, rotulados por uma única pessoa (o
   próprio Claude que escreveu o harness).** Serve para validar o harness,
   não para decidir. O gate devolve INCONCLUSIVO de propósito. Para decidir:
   ≥ 200 prompts **reais** do seu uso, rotulados por humano, com uma parte
   com dois rotuladores para medir concordância.
2. **Viés a favor do `rules`**: parte dos exemplos coincide com os padrões
   regex. O seed também inclui casos semânticos que o regex erra ("pense como
   um investidor", "seja meu coach", "NUNCA" em caps), mas a proporção não
   reflete a distribuição real.
3. **Probabilidade verbalizada do Claude não é calibrada por construção** —
   comparar ECE do Jev com ela é justo para *este uso*, mas não mede o teto do
   Claude (logprobs não estão disponíveis na API).
4. A API do Jev foi implementada a partir de documentação pública de
   terceiros (endpoint `/v1/systemone`, formato `noul`); o harness falha
   explicitamente se o formato da resposta divergir.
5. Preços são constantes em `providers.py`; confirme antes de usar custo
   como critério.
