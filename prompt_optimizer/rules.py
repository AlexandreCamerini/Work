"""Motor determinístico de análise de prompts.

Nenhuma regra usa LLM: mesma entrada produz sempre o mesmo diagnóstico.
Cada regra verifica a presença de um componente recomendado pela Anthropic
(papel, contexto, tarefa clara, formato de saída, exemplos, restrições).
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field


def _normalize(text: str) -> str:
    """Minúsculas e sem acentos, para casar padrões de forma estável."""
    nfkd = unicodedata.normalize("NFD", text.lower())
    return "".join(c for c in nfkd if unicodedata.category(c) != "Mn")


# Verbos de ação que indicam uma tarefa explícita (forma sem acento).
_ACTION_VERBS = (
    "resuma", "resumir", "escreva", "escrever", "liste", "listar", "analise",
    "analisar", "crie", "criar", "gere", "gerar", "traduza", "traduzir",
    "explique", "explicar", "compare", "comparar", "classifique",
    "classificar", "extraia", "extrair", "revise", "revisar", "corrija",
    "corrigir", "calcule", "calcular", "identifique", "identificar",
    "descreva", "descrever", "converta", "converter", "avalie", "avaliar",
    "implemente", "implementar", "refatore", "refatorar", "documente",
    "documentar", "sugira", "sugerir", "elabore", "elaborar", "monte",
    "montar", "responda", "responder", "summarize", "write", "list",
    "analyze", "create", "generate", "translate", "explain", "compare",
    "classify", "extract", "review", "fix", "calculate", "identify",
    "describe", "convert", "evaluate", "implement", "refactor", "document",
)

_ROLE_PATTERNS = (
    r"\bvoce e um[a]?\b", r"\bvoce sera\b", r"\baja como\b", r"\batue como\b",
    r"\bassuma o papel\b", r"\bcomo um[a]? (especialista|expert|analista|"
    r"engenheir|advogad|medic|professor)\b",
    r"\byou are a\b", r"\bact as\b", r"\bassume the role\b",
)

_FORMAT_PATTERNS = (
    r"\bformato\b", r"\bem topicos\b", r"\blista numerada\b", r"\bbullet",
    r"\bjson\b", r"\btabela\b", r"\bmarkdown\b", r"\bno maximo \d+",
    r"\bem ate \d+", r"\bformat\b", r"\bnumbered list\b", r"\btable\b",
    r"\bestrutur", r"\bsaida\b", r"\boutput\b",
)

_EXAMPLE_PATTERNS = (
    r"\bexemplo", r"\bpor exemplo\b", r"\bexample", r"\be\.g\.", r"\bex:\b",
    r"<exemplo", r"<example",
)

_CONSTRAINT_PATTERNS = (
    r"\bnao (use|inclua|mencione|adicione|cite|invente)\b", r"\bevite\b",
    r"\bapenas\b", r"\bsomente\b", r"\bexceto\b", r"\bsem (usar|incluir)\b",
    r"\blimite\b", r"\brestri", r"\bdo not\b", r"\bdon't\b", r"\bavoid\b",
    r"\bonly\b", r"\bexcept\b",
)

_CONTEXT_PATTERNS = (
    r"\bcontexto\b", r"\bconsiderando\b", r"\bcom base (em|no|na)\b",
    r"\ba seguir\b", r"\babaixo\b", r"\bsegue\b", r"\bdado que\b",
    r"\bcontext\b", r"\bbased on\b", r"\bgiven\b", r"<contexto", r"<context",
    r"\bpara (o|a|um|uma) (time|equipe|cliente|diretoria|publico)\b",
)

_AGGRESSIVE_PATTERNS = (
    r"\bcritical\b", r"\byou must\b", r"\bmuito importante\b",
    r"\bobrigatoriamente\b", r"\bnunca jamais\b", r"\bsempre sempre\b",
    r"!!+",
)

_VAGUE_ONLY_PATTERNS = (
    r"^\s*(melhore|arrume|ajeite|conserte|otimize|veja|olhe|analisa)\s+"
    r"(isso|isto|esse|este|aqui)\b",
    r"^\s*(me ajuda|help|ajuda)\s*\??\s*$",
)


@dataclass
class Finding:
    """Resultado de uma regra: o que foi detectado e a recomendação."""

    rule: str
    ok: bool
    message: str


@dataclass
class Analysis:
    """Diagnóstico completo de um prompt."""

    prompt: str
    findings: list[Finding] = field(default_factory=list)

    @property
    def score(self) -> int:
        """Pontuação de 0 a 100 baseada nas regras satisfeitas."""
        if not self.findings:
            return 0
        ok = sum(1 for f in self.findings if f.ok)
        return round(100 * ok / len(self.findings))

    def has(self, rule: str) -> bool:
        return any(f.rule == rule and f.ok for f in self.findings)


def _matches_any(norm: str, patterns: tuple[str, ...]) -> bool:
    return any(re.search(p, norm) for p in patterns)


def analyze(prompt: str) -> Analysis:
    """Aplica todas as regras determinísticas ao prompt."""
    norm = _normalize(prompt)
    words = len(prompt.split())
    findings: list[Finding] = []

    findings.append(Finding(
        "tarefa_explicita",
        _matches_any(norm, tuple(rf"\b{v}\b" for v in _ACTION_VERBS))
        and not _matches_any(norm, _VAGUE_ONLY_PATTERNS),
        "A tarefa deve começar com um verbo de ação e dizer exatamente o que "
        "produzir (ex.: 'Resuma X em 5 tópicos').",
    ))
    findings.append(Finding(
        "papel_definido",
        _matches_any(norm, _ROLE_PATTERNS),
        "Definir um papel ('Você é um analista financeiro sênior...') "
        "estabiliza tom e profundidade. Ideal no system prompt.",
    ))
    findings.append(Finding(
        "contexto_presente",
        _matches_any(norm, _CONTEXT_PATTERNS) or words > 60,
        "Inclua o contexto necessário (público-alvo, dados, objetivo de "
        "negócio) antes da tarefa, delimitado em <contexto>.",
    ))
    findings.append(Finding(
        "formato_de_saida",
        _matches_any(norm, _FORMAT_PATTERNS),
        "Especifique o formato da resposta (tópicos, tabela, JSON, limite de "
        "tamanho) para eliminar variação estrutural.",
    ))
    findings.append(Finding(
        "exemplos",
        _matches_any(norm, _EXAMPLE_PATTERNS),
        "Para tarefas com formato específico, 1-3 exemplos de entrada→saída "
        "(few-shot) ensinam mais que instruções.",
    ))
    findings.append(Finding(
        "restricoes",
        _matches_any(norm, _CONSTRAINT_PATTERNS),
        "Declare limites e escopo (o que ignorar, tamanho máximo, fontes "
        "permitidas) — preferindo instruções positivas.",
    ))
    findings.append(Finding(
        "sem_linguagem_agressiva",
        not _matches_any(norm, _AGGRESSIVE_PATTERNS),
        "Modelos recentes seguem instruções literalmente: remova ênfases "
        "tipo 'CRITICAL/YOU MUST' — causam comportamento exagerado.",
    ))
    findings.append(Finding(
        "usa_tags_xml",
        bool(re.search(r"<[a-z_]+>", norm)),
        "Delimite seções com tags XML (<contexto>, <tarefa>, <formato>) — o "
        "Claude foi treinado para reconhecer essa estrutura.",
    ))

    return Analysis(prompt=prompt, findings=findings)
