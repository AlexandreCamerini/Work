"""Calcula, offline, a aderência entre cada opção do quiz e as propostas de cada candidato.

Entrada:
  src/data/quiz.json            perguntas, opções e a "preferencia" de política pública de cada opção
  pipeline/dossies/*.json       propostas por candidato, cada uma com trecho literal e fonte

Saída:
  src/data/aderencia.json       nota 0-100 (ou null = sem evidência) por pergunta x opção x candidato
  pipeline/relatorio-aderencia.md  relatório para revisão humana, com poder de discriminação de cada pergunta

O site só lê aderencia.json: nenhuma resposta do eleitor sai do navegador e nenhuma chamada
de IA acontece em tempo de uso. Rodar de novo sempre que um dossiê ou o quiz mudar.

Uso:
  pip install "anthropic>=1" pydantic
  export ANTHROPIC_API_KEY=...          # ou `ant auth login`
  python pipeline/aderencia.py [--candidato eduardo-paes] [--pergunta trem-lotado]
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date
from pathlib import Path

import anthropic

RAIZ = Path(__file__).resolve().parent.parent
QUIZ = RAIZ / "src" / "data" / "quiz.json"
DOSSIES = RAIZ / "pipeline" / "dossies"
SAIDA = RAIZ / "src" / "data" / "aderencia.json"
RELATORIO = RAIZ / "pipeline" / "relatorio-aderencia.md"

MODELO = "claude-opus-5"

INSTRUCOES = """Você é o avaliador de aderência de uma ferramenta cívica e apartidária que ajuda eleitores \
do Rio de Janeiro a comparar suas preferências com as propostas dos candidatos a governador em 2026.

Você recebe (1) o dossiê de UM candidato, com propostas documentadas, cada uma com trecho literal e \
fonte, e (2) uma situação do dia a dia com opções de reação do eleitor. Cada opção traz uma \
"preferência": a direção de política pública que aquela reação implica.

Para cada opção, dê uma nota de 0 a 100 dizendo o quanto as propostas DOCUMENTADAS do candidato \
atendem àquela preferência:
- 90-100: o candidato propõe explicitamente o que a preferência pede.
- 60-89: propostas vão na mesma direção, com diferença de ênfase ou meio.
- 40-59: posição ambígua ou mista em relação à preferência.
- 10-39: propostas vão em direção diferente da preferência.
- 0-9: o candidato rejeita explicitamente o que a preferência pede.
- null: o dossiê não tem nenhuma proposta sobre o assunto. Ausência de proposta NUNCA é discordância; \
use null.

Regras:
- Use somente o dossiê. Não use conhecimento prévio sobre o candidato, o partido, aliados ou a \
gestão anterior dele, e não infira posição a partir de ideologia.
- Toda nota não-nula precisa citar em `evidencias` os ids das propostas (ex.: "p12") que a sustentam.
- `justificativa`: uma frase neutra, em português, dizendo qual proposta sustenta a nota. Sem \
adjetivos valorativos.
- Avalie cada opção de forma independente; as notas não precisam somar nada."""

SCHEMA = {
    "type": "object",
    "properties": {
        "opcoes": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "opcao_id": {"type": "string"},
                    "nota": {"anyOf": [{"type": "integer"}, {"type": "null"}]},
                    "evidencias": {"type": "array", "items": {"type": "string"}},
                    "justificativa": {"type": "string"},
                },
                "required": ["opcao_id", "nota", "evidencias", "justificativa"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["opcoes"],
    "additionalProperties": False,
}


def carregar_dossies(filtro: str | None) -> list[dict]:
    dossies = [json.loads(p.read_text(encoding="utf-8")) for p in sorted(DOSSIES.glob("*.json"))]
    if filtro:
        dossies = [d for d in dossies if d["candidato_id"] == filtro]
    if not dossies:
        sys.exit(f"Nenhum dossiê encontrado em {DOSSIES}")
    return dossies


def bloco_dossie(dossie: dict) -> str:
    fontes = {f["id"]: f for f in dossie["fontes"]}
    linhas = [f"# Dossiê: {dossie['nome']} (coletado em {dossie['coletado_em']})", ""]
    for p in dossie["propostas"]:
        fonte = fontes.get(p["fonte_id"], {})
        linhas.append(
            f"[{p['id']}] tema={p['tema']} | {p.get('subtema') or ''}\n"
            f"  resumo: {p['resumo']}\n"
            f"  trecho: \"{p['trecho']}\"\n"
            f"  fonte: {fonte.get('veiculo', '?')} ({fonte.get('tipo', '?')}, {fonte.get('data', '?')})"
        )
    if dossie.get("lacunas"):
        linhas.append("\nTemas sem proposta encontrada: " + "; ".join(dossie["lacunas"]))
    return "\n".join(linhas)


def bloco_pergunta(pergunta: dict) -> str:
    opcoes = "\n".join(
        f"- opcao_id={o['id']}: reação do eleitor: \"{o['texto']}\" | preferência implícita: {o['preferencia']}"
        for o in pergunta["opcoes"]
    )
    return f"Situação: {pergunta['cena']}\nPergunta ao eleitor: {pergunta['pergunta']}\n\nOpções:\n{opcoes}"


def avaliar(client: anthropic.Anthropic, dossie: dict, pergunta: dict) -> dict:
    resposta = client.beta.messages.create(
        model=MODELO,
        max_tokens=16000,
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
        thinking={"type": "adaptive"},
        output_config={"effort": "high", "format": {"type": "json_schema", "schema": SCHEMA}},
        system=[
            {"type": "text", "text": INSTRUCOES},
            # dossiê fixo por candidato: fica em cache entre as perguntas
            {"type": "text", "text": bloco_dossie(dossie), "cache_control": {"type": "ephemeral"}},
        ],
        messages=[{"role": "user", "content": bloco_pergunta(pergunta)}],
    )
    if resposta.stop_reason == "refusal":
        raise RuntimeError(f"Recusa ao avaliar {dossie['candidato_id']}/{pergunta['id']}")
    texto = next(b.text for b in resposta.content if b.type == "text")
    return json.loads(texto)


def sanear(bruto: dict, dossie: dict, pergunta: dict) -> dict:
    """Descarta evidência inventada e força null quando não sobra evidência válida."""
    ids_validos = {p["id"] for p in dossie["propostas"]}
    ids_opcao = {o["id"] for o in pergunta["opcoes"]}
    saida: dict = {}
    for item in bruto["opcoes"]:
        if item["opcao_id"] not in ids_opcao:
            continue
        evid = [e for e in item["evidencias"] if e in ids_validos]
        nota = item["nota"]
        if nota is not None:
            nota = max(0, min(100, int(nota))) if evid else None
        saida[item["opcao_id"]] = {
            "nota": nota,
            "evidencias": evid,
            "justificativa": item["justificativa"] if nota is not None else "Sem proposta documentada sobre o tema.",
        }
    for oid in ids_opcao - saida.keys():
        saida[oid] = {"nota": None, "evidencias": [], "justificativa": "Sem proposta documentada sobre o tema."}
    return saida


def discriminacao(itens: dict, pergunta: dict, candidatos: list[str]) -> float | None:
    """Maior diferença de nota entre candidatos numa mesma opção: pergunta que não separa ninguém é inútil."""
    maior = None
    for o in pergunta["opcoes"]:
        por_cand = itens.get(pergunta["id"], {}).get(o["id"], {})
        notas = [por_cand[c]["nota"] for c in candidatos if c in por_cand]
        notas = [n for n in notas if n is not None]
        if len(notas) >= 2:
            dif = max(notas) - min(notas)
            maior = dif if maior is None else max(maior, dif)
    return maior


EVIDENCIAS = RAIZ / "src" / "data" / "evidencias.json"


def exportar_evidencias(itens: dict, dossies: list[dict]) -> None:
    """Só as propostas citadas como evidência, para o site mostrar trecho literal e fonte."""
    usados: dict[str, set[str]] = {}
    for por_opcao in itens.values():
        for por_cand in por_opcao.values():
            for cid, v in por_cand.items():
                usados.setdefault(cid, set()).update(v["evidencias"])
    saida: dict = {}
    for d in dossies:
        fontes = {f["id"]: f for f in d["fontes"]}
        for p in d["propostas"]:
            if p["id"] in usados.get(d["candidato_id"], set()):
                f = fontes[p["fonte_id"]]
                saida.setdefault(d["candidato_id"], {})[p["id"]] = {
                    "resumo": p["resumo"],
                    "trecho": p["trecho"],
                    "fonte": {"veiculo": f["veiculo"], "tipo": f["tipo"], "data": f["data"], "url": f["url"]},
                }
    EVIDENCIAS.write_text(json.dumps(saida, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def opcoes_exclusivas(itens: dict, pergunta: dict, candidatos: list[str]) -> list[str]:
    """Opções com evidência para só um candidato: também diferenciam, porque só um deles pontua."""
    saida = []
    for o in pergunta["opcoes"]:
        por_cand = itens.get(pergunta["id"], {}).get(o["id"], {})
        com_nota = [c for c in candidatos if por_cand.get(c, {}).get("nota") is not None]
        if len(com_nota) == 1:
            saida.append(o["id"])
    return saida


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--candidato")
    ap.add_argument("--pergunta")
    args = ap.parse_args()

    quiz = json.loads(QUIZ.read_text(encoding="utf-8"))
    perguntas = [p for p in quiz["perguntas"] if not args.pergunta or p["id"] == args.pergunta]
    dossies = carregar_dossies(args.candidato)

    atual = json.loads(SAIDA.read_text(encoding="utf-8")) if SAIDA.exists() else {"itens": {}}
    itens: dict = atual["itens"]

    client = anthropic.Anthropic()
    for dossie in dossies:
        for pergunta in perguntas:
            print(f"avaliando {dossie['candidato_id']} x {pergunta['id']}...", flush=True)
            bruto = avaliar(client, dossie, pergunta)
            for oid, valor in sanear(bruto, dossie, pergunta).items():
                itens.setdefault(pergunta["id"], {}).setdefault(oid, {})[dossie["candidato_id"]] = valor

    candidatos = sorted(json.loads(p.read_text(encoding="utf-8"))["candidato_id"] for p in DOSSIES.glob("*.json"))
    SAIDA.write_text(
        json.dumps(
            {"gerado_em": date.today().isoformat(), "modelo": MODELO, "versao_quiz": quiz["versao"], "itens": itens},
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    escrever_relatorio(quiz, itens, candidatos)
    exportar_evidencias(itens, carregar_dossies(None))
    print(f"ok: {SAIDA.relative_to(RAIZ)}, {EVIDENCIAS.relative_to(RAIZ)} e {RELATORIO.relative_to(RAIZ)}")


def escrever_relatorio(quiz: dict, itens: dict, candidatos: list[str]) -> None:
    linhas = ["# Relatório de aderência (revisão humana obrigatória antes de publicar)", ""]
    for p in quiz["perguntas"]:
        if p["id"] not in itens:
            continue
        disc = discriminacao(itens, p, candidatos)
        exclusivas = opcoes_exclusivas(itens, p, candidatos)
        if p.get("consenso"):
            alerta = " (cena de consenso: baixa discriminação é esperada)"
        elif (disc is None or disc < 25) and not exclusivas:
            alerta = " **(não diferencia candidatos: reescrever ou remover)**"
        else:
            alerta = ""
        linhas += [
            f"## {p['id']}: discriminação {disc if disc is not None else 'sem dado'}, "
            f"opções com evidência de um só candidato: {len(exclusivas)}{alerta}",
            "",
        ]
        linhas.append("| opção | " + " | ".join(candidatos) + " |")
        linhas.append("|---|" + "---|" * len(candidatos))
        for o in p["opcoes"]:
            celulas = []
            for c in candidatos:
                v = itens[p["id"]].get(o["id"], {}).get(c)
                if not v or v["nota"] is None:
                    celulas.append("sem dado")
                else:
                    celulas.append(f"{v['nota']} ({', '.join(v['evidencias'])}): {v['justificativa']}")
            linhas.append(f"| {o['id']}: {o['texto']} | " + " | ".join(celulas) + " |")
        linhas.append("")
    RELATORIO.write_text("\n".join(linhas), encoding="utf-8")


if __name__ == "__main__":
    main()
