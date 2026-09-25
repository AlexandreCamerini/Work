#!/usr/bin/env python3
"""Checa o tamanho dos textos do quiz (linguagem simples).

Regras (falham com exit 1):
  - opção com mais de 12 palavras
  - pergunta com mais de 12 palavras
  - frase de cena com mais de 20 palavras
  - cena com mais de 2 frases
  - cena + pergunta com mais de 170 caracteres (layout sem rolar)
  - soma dos textos das opções de uma cena com mais de 260 caracteres (layout sem rolar)

Avisos (não falham): sigla ou jargão da lista abaixo aparecendo no texto que o eleitor lê.

Uso:
  python3 pipeline/ux/checar_legibilidade.py                  # textos atuais
  python3 pipeline/ux/checar_legibilidade.py --propostas pipeline/ux/textos-propostos.json
      # aplica as propostas em memória (confere o "antes"; pula as já aplicadas) e checa o resultado
  --avisos   lista também siglas e jargões (não falha)

Não altera nenhum arquivo.
"""
from __future__ import annotations

import argparse
import copy
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
ARQUIVOS = {
    "governador-rj": RAIZ / "src/data/quiz.json",
    "presidente": RAIZ / "src/data/quiz-presidente.json",
}

MAX_OPCAO = 12
MAX_PERGUNTA = 12
MAX_FRASE_CENA = 20
MAX_FRASES_CENA = 2
# Caber sem rolar no layout novo (contagem em caracteres, len() do Python).
MAX_CHARS_CENA_PERGUNTA = 170
MAX_CHARS_OPCOES = 260

# Abreviações que não encerram frase.
ABREVIACOES = ("Av.", "Dr.", "Dra.", "Sr.", "Sra.", "nº.", "etc.")

# Siglas e jargões que pedem explicação ou troca (só aviso).
JARGAO = [
    "concessão", "concessionária", "subsídio", "arcabouço", "desestatização", "contrapartida",
    "alíquota", "focalizada", "receptação", "letalidade", "precariza", "pejotização",
    "superávit", "royalties", "voucher", "fracking", "encargos", "bilhetagem", "custeio",
    "renúncia", "reestatizar", "estatizar", "universalização",
]
SIGLAS = ["BRT", "PPP", "CDE", "IOF", "Propag", "Inea", "Faetec", "MEI", "IVA", "IR", "INSS", "Cedae"]


def palavras(texto: str) -> int:
    """Conta palavras: pedaços separados por espaço que tenham letra ou número."""
    return sum(1 for t in texto.split() if re.search(r"[0-9A-Za-zÀ-ÿ]", t))


def frases(texto: str) -> list[str]:
    protegido = texto
    for abv in ABREVIACOES:
        protegido = protegido.replace(abv, abv.replace(".", "\u0000"))
    partes = re.split(r"(?<=[.!?…])\s+", protegido.strip())
    return [p.replace("\u0000", ".") for p in partes if p.strip()]


def aplicar_propostas(dados: dict[str, dict], propostas: list[dict]) -> list[str]:
    """Aplica as propostas em memória. Devolve erros de conferência (antes não bate etc.)."""
    erros = []
    for p in propostas:
        quiz = dados[p["eleicao"]]
        perg = next((q for q in quiz["perguntas"] if q["id"] == p["pergunta_id"]), None)
        if perg is None:
            erros.append(f"{p['eleicao']}/{p['pergunta_id']}: pergunta não existe")
            continue
        campo = p["campo"]
        if campo in ("cena", "pergunta"):
            alvo, chave = perg, campo
        elif campo.startswith("opcao:"):
            oid = campo.split(":", 1)[1]
            alvo = next((o for o in perg["opcoes"] if o["id"] == oid), None)
            chave = "texto"
            if alvo is None:
                erros.append(f"{p['eleicao']}/{p['pergunta_id']}: opção {oid} não existe")
                continue
        else:
            erros.append(f"{p['eleicao']}/{p['pergunta_id']}: campo desconhecido {campo}")
            continue
        if alvo[chave] == p["depois"]:
            continue  # já aplicada nos arquivos
        if alvo[chave] != p["antes"]:
            erros.append(f"{p['eleicao']}/{p['pergunta_id']}/{campo}: 'antes' não bate com o texto atual")
            continue
        alvo[chave] = p["depois"]
        if palavras(p["depois"]) != p.get("palavras_depois", palavras(p["depois"])):
            erros.append(
                f"{p['eleicao']}/{p['pergunta_id']}/{campo}: palavras_depois={p.get('palavras_depois')} "
                f"mas o texto tem {palavras(p['depois'])}"
            )
    return erros


def checar(dados: dict[str, dict]) -> tuple[list[str], list[str]]:
    violacoes, avisos = [], []
    for eleicao, quiz in dados.items():
        for q in quiz["perguntas"]:
            pid = q["id"]
            fs = frases(q["cena"])
            if len(fs) > MAX_FRASES_CENA:
                violacoes.append(f"[{eleicao}] {pid} cena: {len(fs)} frases (máx. {MAX_FRASES_CENA})")
            for f in fs:
                n = palavras(f)
                if n > MAX_FRASE_CENA:
                    violacoes.append(f"[{eleicao}] {pid} cena: frase com {n} palavras (máx. {MAX_FRASE_CENA}): {f}")
            n = len(q["cena"]) + len(q["pergunta"])
            if n > MAX_CHARS_CENA_PERGUNTA:
                violacoes.append(
                    f"[{eleicao}] {pid} cena+pergunta: {n} caracteres (máx. {MAX_CHARS_CENA_PERGUNTA})"
                )
            n = sum(len(o["texto"]) for o in q["opcoes"])
            if n > MAX_CHARS_OPCOES:
                violacoes.append(f"[{eleicao}] {pid} opções somadas: {n} caracteres (máx. {MAX_CHARS_OPCOES})")
            n = palavras(q["pergunta"])
            if n > MAX_PERGUNTA:
                violacoes.append(f"[{eleicao}] {pid} pergunta: {n} palavras (máx. {MAX_PERGUNTA}): {q['pergunta']}")
            for o in q["opcoes"]:
                campo = f"opcao:{o['id']}"
                n = palavras(o["texto"])
                if n > MAX_OPCAO:
                    violacoes.append(f"[{eleicao}] {pid} {campo}: {n} palavras (máx. {MAX_OPCAO}): {o['texto']}")
            textos = [("cena", q["cena"]), ("pergunta", q["pergunta"])] + [
                (f"opcao:{o['id']}", o["texto"]) for o in q["opcoes"]
            ]
            for campo, t in textos:
                achados = [j for j in JARGAO if j.lower() in t.lower()]
                achados += [s for s in SIGLAS if re.search(rf"\b{re.escape(s)}\b", t)]
                if achados:
                    avisos.append(f"[{eleicao}] {pid} {campo}: {', '.join(achados)}")
    return violacoes, avisos


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--propostas", type=Path, help="JSON (lista) de propostas a aplicar em memória")
    ap.add_argument("--avisos", action="store_true", help="lista também siglas e jargões")
    args = ap.parse_args()

    dados = {k: json.loads(v.read_text(encoding="utf-8")) for k, v in ARQUIVOS.items()}

    if args.propostas:
        propostas = json.loads(args.propostas.read_text(encoding="utf-8"))
        dados = copy.deepcopy(dados)
        erros = aplicar_propostas(dados, propostas)
        if erros:
            print("Erros ao aplicar propostas:")
            for e in erros:
                print("  -", e)
            return 2
        print(f"{len(propostas)} propostas conferidas/aplicadas em memória (nenhum arquivo alterado).")

    violacoes, avisos = checar(dados)
    if args.avisos and avisos:
        print(f"Avisos de sigla/jargão ({len(avisos)}):")
        for a in avisos:
            print("  -", a)
    if violacoes:
        print(f"{len(violacoes)} violações:")
        for v in violacoes:
            print("  -", v)
        return 1
    print("0 violações.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
