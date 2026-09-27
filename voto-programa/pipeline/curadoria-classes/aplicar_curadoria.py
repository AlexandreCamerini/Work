#!/usr/bin/env python3
"""Aplica a curadoria por classe (setembro/2026) nos JSON do app, só o que a verificação aprovou.

Entradas (pipeline/curadoria-classes/):
  textos-letramento.json   trocas de linguagem (cena, pergunta, opcao:<id>)
  cenas-padrao.json        cenas padrão reescritas para servir a qualquer classe
  ajustes-publico.json     regras de público de variantes existentes
  variantes-novas.json     variantes novas que REUSAM as preferências de uma pergunta de origem
  veredito.json            veredito do revisor independente (aprovar | ajustar | rejeitar)
  decisoes.json            decisões do orquestrador por cima do veredito (opcional): textos_extras,
                           ajustes_publico_extras, ignorar_ajustes_publico, remover

Garantias (aborta sem gravar se falhar):
  - troca de texto só se o texto atual == "antes" (ou já == "depois": idempotente);
  - nunca muda `preferencia` de opção existente nem toca nas opções protegidas;
  - variante nova tem exatamente as preferências da origem, e as notas de todos os candidatos
    são copiadas da origem (a rubrica avalia a preferência, não o texto);
  - pergunta removida sai também da aderência e do contexto;
  - a versão do quiz sobe e a aderência passa a apontar para ela; evidências e relatório são
    regenerados pelo mesmo código de pipeline/aderencia.py.

Uso:
  python3 pipeline/curadoria-classes/aplicar_curadoria.py            # aplica e grava
  python3 pipeline/curadoria-classes/aplicar_curadoria.py --conferir # só lista o que faria
"""
from __future__ import annotations

import argparse
import copy
import json
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parents[1]
sys.path.insert(0, str(RAIZ / "pipeline"))
import aderencia  # noqa: E402

QUIZ = {"governador-rj": RAIZ / "src/data/quiz.json", "presidente": RAIZ / "src/data/quiz-presidente.json"}
CONTEXTO = {"governador-rj": RAIZ / "src/data/contexto.json", "presidente": RAIZ / "src/data/contexto-presidente.json"}
NOVA_VERSAO = {"governador-rj": "3.5.0", "presidente": "1.4.0"}
PROTEGIDAS = {("presidente", "escala-6x1", "b"), ("governador-rj", "operacao-policial", "b"),
              ("governador-rj", "via-expressa-fechada", "b"), ("presidente", "trabalho-app", "b")}
EXCLUIR = {"governador-rj": ["anthony-garotinho"], "presidente": []}


def ler(nome: str, padrao=None):
    p = AQUI / nome
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else padrao


def chave(item: dict, *campos: str) -> tuple:
    return tuple(item.get(c) for c in campos)


def aprovados(propostas: list, vereditos: list, campos: tuple[str, ...]) -> list:
    """Junta proposta e veredito; 'ajustar' aplica o texto/campos corrigidos; sem veredito = erro."""
    por_chave = {chave(v, *campos): v for v in vereditos}
    saida = []
    for p in propostas:
        v = por_chave.get(chave(p, *campos))
        if v is None:
            raise SystemExit(f"sem veredito para {chave(p, *campos)}")
        if v["veredito"] == "rejeitar":
            continue
        p = copy.deepcopy(p)
        if v["veredito"] == "ajustar":
            if v.get("depois_corrigido"):
                p["depois"] = v["depois_corrigido"]
            for caminho, valor in (v.get("correcoes") or {}).items():
                definir(p, caminho, valor)
        saida.append(p)
    return saida


def definir(obj: dict, caminho: str, valor) -> None:
    """'cena' | 'publico' | 'opcoes.a.texto' | 'fato.url' | 'contexto.paragrafos.0'."""
    partes = caminho.split(".")
    alvo = obj
    for parte in partes[:-1]:
        if isinstance(alvo, list):
            alvo = next(o for o in alvo if o.get("id") == parte) if not parte.isdigit() else alvo[int(parte)]
        else:
            alvo = alvo[parte]
    ultimo = partes[-1]
    if isinstance(alvo, list) and ultimo.isdigit():
        alvo[int(ultimo)] = valor
    else:
        alvo[ultimo] = valor


def trocar_texto(quiz: dict, eleicao: str, t: dict, log: list) -> None:
    p = next((x for x in quiz["perguntas"] if x["id"] == t["pergunta_id"]), None)
    if p is None:
        raise SystemExit(f"{eleicao}/{t['pergunta_id']}: pergunta não existe")
    campo = t["campo"]
    if campo in ("cena", "pergunta"):
        dono, chave_txt = p, campo
    elif campo.startswith("opcao:"):
        oid = campo.split(":", 1)[1]
        if (eleicao, p["id"], oid) in PROTEGIDAS:
            raise SystemExit(f"{eleicao}/{p['id']}/{oid}: opção protegida")
        dono, chave_txt = next(o for o in p["opcoes"] if o["id"] == oid), "texto"
    else:
        raise SystemExit(f"campo desconhecido {campo}")
    atual = dono[chave_txt]
    if atual == t["depois"]:
        return
    if atual != t["antes"]:
        raise SystemExit(f"{eleicao}/{p['id']}/{campo}: texto atual não bate com 'antes'\n  atual: {atual}\n  antes: {t['antes']}")
    dono[chave_txt] = t["depois"]
    log.append(f"texto {eleicao}/{p['id']}/{campo}")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--conferir", action="store_true")
    args = ap.parse_args()

    veredito = ler("veredito.json")
    if veredito is None:
        raise SystemExit("falta veredito.json (verificação independente)")
    decisoes = ler("decisoes.json", {})
    textos = aprovados(ler("textos-letramento.json", []), veredito["letramento"], ("eleicao", "pergunta_id", "campo"))
    textos += aprovados(ler("cenas-padrao.json", []), veredito["cenas_padrao"], ("eleicao", "pergunta_id", "campo"))
    textos += decisoes.get("textos_extras", [])
    ajustes = aprovados(ler("ajustes-publico.json", []), veredito["ajustes_publico"], ("eleicao", "pergunta_id"))
    ignorar = {(i["eleicao"], i["pergunta_id"]) for i in decisoes.get("ignorar_ajustes_publico", [])}
    ajustes = [a for a in ajustes if (a["eleicao"], a["pergunta_id"]) not in ignorar]
    ajustes += decisoes.get("ajustes_publico_extras", [])
    variantes = aprovados(ler("variantes-novas.json", []), veredito["variantes"], ("eleicao", "id_novo"))
    remover = decisoes.get("remover", [])  # [{eleicao, pergunta_id, motivo}]

    log: list[str] = []
    for eleicao, arq in QUIZ.items():
        quiz = json.loads(arq.read_text(encoding="utf-8"))
        original = copy.deepcopy(quiz)
        contexto = json.loads(CONTEXTO[eleicao].read_text(encoding="utf-8"))
        por_id = lambda pid: next((x for x in quiz["perguntas"] if x["id"] == pid), None)  # noqa: E731

        # 1. variantes novas (antes das trocas de texto: a propagação mira as variantes)
        novas: dict[str, str] = {}
        for v in (x for x in variantes if x["eleicao"] == eleicao):
            if por_id(v["id_novo"]):
                continue  # já aplicada
            origem = por_id(v["origem_opcoes"])
            if origem is None:
                raise SystemExit(f"{v['id_novo']}: origem {v['origem_opcoes']} não existe")
            pref_origem = {o["id"]: o["preferencia"] for o in origem["opcoes"]}
            pref_nova = {o["id"]: o["preferencia"] for o in v["opcoes"]}
            if pref_origem != pref_nova:
                raise SystemExit(f"{v['id_novo']}: preferências diferentes da origem {origem['id']}")
            nova = {"id": v["id_novo"], "tema": origem["tema"], "grupo": v["grupo"], "publico": v["publico"],
                    "cena": v["cena"], "pergunta": v["pergunta"],
                    "opcoes": [{"id": o["id"], "texto": o["texto"], "preferencia": o["preferencia"]} for o in v["opcoes"]],
                    "fato": v["fato"]}
            ref = v.get("inserir_antes_de") or v.get("inserir_depois_de")
            idx = next((i for i, x in enumerate(quiz["perguntas"]) if x["id"] == ref), None)
            if idx is None:
                raise SystemExit(f"{v['id_novo']}: posição {ref} não existe")
            quiz["perguntas"].insert(idx if v.get("inserir_antes_de") else idx + 1, nova)
            contexto[v["id_novo"]] = v["contexto"]
            novas[v["id_novo"]] = origem["id"]
            log.append(f"variante {eleicao}/{v['id_novo']} (notas de {origem['id']})")

        for pr in veredito.get("propagar", []):
            if pr["eleicao"] != eleicao:
                continue
            p = por_id(pr["id_variante"])
            op = next(o for o in p["opcoes"] if o["id"] == pr["opcao"])
            if op["texto"] != pr["texto"]:
                op["texto"] = pr["texto"]
                log.append(f"propagado {eleicao}/{p['id']}/{pr['opcao']}")

        # 2. textos
        for t in (x for x in textos if x["eleicao"] == eleicao):
            trocar_texto(quiz, eleicao, t, log)

        # 3. público
        for a in (x for x in ajustes if x["eleicao"] == eleicao):
            p = por_id(a["pergunta_id"])
            if p.get("publico") == a["publico_depois"]:
                continue
            if p.get("publico") != a["publico_antes"]:
                raise SystemExit(f"{eleicao}/{p['id']}: público atual não bate com publico_antes")
            p["publico"] = a["publico_depois"]
            log.append(f"público {eleicao}/{p['id']}")

        # 4. remoções
        removidas = []
        for r in (x for x in remover if x["eleicao"] == eleicao):
            if por_id(r["pergunta_id"]):
                quiz["perguntas"] = [x for x in quiz["perguntas"] if x["id"] != r["pergunta_id"]]
                contexto.pop(r["pergunta_id"], None)
                removidas.append(r["pergunta_id"])
                log.append(f"removida {eleicao}/{r['pergunta_id']}")

        # nenhuma preferência de pergunta existente mudou
        antes = {(p["id"], o["id"]): o["preferencia"] for p in original["perguntas"] for o in p["opcoes"]}
        depois = {(p["id"], o["id"]): o["preferencia"] for p in quiz["perguntas"] for o in p["opcoes"]}
        for k, pref in antes.items():
            if k[0] not in removidas and depois.get(k) != pref:
                raise SystemExit(f"{eleicao}/{k}: preferência mudou")

        mudou = quiz != original
        if not mudou:
            continue
        if quiz["versao"] == original["versao"]:
            quiz["versao"] = NOVA_VERSAO[eleicao]

        # 5. aderência: copia notas da origem, tira removidas, nova versão
        aderencia.usar_eleicao(eleicao)
        publicado = json.loads(aderencia.SAIDA.read_text(encoding="utf-8"))
        itens = publicado["itens"]
        for nova, origem in novas.items():
            itens[nova] = copy.deepcopy(itens[origem])
        for pid in removidas:
            itens.pop(pid, None)
        ids = [p["id"] for p in quiz["perguntas"]]
        publicado["itens"] = {pid: itens[pid] for pid in ids}
        publicado["versao_quiz"] = quiz["versao"]

        if args.conferir:
            continue
        arq.write_text(json.dumps(quiz, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        CONTEXTO[eleicao].write_text(json.dumps({pid: contexto[pid] for pid in ids}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        aderencia.SAIDA.write_text(json.dumps(publicado, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        candidatos = sorted({c for po in publicado["itens"].values() for pc in po.values() for c in pc})
        dossies = {d["candidato_id"]: d for d in aderencia.carregar_dossies(None)}
        aderencia.escrever_relatorio(quiz, publicado["itens"], candidatos)
        aderencia.exportar_evidencias(publicado["itens"], [dossies[c] for c in candidatos])

    print("\n".join(log) or "nada a aplicar")
    print(f"{len(log)} mudanças{' (só conferência)' if args.conferir else ''}")


if __name__ == "__main__":
    main()
