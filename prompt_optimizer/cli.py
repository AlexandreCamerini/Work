"""Interface de linha de comando do otimizador de prompts."""

from __future__ import annotations

import argparse
import sys

from .rules import analyze
from .templates import build_optimized_prompt, render_report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="prompt_optimizer",
        description="Transforma prompts crus em prompts estruturados e "
        "eficientes para o Claude.",
    )
    parser.add_argument("prompt", nargs="?", help="O prompt a otimizar.")
    parser.add_argument("-f", "--file", help="Ler o prompt de um arquivo.")
    parser.add_argument("-o", "--output", help="Salvar o resultado em arquivo.")
    parser.add_argument(
        "--analyze", action="store_true",
        help="Mostrar apenas o diagnóstico, sem gerar o prompt otimizado.",
    )
    parser.add_argument(
        "--refine", action="store_true",
        help="Refinar o resultado via Claude API (requer ANTHROPIC_API_KEY).",
    )
    args = parser.parse_args(argv)

    if args.file:
        with open(args.file, encoding="utf-8") as fh:
            prompt = fh.read()
    elif args.prompt:
        prompt = args.prompt
    else:
        parser.error("informe o prompt como argumento ou via --file")

    if not prompt.strip():
        parser.error("o prompt está vazio")

    analysis = analyze(prompt)
    print(render_report(analysis))

    if args.analyze:
        return 0

    result = build_optimized_prompt(analysis)

    if args.refine:
        from .refiner import refine

        refined = refine(result, prompt)
        result = refined.prompt_otimizado
        print("\nMudanças aplicadas pelo refinamento:")
        for change in refined.mudancas:
            print(f" - {change}")
        if refined.perguntas_abertas:
            print("\nPerguntas para você responder e melhorar o prompt:")
            for q in refined.perguntas_abertas:
                print(f" ? {q}")

    print("\n--- PROMPT OTIMIZADO " + "-" * 40 + "\n")
    print(result)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as fh:
            fh.write(result + "\n")
        print(f"\nSalvo em: {args.output}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
