# mac-doctor

Diagnóstico de segurança e desempenho do macOS com correções reversíveis.

| Caminho | O que é |
|---|---|
| `docs/SPEC.md` | Especificação de construção da v1 comercial: decisões, requisitos, arquitetura, contratos, marcos |
| `CLAUDE.md` | Regras para agentes que trabalham neste projeto |
| `prototype/mac-doctor.py` | Protótipo em Python (v2.1). Serve de oráculo das regras; não é a base do produto |
| `prototype/tests/` | Testes do protótipo, escritos para rodar em Linux como root com dados simulados |
| `../reports/Plano comercial do mac doctor.md` | Plano em etapas, com fontes |
| `../research_notes/Plano comercial do mac doctor/` | Notas de pesquisa por frente |

## Estado
- O protótipo nunca foi executado em macOS real; só com dados simulados.
- O app nativo ainda não existe. O primeiro marco (M0) é provar o protótipo em Mac real.

## Rodar o protótipo
```bash
python3 prototype/mac-doctor.py --demo   # interface com dados fictícios
python3 prototype/mac-doctor.py          # uso real, em macOS, pede senha de administrador
```
