"""Cenas regionais (25/09/2026). Registro em pipeline/curadoria-cenas.md, seção "Região".

Duas técnicas:
- variante que reaproveita opções e notas de uma cena já avaliada (a política é a mesma, a
  situação é contada como acontece naquela região); texto de opção só muda quando a
  `preferencia` continua exatamente a mesma;
- cena regional com opções próprias, ancoradas em propostas documentadas, para avaliação
  pelos avaliadores (pipeline/rascunhos/regional-*.json) antes de ir ao site.
Cenas regionais entram logo depois da cena padrão do grupo: região tem prioridade sobre
faixa de renda quando as duas se aplicam.
"""

import copy
import json
from pathlib import Path

DADOS = Path(__file__).resolve().parent.parent / "src" / "data"

REGIOES_RJ = {
    "pergunta": "Onde você mora?",
    "opcoes": [
        {"valor": "capital", "rotulo": "Cidade do Rio"},
        {"valor": "baixada", "rotulo": "Baixada Fluminense"},
        {"valor": "leste", "rotulo": "Niterói, São Gonçalo, Maricá ou Itaboraí"},
        {"valor": "interior", "rotulo": "Interior do estado"},
        {"valor": "fora", "rotulo": "Não moro no estado do Rio"},
    ],
}
REGIOES_BR = {
    "pergunta": "Em que região do Brasil você mora?",
    "opcoes": [
        {"valor": "norte", "rotulo": "Norte"},
        {"valor": "nordeste", "rotulo": "Nordeste"},
        {"valor": "centro-oeste", "rotulo": "Centro-Oeste"},
        {"valor": "sudeste", "rotulo": "Sudeste"},
        {"valor": "sul", "rotulo": "Sul"},
    ],
}


def logo_depois_do_padrao(perguntas: list, grupo: str, nova: dict) -> None:
    padrao = next(i for i, p in enumerate(perguntas) if p["grupo"] == grupo and not p.get("publico"))
    perguntas.insert(padrao + 1, nova)


def reaproveitar(quiz: dict, ader: dict, origem: str, novo_id: str, regioes: list, cena: str,
                 fato: dict | None = None, textos: dict | None = None) -> None:
    base = next(p for p in quiz["perguntas"] if p["id"] == origem)
    nova = copy.deepcopy(base)
    nova.update({"id": novo_id, "publico": {"regiao": regioes}, "cena": cena})
    nova.pop("consenso", None)
    if fato:
        nova["fato"] = fato
    for oid, texto in (textos or {}).items():
        next(o for o in nova["opcoes"] if o["id"] == oid)["texto"] = texto
    logo_depois_do_padrao(quiz["perguntas"], base["grupo"], nova)
    ader["itens"][novo_id] = copy.deepcopy(ader["itens"][origem])


def nova_cena(quiz: dict, grupo: str, tema: str, novo_id: str, regioes: list, cena: str, pergunta: str,
              opcoes: list, fato: dict) -> None:
    logo_depois_do_padrao(quiz["perguntas"], grupo, {
        "id": novo_id, "tema": tema, "grupo": grupo, "publico": {"regiao": regioes},
        "cena": cena, "pergunta": pergunta,
        "opcoes": [{"id": oid, "texto": t, "preferencia": p} for oid, t, p in opcoes],
        "fato": fato,
    })


def carregar(sufixo: str):
    q, a = DADOS / f"quiz{sufixo}.json", DADOS / f"aderencia{sufixo}.json"
    return q, a, json.loads(q.read_text(encoding="utf-8")), json.loads(a.read_text(encoding="utf-8"))


def gravar(caminho: Path, dados: dict) -> None:
    caminho.write_text(json.dumps(dados, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


# ---------------- Governador ----------------
qp, ap, quiz, ader = carregar("")
assert "regioes" not in quiz, "já aplicado"
quiz["regioes"] = REGIOES_RJ

nova_cena(quiz, "trem-parado", "transporte", "barca-leste", ["leste"],
          "7h em Niterói. A barca atrasou de novo, a fila dobra a estação e a Ponte está parada.",
          "O que tirava você desse aperto?",
          [("a", "Metrô chegando a Niterói e São Gonçalo, com a Linha 3.",
            "Construir a Linha 3 do metrô ligando Rio, Niterói e São Gonçalo."),
           ("b", "Mais linhas de barca, com terminal em São Gonçalo.",
            "Criar novas linhas e terminais de barcas e catamarãs na Baía de Guanabara, incluindo São Gonçalo."),
           ("c", "Cobrar e multar a empresa da barca por atraso e cancelamento.",
            "Cobrar da concessionária das barcas pontualidade, regularidade e menos cancelamentos, com fiscalização e sanção."),
           ("d", "O Estado assume a barca e baixa a passagem.",
            "Estatizar o transporte aquaviário, com tarifa social ou tarifa zero.")],
          {"texto": "Um ano depois da troca de gestão das barcas, passageiros relatam atrasos, superlotação e falta de ar-condicionado; a passagem Praça XV–Arariboia caiu de R$ 7,70 para R$ 4,70.",
           "fonte": "O Globo, 15/03/2026",
           "url": "https://oglobo.globo.com/rio/bairros/niteroi/noticia/2026/03/15/atrasos-calor-e-ma-estrutura-nova-gestao-das-barcas-faz-um-ano-sob-reclamacoes-de-passageiros.ghtml"})

nova_cena(quiz, "trem-parado", "transporte", "estrada-interior", ["interior"],
          "Pra ir à cidade vizinha, você pega estrada estadual com buraco e sem acostamento, e o ônibus passa de hora em hora.",
          "O que devia vir primeiro?",
          [("a", "O estado recapeia e vigia as estradas com dinheiro próprio.",
            "Recuperar as rodovias estaduais do interior com recapeamento e vigilância, com recursos do estado."),
           ("b", "Passar as estradas pra concessão privada, sem pedágio novo.",
            "Conceder rodovias estaduais à iniciativa privada em lotes, sem criar novos pedágios."),
           ("c", "Voltar a ter trem de passageiros entre as cidades.",
            "Priorizar o transporte ferroviário de passageiros sobre o rodoviário."),
           ("d", "Passagem de ônibus intermunicipal mais barata, com ajuda do estado.",
            "Subsídio estadual ao ônibus intermunicipal para reduzir as passagens.")],
          {"texto": "Na pesquisa CNT de 2024, 19,1% das rodovias avaliadas no estado do Rio estavam ruins ou péssimas, e as cinco piores eram geridas pelo poder público.",
           "fonte": "Gazeta do Povo, com dados da CNT (03/01/2025)",
           "url": "https://www.gazetadopovo.com.br/brasil/melhores-e-piores-rodovias-rio-de-janeiro/"})

nova_cena(quiz, "fila-especialista", "saude", "saude-interior", ["interior"],
          "Pra fazer quimioterapia, sua tia sai de van às 4h da manhã rumo ao Rio e só volta depois das 20h.",
          "O que resolvia pra ela?",
          [("a", "Hospital público regional no interior, pra ninguém precisar ir ao Rio.",
            "Construir hospitais regionais públicos no interior e acabar com o deslocamento de pacientes à capital."),
           ("b", "Centro de câncer e de exames complexos em cada região.",
            "Criar polos regionais de oncologia e de diagnóstico de alta complexidade no interior."),
           ("c", "Mais dinheiro pros hospitais do interior que já existem, cobrando metas.",
            "Custeio estadual a hospitais do interior condicionado a metas de desempenho."),
           ("d", "Consulta com especialista por vídeo, sem sair da cidade.",
            "Teleconsulta e telessaúde com especialistas para moradores do interior.")],
          {"texto": "Nova Friburgo ampliou de 12 para 15 as vans que levam pacientes do SUS para tratamento em outras cidades, como quimioterapia e radioterapia.",
           "fonte": "A Voz da Serra, 31/08/2026",
           "url": "https://avozdaserra.com.br/noticias/nova-frota-de-vans-para-o-transporte-de-pacientes-do-sus"})

reaproveitar(quiz, ader, "rua-alagada", "encosta-serra", ["interior"],
             "Choveu três dias seguidos na serra, e apareceu uma rachadura na encosta atrás da sua rua.")

quiz["versao"] = ader["versao_quiz"] = "3.4.0"
gravar(qp, quiz)
gravar(ap, ader)

# ---------------- Presidente ----------------
qp, ap, quiz, ader = carregar("-presidente")
assert "regioes" not in quiz, "já aplicado"
quiz["regioes"] = REGIOES_BR

reaproveitar(quiz, ader, "enchente-seca", "seca-nordeste", ["nordeste"],
             "O açude secou de novo, o carro-pipa passa uma vez por semana e a feira ficou mais cara.",
             {"texto": "Em julho de 2025, 578 cidades do Nordeste estavam em situação de emergência por seca reconhecida pelo governo federal.",
              "fonte": "Ministério da Integração, via PE News (17/07/2025)",
              "url": "https://penews.com.br/governo-libera-r-17-milhao-para-apoiar-municipios-do-nordeste-atingidos-por-seca-e-estiagem/"},
             {"b": "Obras contra seca e enchente: barragens e reservatórios."})
reaproveitar(quiz, ader, "enchente-seca", "fumaca-queimada", ["norte", "centro-oeste"],
             "Na seca, a fumaça das queimadas cobre a cidade por semanas e o rio baixa tanto que o barco não passa.",
             {"texto": "Em 2024, o fogo atingiu 30,8 milhões de hectares no Brasil, 79% a mais que em 2023; a Amazônia teve 58% dessa área.",
              "fonte": "MapBiomas, Monitor do Fogo (22/01/2025)",
              "url": "https://brasil.mapbiomas.org/2025/01/22/area-queimada-no-brasil-cresce-79-em-2024-e-supera-os-30-milhoes-de-hectares/"})
reaproveitar(quiz, ader, "enchente-seca", "enchente-sul", ["sul"],
             "Desde a enchente de 2024, cada chuva forte deixa a cidade em alerta, e tem gente que ainda não recuperou a casa.")
reaproveitar(quiz, ader, "fila-cirurgia", "especialista-longe", ["norte"],
             "Pra consultar com especialista, sua mãe viaja de barco até a capital: dois dias de ida, e a fila ainda é de meses.",
             {"texto": "Pacientes do Norte percorrem em média 442 km para fazer radioterapia, seis vezes mais que os do Sul e do Sudeste (cerca de 70 km).",
              "fonte": "g1, 08/04/2026",
              "url": "https://g1.globo.com/saude/noticia/2026/04/08/pacientes-do-norte-viajam-ate-6-vezes-mais-que-os-do-sul-para-tratar-cancer-acesso-ainda-depende-do-cep.ghtml"})

quiz["versao"] = ader["versao_quiz"] = "1.3.0"
gravar(qp, quiz)
gravar(ap, ader)
print("ok")
