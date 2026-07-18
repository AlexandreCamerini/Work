"""Reconstrução determinística do prompt em template estruturado.

A partir do diagnóstico de `rules.analyze`, monta um prompt no formato
recomendado pela Anthropic: papel → contexto → tarefa → restrições →
formato de saída, delimitados por tags XML. Lacunas viram placeholders
`[PREENCHER: ...]` para o usuário completar — nada é inventado.
"""

from __future__ import annotations

from .rules import Analysis

_ROLE_PLACEHOLDER = (
    "[PREENCHER: papel — ex.: 'Você é um analista de dados sênior "
    "especializado em telecom']"
)
_CONTEXT_PLACEHOLDER = (
    "[PREENCHER: contexto — para quem é o resultado, dados de entrada, "
    "objetivo de negócio]"
)
_FORMAT_PLACEHOLDER = (
    "[PREENCHER: formato — ex.: 'Lista numerada com até 5 itens, cada um "
    "com no máximo 2 frases']"
)
_CONSTRAINT_PLACEHOLDER = (
    "[OPCIONAL: restrições — escopo, tamanho máximo, o que ignorar]"
)
_EXAMPLE_PLACEHOLDER = (
    "[OPCIONAL: 1-3 exemplos de entrada → saída esperada]"
)


def build_optimized_prompt(analysis: Analysis) -> str:
    """Monta o prompt otimizado. Determinístico: só reorganiza e sinaliza."""
    original = analysis.prompt.strip()

    role = "" if analysis.has("papel_definido") else _ROLE_PLACEHOLDER

    # O texto original vai para a seção que lhe corresponde, sem duplicar:
    # se há tarefa explícita, ele É a tarefa; senão fica como referência no
    # contexto e a tarefa vira um placeholder de reescrita.
    if analysis.has("tarefa_explicita"):
        task = original
        context = (original if analysis.has("contexto_presente")
                   else _CONTEXT_PLACEHOLDER)
    else:
        task = ("[PREENCHER: reescreva como verbo + objeto + critério de "
                f"pronto. Original: \"{original}\"]")
        context = (original if analysis.has("contexto_presente")
                   else f"{_CONTEXT_PLACEHOLDER}\n\n{original}")

    sections = []
    if role:
        sections.append(f"<papel>\n{role}\n</papel>")
    sections.append(f"<contexto>\n{context}\n</contexto>")
    sections.append(f"<tarefa>\n{task}\n</tarefa>")
    if not analysis.has("restricoes"):
        sections.append(f"<restricoes>\n{_CONSTRAINT_PLACEHOLDER}\n</restricoes>")
    if not analysis.has("exemplos"):
        sections.append(f"<exemplos>\n{_EXAMPLE_PLACEHOLDER}\n</exemplos>")
    if not analysis.has("formato_de_saida"):
        sections.append(f"<formato>\n{_FORMAT_PLACEHOLDER}\n</formato>")

    return "\n\n".join(sections)


def render_report(analysis: Analysis) -> str:
    """Relatório legível do diagnóstico."""
    lines = [f"Pontuação do prompt: {analysis.score}/100", ""]
    for f in analysis.findings:
        mark = "✓" if f.ok else "✗"
        lines.append(f" {mark} {f.rule}")
        if not f.ok:
            lines.append(f"    → {f.message}")
    return "\n".join(lines)
