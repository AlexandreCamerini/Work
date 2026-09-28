#!/usr/bin/env python3
"""Confere pipeline/curadoria-classes/textos-letramento.json contra os quiz atuais.

- todo `antes` é idêntico ao texto atual (cena, pergunta ou texto da opção);
- nenhum campo fora de cena/pergunta/opcao:<id>;
- nenhuma troca mira as 4 opções protegidas por decisão do produto;
- `palavras_depois` bate com a contagem do checar_legibilidade.py;
- nenhum nome/sobrenome de candidato nem sigla de partido no `depois`.
Não altera nenhum arquivo. Os limites de tamanho são checados por
`python3 pipeline/ux/checar_legibilidade.py --propostas <este json> --avisos`.
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(RAIZ / "pipeline/ux"))
from checar_legibilidade import palavras  # noqa: E402

ARQ = {"governador-rj": RAIZ / "src/data/quiz.json", "presidente": RAIZ / "src/data/quiz-presidente.json"}
PROTEGIDAS = {
    ("presidente", "escala-6x1", "opcao:b"),
    ("presidente", "trabalho-app", "opcao:b"),
    ("governador-rj", "operacao-policial", "opcao:b"),
    ("governador-rj", "via-expressa-fechada", "opcao:b"),
}
dados = {k: json.loads(v.read_text(encoding="utf-8")) for k, v in ARQ.items()}
nomes = set()
for f in ("src/data/candidatos.ts", "src/data/candidatos-presidente.ts"):
    txt = (RAIZ / f).read_text(encoding="utf-8")
    for n in re.findall(r"nome: '([^']+)'", txt):
        nomes |= {p for p in n.split() if len(p) > 3 and p != "Coronel"}
    nomes |= set(re.findall(r"partido: '([^']+)'", txt))

propostas = json.loads((Path(__file__).parent / "textos-letramento.json").read_text(encoding="utf-8"))
erros = []
for p in propostas:
    tag = f"{p['eleicao']}/{p['pergunta_id']}/{p['campo']}"
    q = next((q for q in dados[p["eleicao"]]["perguntas"] if q["id"] == p["pergunta_id"]), None)
    if q is None:
        erros.append(f"{tag}: pergunta não existe"); continue
    if (p["eleicao"], p["pergunta_id"], p["campo"]) in PROTEGIDAS:
        erros.append(f"{tag}: opção protegida")
    if p["campo"] in ("cena", "pergunta"):
        atual = q[p["campo"]]
    elif p["campo"].startswith("opcao:"):
        o = next((o for o in q["opcoes"] if o["id"] == p["campo"][6:]), None)
        if o is None:
            erros.append(f"{tag}: opção não existe"); continue
        atual = o["texto"]
    else:
        erros.append(f"{tag}: campo inválido"); continue
    if atual != p["antes"]:
        erros.append(f"{tag}: 'antes' difere do texto atual")
    if palavras(p["depois"]) != p["palavras_depois"]:
        erros.append(f"{tag}: palavras_depois errado")
    for n in nomes:
        if re.search(rf"(^|[^\wÀ-ÿ]){re.escape(n)}([^\wÀ-ÿ]|$)", p["depois"]):
            erros.append(f"{tag}: nome/partido '{n}' no texto")
print(f"{len(propostas)} propostas conferidas.")
for e in erros:
    print("  -", e)
print("OK" if not erros else f"{len(erros)} erros")
sys.exit(1 if erros else 0)
