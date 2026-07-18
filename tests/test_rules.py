"""Testes do motor determinístico (sem LLM)."""

from prompt_optimizer.rules import analyze
from prompt_optimizer.templates import build_optimized_prompt, render_report


def test_vague_prompt_scores_low():
    analysis = analyze("melhore isso")
    assert not analysis.has("tarefa_explicita")
    assert analysis.score < 40


def test_complete_prompt_scores_high():
    prompt = (
        "Você é um analista financeiro sênior. Com base no contexto do "
        "relatório abaixo, resuma os 3 principais riscos em uma lista "
        "numerada, com no máximo 2 frases por item. Não invente dados. "
        "Por exemplo: '1. Risco cambial: ...'. <relatorio>...</relatorio>"
    )
    analysis = analyze(prompt)
    assert analysis.has("tarefa_explicita")
    assert analysis.has("papel_definido")
    assert analysis.has("formato_de_saida")
    assert analysis.has("restricoes")
    assert analysis.has("exemplos")
    assert analysis.score >= 80


def test_determinism_same_input_same_output():
    prompt = "resuma o documento"
    first = build_optimized_prompt(analyze(prompt))
    second = build_optimized_prompt(analyze(prompt))
    assert first == second


def test_aggressive_language_flagged():
    analysis = analyze("CRITICAL: you must resumir o texto!!")
    assert not analysis.has("sem_linguagem_agressiva")


def test_template_adds_placeholders_for_gaps():
    result = build_optimized_prompt(analyze("resuma o documento"))
    assert "<tarefa>" in result
    assert "[PREENCHER" in result
    assert "<formato>" in result


def test_report_renders():
    report = render_report(analyze("resuma o documento em 5 tópicos"))
    assert "Pontuação do prompt" in report
