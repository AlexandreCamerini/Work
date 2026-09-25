"""Varre o noticiário para atualizar o status de cada compromisso acompanhado.

Para cada compromisso de pipeline/acompanhamento/<arquivo>.json, o Claude busca na web (ferramenta
web_search da API) o que aconteceu desde a última atualização e propõe um status com evidências.
Nada é publicado automaticamente:
- evidência cuja URL não veio da busca feita nesta execução é descartada (proteção contra fonte inventada);
- propostas de mudança vão para pipeline/acompanhamento/pendentes/ e só entram no arquivo publicado
  depois de revisão humana.

Uso:
  pip install "anthropic>=1"
  export ANTHROPIC_API_KEY=...        # ou `ant auth login`
  python pipeline/acompanhar.py lula-2022 [--compromisso c3]
"""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path

import anthropic

RAIZ = Path(__file__).resolve().parent.parent
ACOMP = RAIZ / "pipeline" / "acompanhamento"
PENDENTES = ACOMP / "pendentes"
MODELO = "claude-opus-5"
STATUS = ["cumprida", "parcial", "em_andamento", "nao_cumprida", "na_contramao", "sem_informacao"]

INSTRUCOES = """Você mantém o acompanhamento de promessas de governo de um site cívico e apartidário. \
Recebe um compromisso de campanha, o status atual e as evidências já registradas. Busque na web notícias e \
dados oficiais posteriores à última atualização e decida o status em que o compromisso está hoje.

Status (aplicar de forma estrita, a mesma régua para qualquer governante):
- cumprida: o prometido foi entregue, no essencial.
- parcial: entregue em parte, ou abaixo da meta ou do escopo prometido.
- em_andamento: medida iniciada e tramitando ou em execução, sem entrega ainda.
- nao_cumprida: nada relevante feito, ou prazo vencido sem entrega.
- na_contramao: o governo adotou medida oposta ao prometido.
- sem_informacao: não há dado público suficiente para concluir.

Regras: prefira fonte primária (lei, decreto, Diário Oficial, dado oficial) e imprensa profissional; não use \
opinião nem colunista como evidência. Cada evidência precisa de trecho literal curto copiado da página e da URL \
exata de um resultado da sua busca. Se nada mudou, mantenha o status e diga isso. Linguagem neutra: avalie \
"fez ou não fez o que prometeu", nunca o mérito da política. Ao terminar, chame a ferramenta registrar_status."""

REGISTRAR = {
    "name": "registrar_status",
    "description": "Registra o status apurado de um compromisso, com explicação neutra e evidências da busca.",
    "strict": True,
    "input_schema": {
        "type": "object",
        "properties": {
            "status": {"type": "string", "enum": STATUS},
            "mudou": {"type": "boolean"},
            "explicacao": {"type": "string"},
            "evidencias": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "trecho": {"type": "string"},
                        "veiculo": {"type": "string"},
                        "url": {"type": "string"},
                        "data": {"type": "string"},
                    },
                    "required": ["trecho", "veiculo", "url", "data"],
                    "additionalProperties": False,
                },
            },
        },
        "required": ["status", "mudou", "explicacao", "evidencias"],
        "additionalProperties": False,
    },
}


def urls_da_busca(conteudo) -> set[str]:
    urls = set()
    for bloco in conteudo:
        if bloco.type == "web_search_tool_result" and isinstance(bloco.content, list):
            urls.update(r.url for r in bloco.content if getattr(r, "url", None))
    return urls


def apurar(client: anthropic.Anthropic, compromisso: dict, desde: str) -> dict | None:
    pedido = (
        f"Compromisso (status atual: {compromisso['status']}, última atualização: {desde}):\n"
        + json.dumps(
            {k: compromisso[k] for k in ("compromisso", "trecho_promessa", "explicacao", "evidencias")},
            ensure_ascii=False,
            indent=2,
        )
    )
    mensagens = [{"role": "user", "content": pedido}]
    vistas: set[str] = set()
    for _ in range(6):
        resposta = client.beta.messages.create(
            model=MODELO,
            max_tokens=16000,
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
            thinking={"type": "adaptive"},
            output_config={"effort": "high"},
            system=INSTRUCOES,
            tools=[{"type": "web_search_20260209", "name": "web_search", "max_uses": 6}, REGISTRAR],
            messages=mensagens,
        )
        vistas |= urls_da_busca(resposta.content)
        if resposta.stop_reason == "refusal":
            return None
        chamada = next((b for b in resposta.content if b.type == "tool_use" and b.name == "registrar_status"), None)
        if chamada:
            resultado = dict(chamada.input)
            resultado["evidencias"] = [e for e in resultado["evidencias"] if e["url"] in vistas]
            return resultado
        if resposta.stop_reason == "pause_turn":
            mensagens = [mensagens[0], {"role": "assistant", "content": resposta.content}]
            continue
        mensagens += [
            {"role": "assistant", "content": resposta.content},
            {"role": "user", "content": "Registre o resultado chamando a ferramenta registrar_status."},
        ]
    return None


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("arquivo", help="nome do arquivo em pipeline/acompanhamento, sem .json")
    ap.add_argument("--compromisso")
    args = ap.parse_args()

    dados = json.loads((ACOMP / f"{args.arquivo}.json").read_text(encoding="utf-8"))
    client = anthropic.Anthropic()
    propostas = []
    for c in dados["compromissos"]:
        if args.compromisso and c["id"] != args.compromisso:
            continue
        print(f"apurando {c['id']}...", flush=True)
        r = apurar(client, c, dados["atualizado_em"])
        if r is None:
            print(f"  {c['id']}: sem resultado (recusa ou limite de iterações)")
            continue
        if r["status"] != c["status"] and not r["evidencias"]:
            print(f"  {c['id']}: mudança para {r['status']} descartada, sem evidência verificável")
            continue
        if r["mudou"] or r["status"] != c["status"]:
            propostas.append({"id": c["id"], "status_atual": c["status"], "proposta": r})
            print(f"  {c['id']}: {c['status']} -> {r['status']} (pendente de revisão)")

    if propostas:
        PENDENTES.mkdir(exist_ok=True)
        destino = PENDENTES / f"{args.arquivo}-{date.today().isoformat()}.json"
        destino.write_text(json.dumps(propostas, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{len(propostas)} mudança(s) para revisar em {destino.relative_to(RAIZ)}")
    else:
        print("nenhuma mudança")


if __name__ == "__main__":
    main()
