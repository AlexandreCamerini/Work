"""Curadoria metodológica das cenas (setembro de 2026). Registro em pipeline/curadoria-cenas.md.

Só muda a forma de dizer: `preferencia` de cada opção fica igual, então as notas de aderência
continuam valendo. Cenas-variante por perfil reaproveitam as opções (e as notas) de uma cena
já avaliada, como via-expressa-fechada já fazia. Cada troca confere o texto antigo antes.
"""

import copy
import json
from pathlib import Path

DADOS = Path(__file__).resolve().parent.parent / "src" / "data"


def trocar(pergunta: dict, campo: str, antigo: str, novo: str) -> None:
    if campo.startswith("opcao:"):
        alvo = next(o for o in pergunta["opcoes"] if o["id"] == campo.split(":")[1])
        chave = "texto"
    else:
        alvo, chave = pergunta, campo
    assert alvo[chave] == antigo, f"{pergunta['id']}/{campo}: texto mudou: {alvo[chave]!r}"
    alvo[chave] = novo


def variante(perguntas: list, origem: str, novo_id: str, publico: dict, cena: str) -> None:
    base = next(p for p in perguntas if p["id"] == origem)
    nova = copy.deepcopy(base)
    nova.update({"id": novo_id, "publico": publico, "cena": cena})
    nova.pop("consenso", None)
    perguntas.insert(perguntas.index(base) + 1, nova)


def aplicar(arquivo: str, versao: str, edicoes: list, variantes: list) -> None:
    quiz_path = DADOS / f"quiz{arquivo}.json"
    ader_path = DADOS / f"aderencia{arquivo}.json"
    quiz = json.loads(quiz_path.read_text(encoding="utf-8"))
    ader = json.loads(ader_path.read_text(encoding="utf-8"))
    por_id = {p["id"]: p for p in quiz["perguntas"]}
    for pid, campo, antigo, novo in edicoes:
        trocar(por_id[pid], campo, antigo, novo)
    for origem, novo_id, publico, cena in variantes:
        variante(quiz["perguntas"], origem, novo_id, publico, cena)
        ader["itens"][novo_id] = copy.deepcopy(ader["itens"][origem])
    quiz["versao"] = ader["versao_quiz"] = versao
    quiz_path.write_text(json.dumps(quiz, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    ader_path.write_text(json.dumps(ader, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


PLANO = {"saude": ["plano_empresa", "plano_proprio"]}

aplicar(
    "",
    "3.3.0",
    [
        ("trem-parado", "opcao:c",
         "Botar o trem no padrão do BRT, com segurança própria a bordo.",
         "Trem novo, no horário e com segurança própria a bordo."),
        ("transito-carro", "cena",
         "Fim de tarde, Linha Vermelha travada. Pra rodar 10 km você gasta quase meia hora.",
         "Fim de tarde, Linha Vermelha parada. Dez quilômetros levam quase meia hora, e amanhã tem de novo."),
        ("transito-carro", "opcao:c",
         "Novas ligações de via: Via Light com Linha Vermelha, Av. Brasil e Dutra.",
         "Novas ligações entre as vias expressas, pra desafogar Linha Vermelha e Av. Brasil."),
        ("passagem-cara", "opcao:b",
         "Desconto só pra quem ganha pouco, sem estourar as contas.",
         "Desconto só pra quem ganha pouco, sem estourar as contas do estado."),
        ("passagem-cara", "opcao:c",
         "Tirar o cartão do ônibus da mão das empresas e abrir as contas.",
         "Tirar o cartão de passagem da mão das empresas de ônibus e abrir as contas."),
        ("celular-roubado", "opcao:b",
         "Muito mais PM: concurso e policial na rua.",
         "Mais PM na rua, chamando quem passou no concurso."),
        ("roubo-carro", "opcao:b",
         "Muito mais PM na rua, com concurso.",
         "Mais PM na rua, chamando quem passou no concurso."),
        ("falta-agua", "opcao:d",
         "O Estado retoma a Cedae: água não é pra dar lucro.",
         "O Estado retoma a Cedae e volta a cuidar da água e do esgoto."),
        ("primo-desempregado", "opcao:c",
         "Emprego é com a empresa privada. O estado cuida da segurança.",
         "Gerar emprego é papel da empresa privada; o estado deve cuidar da segurança."),
        ("primo-desempregado", "opcao:d",
         "Zerar o imposto da moto de quem trabalha com ela.",
         "Zerar o IPVA da moto de quem trabalha com ela."),
        ("servidor-recomposicao", "opcao:c",
         "Ir à Justiça recuperar o dinheiro do Rioprevidência aplicado no Banco Master.",
         "Recuperar na Justiça o dinheiro da previdência dos servidores aplicado no Banco Master."),
        ("dinheiro-publico", "cena",
         "No posto falta remédio, mas no jornal tem notícia de cargo fantasma e gasto com festa.",
         "O estado diz que falta dinheiro, e no posto falta remédio. No jornal, tem notícia de cargo sobrando e de imposto perdoado pra empresa grande."),
        ("dinheiro-publico", "opcao:b",
         "Auditoria em todo contrato e um órgão só pra vigiar a integridade.",
         "Auditar todo contrato, com um órgão só pra vigiar desvio."),
    ],
    [
        ("fila-especialista", "plano-voltou-sus", PLANO,
         "O plano de saúde da sua mãe ficou caro demais depois dos 60, e ela voltou pro SUS. Já são 5 meses esperando consulta com especialista."),
        ("rua-alagada", "garagem-alagada", {"faixa": ["privado"]},
         "Choveu forte, a garagem do prédio encheu e a rua virou rio. Você perdeu o dia preso no trânsito, e o carro de um vizinho ficou debaixo d'água."),
        ("falta-agua", "caminhao-pipa", {"faixa": ["privado"]},
         "Faltou água no prédio por três dias. O condomínio chamou caminhão-pipa, e a cota extra veio no boleto."),
    ],
)

aplicar(
    "-presidente",
    "1.2.0",
    [
        ("escala-6x1", "cena",
         "Você trabalha seis dias por semana e só folga um. No domingo, mal dá pra ver a família.",
         "Você, ou alguém da sua casa, trabalha seis dias por semana e folga um. No domingo, mal dá pra ver a família."),
        ("escala-6x1", "opcao:c",
         "Rever as regras que deixaram o trabalho mais precário.",
         "Rever pontos da reforma trabalhista e da terceirização."),
        ("trabalho-app", "opcao:d",
         "Deixar como está: app é liberdade, sem lei nova mexendo nisso.",
         "Deixar como está, sem lei nova sobre trabalho por app."),
        ("salario-minimo", "cena",
         "Você ganha um salário mínimo e, no fim do mês, a conta não fecha.",
         "Você, ou alguém da sua casa, vive com um salário mínimo, e no fim do mês a conta não fecha."),
        ("salario-minimo", "opcao:c",
         "Programa de pontos: pagar conta em dia e fazer curso dá desconto e juro menor.",
         "Programa de pontos: quem paga conta em dia e faz curso ganha desconto e juro menor."),
        ("imposto-renda", "cena",
         "Na declaração do imposto de renda você sente que paga imposto em tudo, do salário ao que compra.",
         "Na hora de declarar o imposto de renda, você faz a conta de quanto vai pro governo, no salário e no que compra."),
        ("juros-altos", "cena",
         "Você adiou trocar de carro ou financiar a casa porque os juros continuam altos.",
         "Os juros do cartão, do crediário e do financiamento continuam altos, e qualquer compra parcelada pesa."),
        ("faccao-bairro", "cena",
         "Em muitos bairros, uma facção manda na rua e cobra taxa até do gás.",
         "Em muitos bairros, talvez no de alguém que você conhece, a facção manda na rua e cobra taxa até do gás e da internet."),
        ("faccao-bairro", "opcao:a",
         "Tratar facção como terrorismo e se juntar aos EUA contra elas.",
         "Tratar facção como grupo terrorista, com apoio de outros países."),
        ("conta-luz", "cena",
         "A conta de luz não para de subir, e encher o tanque assusta.",
         "A conta de luz não para de subir, e encher o tanque ou comprar o botijão assusta."),
        ("enchente-seca", "cena",
         "Enchente num ano, seca no outro: parece que o tempo ficou mais extremo.",
         "Num ano, a enchente leva a casa de conhecidos; no outro, a seca deixa a luz e a comida mais caras."),
        ("video-falso", "opcao:b",
         "Nenhuma regra nova: liberdade de expressão acima de tudo.",
         "Nenhuma regra nova, e fim dos órgãos do governo que decidem o que é mentira."),
        ("gasto-governo", "cena",
         "Você vê notícia de ministério demais e de emenda parlamentar bilionária.",
         "O governo diz que falta dinheiro pra saúde e escola, e a conta da própria máquina não para de crescer."),
        ("gasto-governo", "pergunta",
         "O que você cobraria do próximo presidente?",
         "Por onde o próximo presidente devia começar?"),
    ],
    [
        ("fila-cirurgia", "plano-voltou-sus", PLANO,
         "O plano de saúde da sua mãe ficou caro demais depois dos 60, e ela voltou pro SUS. Agora espera uma cirurgia há meses."),
        ("celular-roubado", "celular-sinal", {"deslocamento": ["carro", "app"]},
         "Parado no sinal, com o vidro aberto, levaram o celular da sua mão. Alguém da sua família já tinha passado pela mesma coisa."),
    ],
)
# falta-tecnico ("na empresa onde você trabalha") ia para qualquer um sem filho em escola
# pública, inclusive motoboy e desempregado; passa a exigir carteira assinada ou empresa.
quiz_path = DADOS / "quiz.json"
quiz = json.loads(quiz_path.read_text(encoding="utf-8"))
ft = next(p for p in quiz["perguntas"] if p["id"] == "falta-tecnico")
ft["publico"] = {"escola": ["particular", "nenhuma"], "trabalho": ["carteira", "empresario"]}
quiz_path.write_text(json.dumps(quiz, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("ok")
