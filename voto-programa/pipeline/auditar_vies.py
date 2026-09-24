"""Audita viés estrutural da tabela de aderência antes de publicar.

Dois testes, com a mesma conta do site (src/lib/matching.ts, pontoNaCena):
  1. Eleitor aleatório: 20 mil respostas sorteadas. Não precisa dar empate, mas um
     candidato em 1º na maioria dos sorteios indica nota inflada ou cena desequilibrada.
  2. Eleitor-espelho: escolhe, em cada cena, a opção de maior nota de um candidato. Esse
     candidato deveria ficar em 1º; se não fica, as notas dele estão comprimidas ou outro
     candidato recebe nota alta em tudo.

Só lê arquivos; roda sem API. Se a conta do site mudar, mude aqui também.

Uso:
  python pipeline/auditar_vies.py --eleicao governador-rj
"""

from __future__ import annotations

import argparse
import json
import random
from collections import Counter

import aderencia

NOTA_NEUTRA = 50
COBERTURA_MINIMA = 3
SORTEIOS = 20_000


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--eleicao", choices=aderencia.ELEICOES, default="governador-rj")
    args = ap.parse_args()
    aderencia.usar_eleicao(args.eleicao)

    quiz = json.loads(aderencia.QUIZ.read_text(encoding="utf-8"))
    itens = json.loads(aderencia.SAIDA.read_text(encoding="utf-8"))["itens"]
    candidatos = sorted({c for po in itens.values() for pc in po.values() for c in pc})

    # uma cena por grupo, a padrão (sem público), como vê quem pula o perfil
    cenas, grupos = [], set()
    for p in quiz["perguntas"]:
        if not p.get("publico") and p["grupo"] not in grupos:
            grupos.add(p["grupo"])
            cenas.append(p)

    def nota(p: dict, oid: str, c: str) -> int | None:
        return itens[p["id"]][oid][c]["nota"]

    def ponto(p: dict, oid: str, c: str) -> float | None:
        n = nota(p, oid, c)
        if n is None:
            return None
        ref = [nota(p, o["id"], c) for o in p["opcoes"]]
        media = sum(NOTA_NEUTRA if r is None else r for r in ref) / len(ref)
        return min(100.0, max(0.0, NOTA_NEUTRA + n - media))

    def placar(escolhas: list[tuple[dict, str]]) -> dict[str, float]:
        saida = {}
        for c in candidatos:
            pts = [v for p, oid in escolhas if (v := ponto(p, oid, c)) is not None]
            if len(pts) >= COBERTURA_MINIMA:
                saida[c] = sum(pts) / len(pts)
        return saida

    rng = random.Random(1)
    vitorias: Counter[str] = Counter()
    for _ in range(SORTEIOS):
        sc = placar([(p, rng.choice(p["opcoes"])["id"]) for p in cenas])
        vitorias[max(sc, key=sc.get)] += 1

    print(f"{args.eleicao}: {len(cenas)} cenas padrão, {len(candidatos)} candidatos")
    print(f"{'candidato':20} {'1º c/ aleatório':>16} {'posição do espelho':>19}")
    for c in candidatos:
        escolhas = []
        for p in cenas:
            com_nota = [(nota(p, o["id"], c), o["id"]) for o in p["opcoes"] if nota(p, o["id"], c) is not None]
            escolhas.append((p, max(com_nota)[1] if com_nota else rng.choice(p["opcoes"])["id"]))
        sc = placar(escolhas)
        ranking = sorted(sc, key=sc.get, reverse=True)
        posicao = ranking.index(c) + 1 if c in sc else None
        print(f"{c:20} {vitorias[c] / SORTEIOS:>15.1%} {posicao or '-':>19}")


if __name__ == "__main__":
    main()
