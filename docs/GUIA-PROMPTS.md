# Guia — Mecânica de Prompts do Claude

Este guia explica como o Claude processa prompts e quais alavancas realmente
mudam a qualidade do resultado. É a base conceitual do motor determinístico
desta aplicação.

## 1. Anatomia de uma requisição

Toda chamada à API do Claude passa por `POST /v1/messages` e tem três blocos,
renderizados **nesta ordem**:

```
tools  →  system  →  messages
```

- **`system`** — instruções de comportamento: papel, tom, restrições, regras.
  É o lugar do "quem você é e como trabalha".
- **`messages`** — a conversa em turnos `user`/`assistant`. É o lugar da
  tarefa, do contexto e dos dados.
- **`tools`** — ferramentas que o modelo pode chamar (function calling).

A ordem importa por causa do **prompt caching** (seção 6): o cache é um match
de prefixo, então conteúdo estável deve vir antes de conteúdo volátil.

## 2. Os componentes de um prompt eficiente

Ordem recomendada pela Anthropic dentro de um prompt:

1. **Papel/persona** (no `system`) — "Você é um analista financeiro sênior..."
2. **Contexto e dados** — documentos, tabelas, histórico. Em tarefas com
   documentos longos, coloque o documento **antes** da pergunta (melhora
   significativamente a qualidade em contexto longo).
3. **Tarefa** — o que fazer, explícito e sem ambiguidade.
4. **Restrições** — o que NÃO fazer, limites, escopo.
5. **Exemplos (few-shot)** — 1 a 5 exemplos de entrada→saída esperada.
6. **Formato de saída** — estrutura exata da resposta (tópicos, JSON, tabela).

## 3. Tags XML — a estrutura que o Claude entende

O Claude foi treinado com prompts estruturados em XML. Delimitar seções com
tags elimina ambiguidade sobre onde termina o contexto e começa a instrução:

```xml
<contexto>
Relatório de vendas do Q3 da empresa X...
</contexto>

<tarefa>
Resuma os 3 principais riscos apontados no relatório.
</tarefa>

<formato>
Lista numerada, cada item com no máximo 2 frases.
</formato>
```

Não existe um conjunto "oficial" de tags — o que importa é consistência e
nomes descritivos.

## 4. Instruções explícitas e literais

Os modelos recentes (Opus 4.7/4.8, Sonnet 5, Fable 5) seguem instruções de
forma **muito mais literal** que gerações anteriores:

- ✅ "Use a ferramenta de busca quando a resposta depender de dados atuais."
- ❌ "CRITICAL: YOU MUST ALWAYS use the search tool!" → causa uso excessivo.
- Se uma instrução deve valer para tudo, **diga o escopo**: "Aplique essa
  formatação a todas as seções, não só à primeira."
- Exemplos positivos (mostrar o desejado) funcionam melhor que listas de
  proibições.

## 5. Determinismo: o que é possível e o que não é

LLMs são probabilísticos por natureza. Nos modelos atuais (Opus 4.7+,
Sonnet 5, Fable 5) os parâmetros `temperature`/`top_p`/`top_k` foram
**removidos da API** — enviar qualquer um retorna erro 400. As alavancas
reais de previsibilidade hoje são:

| Alavanca | O que garante |
|---|---|
| **Structured outputs** (`output_config.format` com JSON Schema) | Saída *sempre* válida no schema — é garantia, não sugestão |
| **Strict tool use** (`strict: true` na ferramenta) | Parâmetros de tool calls sempre válidos no schema |
| **Prompt fixo + template** | Mesma estrutura de entrada → comportamento muito mais estável |
| **Instruções de formato explícitas** | Reduz variação estrutural da resposta |

> O antigo *prefill* (pré-preencher o turno do assistant com `{"nome": "`)
> foi removido — retorna 400 nos modelos 4.6+. Structured outputs é o
> substituto correto.

Exemplo de structured output (Python):

```python
from pydantic import BaseModel
import anthropic

class Resultado(BaseModel):
    resumo: str
    riscos: list[str]

client = anthropic.Anthropic()
resp = client.messages.parse(
    model="claude-opus-4-8",
    max_tokens=16000,
    messages=[{"role": "user", "content": "..."}],
    output_format=Resultado,
)
print(resp.parsed_output.riscos)  # objeto validado, nunca JSON quebrado
```

## 6. Prompt caching — por que a ordem do prompt importa

O cache é um **match de prefixo exato**: qualquer byte alterado invalida tudo
dali para frente. Regras práticas:

- System prompt **congelado** — nunca interpolar data/hora, IDs ou nome do
  usuário no `system`. Conteúdo dinâmico vai no final das `messages`.
- Ferramentas em ordem determinística (renderizam na posição 0).
- Marque o fim do prefixo estável com `cache_control: {"type": "ephemeral"}`.
- Leituras de cache custam ~10% do preço; economia de até 90% em contexto
  repetido.

## 7. Thinking e effort

- **Adaptive thinking** (`thinking: {"type": "adaptive"}`) — o modelo decide
  quando e quanto raciocinar. É o modo recomendado nos modelos 4.6+
  (`budget_tokens` foi removido).
- **Effort** (`output_config: {"effort": "low|medium|high|xhigh|max"}`) —
  controla profundidade de raciocínio e gasto de tokens. `high` é o padrão;
  `xhigh` para código/agentes difíceis; `low` para tarefas simples e rápidas.

## 8. Erros comuns que este otimizador corrige

| Erro | Correção aplicada |
|---|---|
| Prompt vago ("melhore isso") | Exige tarefa explícita com verbo + objeto + critério |
| Sem papel definido | Sugere/insere bloco de papel no system |
| Contexto misturado com instrução | Separa em tags XML |
| Sem formato de saída | Insere bloco `<formato>` explícito |
| Pedido de "não faça X" sem alternativa | Reformula como instrução positiva |
| Múltiplas tarefas em uma frase | Divide em passos numerados |

## Referências

- [Prompt engineering — Anthropic docs](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
- [Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- [Adaptive thinking](https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking)
