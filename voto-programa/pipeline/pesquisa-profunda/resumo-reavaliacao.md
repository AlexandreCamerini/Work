# Reavaliação das notas com os dossiês ampliados (25/09/2026)

Escopo: os 2 líderes de cada eleição (Datafolha 24/09: RJ Paes 43% / Ruas 30%; presidente Lula 40% / Flávio 36%).
Os outros 6 candidatos a governador não foram re-pesquisados; notas deles intactas.

| Candidato | Propostas | Notas mudadas | null → nota | Relatório |
|---|---|---|---|---|
| Eduardo Paes | 80 → 125 | 23 | 3 | reavaliacao-eduardo-paes.md |
| Douglas Ruas | → 160 | 27 (31 − 4 revertidas) | 8 | reavaliacao-douglas-ruas.md |
| Lula | 100 → 157 | 18 | 14 | reavaliacao-lula.md |
| Flávio Bolsonaro | 126 → 174 | 8 (9 − 1 revertida) | 7 | reavaliacao-flavio-bolsonaro.md |

Revisões do orquestrador antes da mescla (detalhe no fim de cada relatório):
- Ruas, passagem-cara e vale-transporte b/d: contradição inexistente (tarifa social e subsídio ao metrô convivem); notas antigas mantidas.
- Flávio, custo-contratar/a: a queda usava a PEC 12/2026, que só está em `lacunas`; revertida para 95.

## Auditoria de viés (`auditar_vies.py`, % de vitória com respostas aleatórias)

| Governador | antes | depois | leste | interior |
|---|---|---|---|---|
| andre-marinho | 12.0 | 14.6 | 13.8 | 18.4 |
| coronel-busnello | 14.7 | 17.7 | 21.4 | 17.0 |
| cyro-garcia | 11.3 | 11.9 | 13.1 | 10.9 |
| douglas-ruas | 21.4 | 16.6 | 16.6 | 15.4 |
| eduardo-paes | 16.2 | 13.2 | 13.6 | 14.9 |
| juliete-pantoja | 11.4 | 12.5 | 13.6 | 13.5 |
| luan-monteiro | 2.5 | 2.6 | 1.4 | 1.4 |
| william-siri | 10.3 | 10.9 | 6.5 | 8.6 |

Presidente: Flávio 35.4 → 43.4; Lula 64.6 → 56.6.

## Linha de base (golden)

`pipeline/ux/golden-baseline.json` regravada de propósito: mudaram só `dados` (hash de aderência/evidências) e
`perfisNomeados` (resultados das respostas fixas). Ids, preferências e seleção de cenas continuam idênticos.

## Riscos abertos para revisão humana
- Paes, licenca-empresa/c 95 → 55: depende de uma frase (p115, recado à Prolagos/ViaLagos sobre agência reguladora).
- Paes, operação policial b 90 → 55: p123 (BBC, maio) e p32 contra p31 (sabatina de setembro).
- Lula, largar-escola/a 95 → 55: Pé-de-Meia "para todos" (site) × focalizado (plano).
- Lula e Flávio, clima: 4 opções repetidas em 4 perguntas regionais passaram de null para 80/90 — pesam bastante para quem as escolhe.
- Flávio: p158 (câmeras corporais) é postagem de 2024, não proposta de campanha.
- Planos lidos de espelhos (Nexo/Poder360), não do PDF do TSE.
