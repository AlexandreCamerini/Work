"""Gera ou reformula cenas do quiz com Claude, a partir dos dossiês e das pesquisas de eleitor.

Nunca escreve no quiz publicado: grava rascunhos em pipeline/rascunhos/ para revisão humana.
Depois de aprovada, a cena entra em src/data/quiz*.json e a aderência é recalculada com
pipeline/aderencia.py.

Validações automáticas de cada rascunho:
- o fato citado usa uma URL que aparece nas pesquisas fornecidas (nada de fonte inventada);
- as evidências esperadas existem nos dossiês;
- 3 ou 4 opções, textos curtos.

Uso:
  pip install "anthropic>=1"
  export ANTHROPIC_API_KEY=...        # ou `ant auth login`
  # cenas novas para um perfil
  python pipeline/gerar_cenas.py --eleicao governador-rj --tema saude --perfil "tem plano de saúde, anda de carro" --n 2
  # reformular uma cena existente
  python pipeline/gerar_cenas.py --eleicao governador-rj --reformular fila-especialista
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path

import anthropic

RAIZ = Path(__file__).resolve().parent.parent
PIPELINE = RAIZ / "pipeline"
RASCUNHOS = PIPELINE / "rascunhos"
MODELO = "claude-opus-5"

ELEICOES = {
    "governador-rj": {
        "nome": "Governador do Rio de Janeiro 2026",
        "competencia": "estadual",
        "quiz": RAIZ / "src" / "data" / "quiz.json",
        "pesquisas": [PIPELINE / "pesquisa-eleitor-rj.md", PIPELINE / "pesquisa-perfis.md"],
    },
    "presidente": {
        "nome": "Presidente da República 2026",
        "competencia": "federal",
        "quiz": RAIZ / "src" / "data" / "quiz-presidente.json",
        "pesquisas": [PIPELINE / "pesquisa-perfis.md"],
    },
}

INSTRUCOES = """Você escreve cenas para um quiz cívico e apartidário: "Qual proposta combina com o seu dia a dia?". \
O eleitor lê uma situação da vida real, escolhe a reação que faz mais sentido para ele, e o site compara as \
escolhas com as propostas documentadas de cada candidato. A comparação é feita depois, por outra etapa: você só \
escreve a cena.

Uma boa cena:
- É uma situação que a pessoa do perfil pedido vive ou reconhece na hora. Concreta, curta (até 200 caracteres), \
na segunda pessoa, sem jargão de política pública.
- Serve a quem tem aquele perfil sem rotular ninguém: nunca escreva "classe baixa", "pobre", "rico", "elite".
- Respeita a competência do cargo em disputa: não atribua ao governador o que é federal, nem ao presidente o que é \
municipal ou estadual.
- Tem 3 ou 4 opções que são reações naturais (até 90 caracteres cada), nenhuma caricata, nenhuma que pareça a \
"certa". Cada opção corresponde a uma direção de política que PELO MENOS UM candidato propõe nos dossiês, e as \
opções devem separar os candidatos: prefira temas em que os dossiês divergem.
- Para cada opção, escreva a `preferencia` (a direção de política pública implícita, em linguagem técnica e neutra) \
e liste em `evidencias_esperadas` os ids das propostas de cada candidato que tratam do assunto.
- Traz um `fato` curto e verdadeiro que ancora a cena, copiado das pesquisas fornecidas, com a URL exata que está \
lá. Se as pesquisas não tiverem um dado para a cena, escreva outra cena.

Evite: gíria forçada, humor com violência ou tragédia, estereótipo de bairro, região ou classe, nome de facção, \
e qualquer opção que ataque ou elogie um candidato."""

SCHEMA = {
    "type": "object",
    "properties": {
        "cenas": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "tema": {"type": "string"},
                    "publico": {"type": "string"},
                    "cena": {"type": "string"},
                    "pergunta": {"type": "string"},
                    "opcoes": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "id": {"type": "string"},
                                "texto": {"type": "string"},
                                "preferencia": {"type": "string"},
                                "evidencias_esperadas": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "candidato_id": {"type": "string"},
                                            "propostas": {"type": "array", "items": {"type": "string"}},
                                        },
                                        "required": ["candidato_id", "propostas"],
                                        "additionalProperties": False,
                                    },
                                },
                            },
                            "required": ["id", "texto", "preferencia", "evidencias_esperadas"],
                            "additionalProperties": False,
                        },
                    },
                    "fato": {
                        "type": "object",
                        "properties": {
                            "texto": {"type": "string"},
                            "fonte": {"type": "string"},
                            "url": {"type": "string"},
                        },
                        "required": ["texto", "fonte", "url"],
                        "additionalProperties": False,
                    },
                    "por_que_diferencia": {"type": "string"},
                },
                "required": ["id", "tema", "publico", "cena", "pergunta", "opcoes", "fato", "por_que_diferencia"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["cenas"],
    "additionalProperties": False,
}


def carregar_dossies(eleicao: str) -> list[dict]:
    pasta = PIPELINE / "dossies" / eleicao
    return [json.loads(p.read_text(encoding="utf-8")) for p in sorted(pasta.glob("*.json"))]


def texto_dossies(dossies: list[dict]) -> str:
    partes = []
    for d in dossies:
        linhas = [f"# {d['nome']} (candidato_id={d['candidato_id']})"]
        linhas += [f"[{p['id']}] {p['tema']}/{p.get('subtema') or ''}: {p['resumo']}" for p in d["propostas"]]
        if d.get("lacunas"):
            linhas.append("Sem proposta encontrada: " + "; ".join(d["lacunas"]))
        partes.append("\n".join(linhas))
    return "\n\n".join(partes)


def validar(cena: dict, dossies: list[dict], pesquisas: str) -> list[str]:
    problemas = []
    if cena["fato"]["url"] not in pesquisas:
        problemas.append("URL do fato não aparece nas pesquisas fornecidas")
    if not 3 <= len(cena["opcoes"]) <= 4:
        problemas.append("precisa de 3 ou 4 opções")
    if len(cena["cena"]) > 220:
        problemas.append("cena longa demais")
    ids = {d["candidato_id"]: {p["id"] for p in d["propostas"]} for d in dossies}
    for o in cena["opcoes"]:
        if len(o["texto"]) > 100:
            problemas.append(f"opção {o['id']} longa demais")
        if not any(e["propostas"] for e in o["evidencias_esperadas"]):
            problemas.append(f"opção {o['id']} sem nenhuma proposta de candidato por trás")
        for e in o["evidencias_esperadas"]:
            invalidas = [p for p in e["propostas"] if p not in ids.get(e["candidato_id"], set())]
            if invalidas:
                problemas.append(f"opção {o['id']}: propostas inexistentes {invalidas} para {e['candidato_id']}")
    return problemas


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--eleicao", choices=ELEICOES, required=True)
    grupo = ap.add_mutually_exclusive_group(required=True)
    grupo.add_argument("--reformular", metavar="PERGUNTA_ID")
    grupo.add_argument("--tema")
    ap.add_argument("--perfil", default="qualquer eleitor", help="descrição do público da cena")
    ap.add_argument("--n", type=int, default=2)
    args = ap.parse_args()

    cfg = ELEICOES[args.eleicao]
    dossies = carregar_dossies(args.eleicao)
    pesquisas = "\n\n".join(p.read_text(encoding="utf-8") for p in cfg["pesquisas"] if p.exists())

    if args.reformular:
        quiz = json.loads(cfg["quiz"].read_text(encoding="utf-8"))
        atual = next((p for p in quiz["perguntas"] if p["id"] == args.reformular), None)
        if not atual:
            sys.exit(f"Pergunta {args.reformular} não existe em {cfg['quiz'].name}")
        pedido = (
            "Reformule esta cena mantendo o mesmo tema e o mesmo público, corrigindo o que estiver artificial, "
            "caricato, longo ou que não diferencie os candidatos. Devolva 1 cena com o mesmo id.\n\n"
            + json.dumps(atual, ensure_ascii=False, indent=2)
        )
    else:
        pedido = (
            f"Escreva {args.n} cenas novas sobre o tema '{args.tema}' para este público: {args.perfil}. "
            "Ids em kebab-case, curtos e descritivos."
        )

    client = anthropic.Anthropic()
    resposta = client.beta.messages.create(
        model=MODELO,
        max_tokens=16000,
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
        thinking={"type": "adaptive"},
        output_config={"effort": "high", "format": {"type": "json_schema", "schema": SCHEMA}},
        system=[
            {"type": "text", "text": INSTRUCOES},
            {
                "type": "text",
                "text": f"Eleição: {cfg['nome']} (competência {cfg['competencia']}).\n\n"
                f"## Propostas dos candidatos\n{texto_dossies(dossies)}\n\n## Pesquisas sobre o eleitor\n{pesquisas}",
                "cache_control": {"type": "ephemeral"},
            },
        ],
        messages=[{"role": "user", "content": pedido}],
    )
    if resposta.stop_reason == "refusal":
        sys.exit("O modelo recusou o pedido; reformule o perfil ou o tema.")
    cenas = json.loads(next(b.text for b in resposta.content if b.type == "text"))["cenas"]

    for c in cenas:
        c["problemas_validacao"] = validar(c, dossies, pesquisas)

    RASCUNHOS.mkdir(exist_ok=True)
    nome = re.sub(r"[^a-z0-9-]", "-", (args.reformular or f"{args.tema}-{args.perfil}").lower())[:60]
    destino = RASCUNHOS / f"{datetime.now():%Y%m%d-%H%M%S}-{args.eleicao}-{nome}.json"
    destino.write_text(json.dumps({"eleicao": args.eleicao, "pedido": pedido, "cenas": cenas}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for c in cenas:
        status = "ok" if not c["problemas_validacao"] else "; ".join(c["problemas_validacao"])
        print(f"{c['id']}: {status}")
    print(f"rascunho em {destino.relative_to(RAIZ)} (revisar antes de publicar)")


if __name__ == "__main__":
    main()
