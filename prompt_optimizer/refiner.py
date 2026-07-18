"""Refinamento opcional do prompt via API do Claude.

Usa structured outputs (`messages.parse` + Pydantic) para que a resposta
seja SEMPRE um objeto validado no schema — o mecanismo mais determinístico
disponível na API. O modelo apenas preenche/reescreve o template produzido
pelo motor de regras; a estrutura em si é decidida deterministicamente.
"""

from __future__ import annotations

from pydantic import BaseModel, Field

import anthropic

MODEL = "claude-opus-4-8"

_SYSTEM = """\
Você é um engenheiro de prompts especializado nas práticas da Anthropic.
Recebe um prompt já estruturado em tags XML, possivelmente com placeholders
[PREENCHER: ...], e o reescreve para máxima clareza e eficiência.

Regras:
- Preserve a intenção original do usuário; não invente fatos ou dados.
- Mantenha a estrutura em tags XML (<papel>, <contexto>, <tarefa>,
  <restricoes>, <exemplos>, <formato>).
- Onde houver placeholder e a intenção permitir inferir um preenchimento
  razoável, preencha; caso contrário, mantenha o placeholder e registre uma
  pergunta em perguntas_abertas.
- Instruções explícitas e positivas; sem ênfases agressivas (CRITICAL, MUST).
- Escreva em português do Brasil."""


class RefinedPrompt(BaseModel):
    """Schema da resposta — validado pela API (structured outputs)."""

    prompt_otimizado: str = Field(
        description="O prompt final reescrito, estruturado em tags XML."
    )
    mudancas: list[str] = Field(
        description="Lista objetiva das mudanças aplicadas e por quê."
    )
    perguntas_abertas: list[str] = Field(
        description="Informações que só o usuário pode fornecer para "
        "melhorar ainda mais o prompt."
    )


def refine(structured_prompt: str, original_prompt: str) -> RefinedPrompt:
    """Envia o template ao Claude e retorna o objeto validado."""
    client = anthropic.Anthropic()
    response = client.messages.parse(
        model=MODEL,
        max_tokens=16000,
        thinking={"type": "adaptive"},
        system=_SYSTEM,
        messages=[{
            "role": "user",
            "content": (
                f"<prompt_original>\n{original_prompt}\n</prompt_original>\n\n"
                f"<prompt_estruturado>\n{structured_prompt}\n"
                f"</prompt_estruturado>\n\n"
                "Reescreva o prompt estruturado seguindo as regras."
            ),
        }],
        output_format=RefinedPrompt,
    )
    return response.parsed_output
