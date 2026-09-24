"""Mescla rascunhos de aderência (um arquivo por candidato) no aderencia*.json publicado.

Os rascunhos vêm de avaliadores rodando em paralelo (subagentes ou `aderencia.py --candidato`)
e ficam em pipeline/rascunhos/aderencia-*-<candidato>.json, no formato
{"candidato_id", "versao_quiz", "itens": {pergunta: {opcao: {nota, evidencias, justificativa}}}}.

Recusa o rascunho inteiro se faltar pergunta ou opção, se a versão do quiz não bater, se a nota
não for inteiro 0-100 ou null, se uma evidência não existir no dossiê ou se nota null trouxer
evidência. Depois regenera evidencias*.json e o relatório para revisão humana.

Uso:
  python pipeline/mesclar_rascunhos.py --eleicao governador-rj --excluir anthony-garotinho
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import aderencia

RASCUNHOS = aderencia.RAIZ / "pipeline" / "rascunhos"


def validar(rascunho: dict, quiz: dict, dossie: dict) -> list[str]:
    erros = []
    cid = rascunho["candidato_id"]
    if rascunho.get("versao_quiz") != quiz["versao"]:
        erros.append(f"{cid}: versao_quiz {rascunho.get('versao_quiz')} != {quiz['versao']}")
    validos = {p["id"] for p in dossie["propostas"]}
    for p in quiz["perguntas"]:
        for o in p["opcoes"]:
            v = rascunho["itens"].get(p["id"], {}).get(o["id"])
            onde = f"{cid} {p['id']}/{o['id']}"
            if v is None:
                erros.append(f"{onde}: faltando")
                continue
            nota, evid = v.get("nota"), v.get("evidencias", [])
            if nota is None:
                if evid:
                    erros.append(f"{onde}: nota null com evidências")
            elif not (isinstance(nota, int) and 0 <= nota <= 100):
                erros.append(f"{onde}: nota inválida {nota!r}")
            elif not evid or any(e not in validos for e in evid):
                erros.append(f"{onde}: evidências inválidas {evid}")
            if not v.get("justificativa"):
                erros.append(f"{onde}: sem justificativa")
    return erros


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--eleicao", choices=aderencia.ELEICOES, default="governador-rj")
    ap.add_argument("--excluir", nargs="*", default=[], help="candidatos com rascunho que não vão ao site")
    args = ap.parse_args()
    aderencia.usar_eleicao(args.eleicao)

    quiz = json.loads(aderencia.QUIZ.read_text(encoding="utf-8"))
    dossies = {d["candidato_id"]: d for d in aderencia.carregar_dossies(None)}
    publicado = json.loads(aderencia.SAIDA.read_text(encoding="utf-8"))
    itens: dict = publicado["itens"]

    erros: list[str] = []
    mesclados = []
    for caminho in sorted(RASCUNHOS.glob("aderencia-*.json")):
        rascunho = json.loads(caminho.read_text(encoding="utf-8"))
        cid = rascunho.get("candidato_id")
        if cid not in dossies or cid in args.excluir:
            continue
        problemas = validar(rascunho, quiz, dossies[cid])
        if problemas:
            erros += problemas
            continue
        for pid, por_opcao in rascunho["itens"].items():
            for oid, valor in por_opcao.items():
                itens.setdefault(pid, {}).setdefault(oid, {})[cid] = {
                    "nota": valor["nota"],
                    "evidencias": valor["evidencias"],
                    "justificativa": valor["justificativa"],
                }
        mesclados.append(cid)
    if erros:
        raise SystemExit("rascunhos recusados:\n" + "\n".join(erros))

    for por_opcao in itens.values():
        for por_cand in por_opcao.values():
            for cid in args.excluir:
                por_cand.pop(cid, None)

    candidatos = sorted({c for po in itens.values() for pc in po.values() for c in pc})
    aderencia.SAIDA.write_text(json.dumps(publicado, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    aderencia.escrever_relatorio(quiz, itens, candidatos)
    aderencia.exportar_evidencias(itens, [dossies[c] for c in candidatos])
    print(f"mesclados: {', '.join(mesclados) or 'nenhum'}; no site: {', '.join(candidatos)}")


if __name__ == "__main__":
    main()
