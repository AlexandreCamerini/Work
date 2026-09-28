#!/usr/bin/env python3
"""Aplica as trocas de texto do quiz (linguagem simples) nos JSON do app.

Lê, nesta ordem:
  - pipeline/ux/textos-propostos.json   (125 trocas da revisão A-linguagem.md)
  - pipeline/ux/textos-cenas-curtas.json (2 cenas encurtadas para caber sem rolar)

Para cada troca:
  - texto atual == "depois" -> já aplicada, pula;
  - texto atual == "antes"  -> troca;
  - outro texto             -> erro, nada é gravado.

Só mexe em `cena`, `pergunta` e `texto` de opção. Nunca altera `id`, `preferencia`, `grupo`,
`publico`, `fato` nem qualquer outro campo: ao final confere que tudo fora desses três campos
ficou idêntico, e aborta sem gravar se não ficou.

Opções mantidas por decisão do produto (seção "Precisa reavaliação" de A-linguagem.md) não
podem ser tocadas: se alguma troca mirar nelas, o script aborta.

Idempotente: rodar de novo não muda nada. Grava com indent=2 e ensure_ascii=False.

Uso:
  python3 pipeline/ux/aplicar_textos.py            # aplica e grava
  python3 pipeline/ux/aplicar_textos.py --conferir # só diz o que faria (exit 1 se falta aplicar)
"""
from __future__ import annotations

import argparse
import copy
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
ARQUIVOS = {
    "governador-rj": RAIZ / "src/data/quiz.json",
    "presidente": RAIZ / "src/data/quiz-presidente.json",
}
TROCAS = [
    RAIZ / "pipeline/ux/textos-propostos.json",
    RAIZ / "pipeline/ux/textos-cenas-curtas.json",
]

# Decisão do dono do produto (25/09/2026): estas opções mantêm o texto atual.
MANTIDAS = {
    ("presidente", "escala-6x1", "opcao:b"),
    ("governador-rj", "operacao-policial", "opcao:b"),
    ("governador-rj", "via-expressa-fechada", "opcao:b"),
    ("presidente", "trabalho-app", "opcao:b"),
}


def sem_textos(quiz: dict) -> dict:
    """Cópia do quiz sem os campos que podem mudar (para conferir que o resto ficou igual)."""
    q = copy.deepcopy(quiz)
    for p in q["perguntas"]:
        p.pop("cena", None)
        p.pop("pergunta", None)
        for o in p["opcoes"]:
            o.pop("texto", None)
    return q


def localizar(quiz: dict, pergunta_id: str, campo: str) -> tuple[dict, str]:
    perg = next((q for q in quiz["perguntas"] if q["id"] == pergunta_id), None)
    if perg is None:
        raise KeyError(f"pergunta {pergunta_id} não existe")
    if campo in ("cena", "pergunta"):
        return perg, campo
    if campo.startswith("opcao:"):
        oid = campo.split(":", 1)[1]
        op = next((o for o in perg["opcoes"] if o["id"] == oid), None)
        if op is None:
            raise KeyError(f"{pergunta_id}: opção {oid} não existe")
        return op, "texto"
    raise KeyError(f"{pergunta_id}: campo desconhecido {campo}")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--conferir", action="store_true", help="não grava; exit 1 se alguma troca falta")
    args = ap.parse_args()

    dados = {k: json.loads(v.read_text(encoding="utf-8")) for k, v in ARQUIVOS.items()}
    originais = {k: sem_textos(v) for k, v in dados.items()}

    trocas = []
    for arq in TROCAS:
        trocas += json.loads(arq.read_text(encoding="utf-8"))

    aplicadas, puladas, erros = 0, 0, []
    for t in trocas:
        chave = (t["eleicao"], t["pergunta_id"], t["campo"])
        rotulo = "/".join(chave)
        if chave in MANTIDAS:
            erros.append(f"{rotulo}: opção mantida por decisão do produto, não pode ser trocada")
            continue
        try:
            alvo, campo = localizar(dados[t["eleicao"]], t["pergunta_id"], t["campo"])
        except KeyError as e:
            erros.append(f"{t['eleicao']}: {e}")
            continue
        atual = alvo[campo]
        if atual == t["depois"]:
            puladas += 1
        elif atual == t["antes"]:
            alvo[campo] = t["depois"]
            aplicadas += 1
        else:
            erros.append(f"{rotulo}: texto atual não é o 'antes' nem o 'depois': {atual!r}")

    for k, v in dados.items():
        if sem_textos(v) != originais[k]:
            erros.append(f"{k}: algum campo fora de cena/pergunta/texto mudou")

    if erros:
        print(f"{len(erros)} erro(s); nada foi gravado:")
        for e in erros:
            print("  -", e)
        return 2

    print(f"{len(trocas)} trocas: {aplicadas} aplicadas agora, {puladas} já estavam aplicadas.")
    if args.conferir:
        return 1 if aplicadas else 0

    for k, caminho in ARQUIVOS.items():
        novo = json.dumps(dados[k], indent=2, ensure_ascii=False) + "\n"
        if caminho.read_text(encoding="utf-8") != novo:
            caminho.write_text(novo, encoding="utf-8")
            print(f"gravado: {caminho.relative_to(RAIZ)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
