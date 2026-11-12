# ADR 0004 — F11: regras locais decidem; a IA só explica e prioriza

Status: aceita · 12 nov 2026 · marco M1

## Contexto
Texto coletado da máquina (nome de processo, script, rótulo) pode ter sido escrito por um atacante e chega à IA. Se a IA pudesse mudar severidade, criar achado ou acionar correção, uma injeção num script viraria "provavelmente legítimo" e esconderia o item, ou dispararia uma ação.

## Decisão
O piso é garantido pelo sistema de tipos em `MDModel`, não por disciplina:
- `Finding.severity` é `let` e só a regra a define.
- O parecer da IA é outro tipo, `AIOpinion` (`AIVerdict`: provavelmente legítimo, investigar, suspeito; `AIConfidence`). Não tem campo de severidade e referencia o achado só pelo `FindingID`.
- `Severity.raised(toFloor:)` existe para qualquer valor proposto fora da regra: o resultado nunca fica abaixo do piso. Testado para as nove combinações.
- `AIVerdict(lenient:)` e `AIConfidence(lenient:)` convertem valor fora do esquema no mais conservador (investigar, baixa), como no protótipo (SPEC 9.4).
- `RuleID` é enum fechado: a validação da resposta recusa regra inexistente.
- `Fix` é enum fechado espelhando o catálogo 10.1; a IA não tem tipo para pedir ação.

## Consequências
- Ganho: violar o piso exige mudar tipo público, visível no diff e na revisão.
- Custo: regra nova exige mudar `RuleID` (aceitável: regras atualizam junto com o app na v1, seção 12).
- Onde quebra: a interface ainda pode ordenar por parecer em vez de severidade; o M2 precisa de critério de aceite explícito para isso (9.5: o parecer não altera cor nem ordem do placar).
