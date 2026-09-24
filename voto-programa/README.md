# Qual proposta combina com o seu dia a dia?

Quiz para o eleitor fluminense comparar as próprias escolhas em situações do dia a
dia (trem parado, fila de especialista, rua alagada) com as propostas documentadas
dos candidatos a governador do Rio de Janeiro em 2026. Os candidatos ficam
escondidos até o fim, e cada resultado mostra a fala literal do candidato com o
link da fonte.

**Piloto:** Eduardo Paes (PSD) e Douglas Ruas (PL), os dois com maior intenção de
voto (Datafolha, 14/09/2026). 1º turno em 04/10/2026.

## Como funciona

```
pipeline/dossies/governador-rj/*.json  propostas de cada candidato, com trecho literal e URL (pesquisa com Exa)
src/data/quiz.json           11 cenas; cada opção tem uma "preferencia" de política pública implícita
        │
        ▼  pipeline/aderencia.py  (Claude, offline)  →  revisão humana
src/data/aderencia.json      nota 0-100 (ou null) por cena × opção × candidato, com evidências
src/data/evidencias.json     só os trechos citados, para o site mostrar
        │
        ▼  site (React, 100% no navegador, sem IA em tempo de uso)
afinidade = média das notas das opções escolhidas (temas prioritários valem 2×)
```

- **Sem régua ideológica.** A versão anterior forçava cada cena num eixo -2..+2 e as
  opções viravam caricatura. Agora a opção é uma reação natural, e a comparação é
  direta com o que cada candidato propôs.
- **Ausência não é discordância.** Se o candidato não tem proposta sobre o assunto,
  a nota é `null` e a escolha não conta nem a favor nem contra. Abaixo de 3
  situações com evidência, o site mostra "—" em vez de percentual.
- **Nada sai do navegador.** Sem backend, sem login, sem armazenar respostas
  (opinião política é dado sensível na LGPD).

## Restrições legais que moldaram o desenho

Levantamento completo em `pipeline/pesquisa-eleitor-rj.md` (seção 5). Validar com
advogado eleitoral antes de publicar.

- **IA não recomenda candidato** (Res. TSE 23.755/2026, art. 28, §1º-C da Res.
  23.610): por isso nenhuma IA roda no site. A IA só propõe a tabela de notas nos
  bastidores; a nota publicada é decisão editorial revisada por uma pessoa.
- **Enquete proibida desde 15/08/2026:** o site mostra só o resultado individual.
  Não publicar nenhum agregado ("X% dos usuários combinam com fulano").
- **Anonimato vedado** (Lei 9.504/97, art. 57-D): preencher `src/config.ts`.
- **Sem impulsionamento pago** nem influenciador pago; distribuição orgânica
  (WhatsApp).
- **Nada de conteúdo sintético novo com candidato entre 01 e 05/10.**

## Rodando

```bash
npm install
npm run dev        # desenvolvimento
npm test           # lógica de afinidade + integridade dos dados publicados
npm run build && npm run lint

# recalcular a aderência (precisa de ANTHROPIC_API_KEY ou `ant auth login`)
pip install "anthropic>=1" pydantic
python pipeline/aderencia.py
```

Os testes de integridade falham se alguma opção ficar sem avaliação, se uma nota
não tiver evidência com trecho e URL, ou se a tabela de aderência for de outra
versão do quiz.

## Antes de publicar (pendências reais)

- [ ] **Revisão humana de `src/data/aderencia.json`.** A tabela atual é um rascunho
      feito por IA na sessão de desenvolvimento (campo `modelo`); falta alguém
      conferir cada nota em `pipeline/relatorio-aderencia.md` e preencher
      `revisado_por`.
- [ ] **Conferir os planos de governo com o original do TSE.** Os dois dossiês usam
      cópias espelhadas (Nexo Jornal e ND+), porque o download direto do TSE falhou.
      O de Paes é uma "versão preliminar"; checar se há versão mais nova.
- [ ] **Pontos marcados pelos agentes de pesquisa:** fala atribuída a "Rodrigo
      Ruas" no Extra (provável erro de digitação), teto de gastos de Ruas pode ser
      ato como deputado, números divergentes de Paes (150/155 equipes, 7/8
      supercentros), e posições em tensão de Paes sobre "neutralizar".
- [ ] **Escopo de candidatos.** Mostrar só 2 de 9 pode ser lido como favorecimento.
      O site lista os outros 7; o ideal é montar dossiês de todos com registro
      deferido antes de publicar.
- [ ] **Preencher o responsável** em `src/config.ts`.
- [ ] **Testar as 11 cenas com 5-10 eleitores** fora da bolha política (linguagem,
      opções que parecem forçadas, tempo de resposta).
- [ ] **Validação jurídica** dos pontos acima.
- [ ] Acessibilidade (auditoria de contraste e leitor de tela).

## Deploy

Site estático (`npm run build` gera `dist/`), publicável em qualquer host estático.
Nenhum deploy foi feito.
