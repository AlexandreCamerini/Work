# Prompt Optimizer — Mecânica de Prompts do Claude

Aplicação determinística que transforma prompts "crus" em prompts estruturados e
eficientes para o Claude, seguindo as práticas oficiais de engenharia de prompt
da Anthropic.

## Como funciona

A aplicação tem **duas camadas**:

1. **Motor determinístico (sem LLM)** — analisa o prompt com regras fixas,
   identifica o que está faltando (papel, contexto, formato de saída, exemplos,
   restrições) e reconstrói o prompt em um template estruturado com tags XML.
   Mesma entrada → mesma saída, sempre. Não gasta tokens.

2. **Refinamento opcional via API do Claude** — envia o prompt já estruturado
   para o Claude (`claude-opus-4-8`) reescrever com *structured outputs*
   (schema JSON validado), garantindo resposta sempre parseável e no formato
   esperado.

```
prompt cru ──▶ [análise por regras] ──▶ [template XML] ──▶ prompt otimizado
                                             │
                                             └──(opcional --refine)──▶ Claude API
```

## Instalação

```bash
pip install -r requirements.txt
```

## Uso

```bash
# Modo 100% determinístico (padrão)
python -m prompt_optimizer "resuma esse documento"

# Apenas o diagnóstico (o que falta no prompt)
python -m prompt_optimizer --analyze "resuma esse documento"

# Com refinamento via Claude API (requer ANTHROPIC_API_KEY)
python -m prompt_optimizer --refine "resuma esse documento"

# Ler o prompt de um arquivo e salvar o resultado
python -m prompt_optimizer -f meu_prompt.txt -o prompt_otimizado.txt
```

## A mecânica de prompts do Claude (resumo)

Leia o guia completo em [`docs/GUIA-PROMPTS.md`](docs/GUIA-PROMPTS.md). Os
princípios que o motor determinístico aplica:

| Princípio | Por quê |
|---|---|
| **Papel (role)** no system prompt | Define comportamento e tom de forma estável |
| **Contexto antes da tarefa** | O Claude processa o prompt em ordem; contexto primeiro melhora a compreensão |
| **Tags XML** (`<contexto>`, `<tarefa>`, `<formato>`) | O Claude foi treinado para reconhecer estrutura XML — reduz ambiguidade |
| **Instruções explícitas e literais** | Modelos recentes (Opus 4.7+/Fable 5) seguem instruções ao pé da letra; nada de "CRITICAL: YOU MUST" |
| **Exemplos (few-shot)** | Exemplos positivos ensinam melhor que instruções negativas |
| **Formato de saída explícito** | Elimina variação na estrutura da resposta |
| **Structured outputs** (`output_config.format`) | Único mecanismo que *garante* JSON válido no schema — substitui o antigo prefill |
| **Conteúdo estável primeiro** | Habilita prompt caching (match por prefixo — qualquer byte alterado invalida o cache dali em diante) |

## Estrutura do projeto

```
prompt_optimizer/
  rules.py        # motor determinístico: análise + diagnóstico
  templates.py    # reconstrução do prompt em template XML
  refiner.py      # refinamento opcional via Claude API (structured outputs)
  cli.py          # interface de linha de comando
decision_eval/    # POC: Jev (TypeSafe) vs Claude vs regras — ver docs/POC-JEV.md
data/
  prompt_quality_seed.jsonl  # 32 prompts rotulados (seed do POC)
docs/
  GUIA-PROMPTS.md # guia da mecânica de prompts do Claude
  POC-JEV.md      # desenho, métricas e gate de aceite do POC Jev
tests/
  test_rules.py          # testes do motor determinístico
  test_decision_eval.py  # testes do harness (sem rede)
```
