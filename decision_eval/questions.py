"""Definição única das decisões avaliadas — compartilhada por todos os providers.

As chaves batem 1:1 com as regras de `prompt_optimizer.rules`, para que o
motor determinístico sirva de baseline sem tradução.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Question:
    key: str
    instructions: str
    true: str
    false: str


QUESTIONS: tuple[Question, ...] = (
    Question(
        "tarefa_explicita",
        "O prompt pede uma ação ou entrega concreta e identificável?",
        "Há um pedido claro do que produzir ou fazer (ex.: resumir X, "
        "listar Y, escrever Z)",
        "O pedido é vago, sem objeto definido, ou não há pedido",
    ),
    Question(
        "papel_definido",
        "O prompt atribui um papel, persona ou perspectiva ao modelo?",
        "Define quem o modelo deve ser ou como deve pensar (ex.: 'você é "
        "um advogado', 'pense como um investidor')",
        "Não atribui papel ao modelo",
    ),
    Question(
        "contexto_presente",
        "O prompt fornece contexto ou dados de entrada além da ordem em si?",
        "Inclui público, objetivo, situação ou material a processar",
        "Só a ordem, sem informação de apoio",
    ),
    Question(
        "formato_de_saida",
        "O prompt especifica o formato da resposta?",
        "Define estrutura, tamanho ou tipo de documento (tópicos, tabela, "
        "JSON, N itens, limite de palavras, e-mail, plano semanal)",
        "Não diz como a resposta deve ser estruturada",
    ),
    Question(
        "exemplos",
        "O prompt inclui pelo menos um exemplo da saída ou do par "
        "entrada→saída desejado?",
        "Há um exemplo concreto do resultado esperado",
        "Não há exemplo",
    ),
    Question(
        "restricoes",
        "O prompt declara limites, proibições ou escopo?",
        "Diz o que evitar, o que não fazer, tamanho máximo ou escopo "
        "permitido",
        "Não há limite nem restrição declarada",
    ),
    Question(
        "sem_linguagem_agressiva",
        "O prompt está livre de ênfase agressiva?",
        "Tom neutro, sem CAPS de ênfase, 'CRITICAL', 'YOU MUST', "
        "'MUITO IMPORTANTE' ou '!!!'",
        "Usa ênfase agressiva",
    ),
    Question(
        "usa_tags_xml",
        "O prompt usa tags no estilo XML para delimitar seções?",
        "Contém tags como <contexto>...</contexto>",
        "Não usa tags XML",
    ),
)

KEYS: tuple[str, ...] = tuple(q.key for q in QUESTIONS)
