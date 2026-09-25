"""Carga e validação do dataset rotulado (JSONL).

Formato de cada linha:
    {"id": "p01", "prompt": "...", "labels": {"tarefa_explicita": true, ...}}

Todas as chaves de `questions.KEYS` são obrigatórias em `labels`; um
dataset incompleto falha na carga, não no meio da execução paga.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from .questions import KEYS


@dataclass(frozen=True)
class Example:
    id: str
    prompt: str
    labels: dict[str, bool]


def load(path: str | Path) -> list[Example]:
    examples: list[Example] = []
    seen: set[str] = set()
    with open(path, encoding="utf-8") as fh:
        for lineno, line in enumerate(fh, 1):
            if not line.strip():
                continue
            try:
                row = json.loads(line)
            except json.JSONDecodeError as exc:
                raise ValueError(f"{path}:{lineno}: JSON inválido ({exc})")
            ex_id, prompt, labels = row.get("id"), row.get("prompt"), row.get("labels")
            if not isinstance(ex_id, str) or not ex_id:
                raise ValueError(f"{path}:{lineno}: 'id' ausente")
            if ex_id in seen:
                raise ValueError(f"{path}:{lineno}: id duplicado '{ex_id}'")
            if not isinstance(prompt, str) or not prompt.strip():
                raise ValueError(f"{path}:{lineno}: 'prompt' vazio")
            if not isinstance(labels, dict):
                raise ValueError(f"{path}:{lineno}: 'labels' ausente")
            missing = [k for k in KEYS if k not in labels]
            extra = [k for k in labels if k not in KEYS]
            if missing or extra:
                raise ValueError(
                    f"{path}:{lineno}: labels inválidos "
                    f"(faltando={missing}, desconhecidos={extra})"
                )
            if not all(isinstance(labels[k], bool) for k in KEYS):
                raise ValueError(f"{path}:{lineno}: labels devem ser booleanos")
            seen.add(ex_id)
            examples.append(Example(ex_id, prompt, {k: labels[k] for k in KEYS}))
    if not examples:
        raise ValueError(f"{path}: dataset vazio")
    return examples
