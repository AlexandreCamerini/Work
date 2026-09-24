# Qual proposta combina com o seu dia a dia?

Quiz para o eleitor comparar as próprias escolhas em situações do dia a dia com as
propostas documentadas dos candidatos, com a fala literal de cada um e a fonte. Os
candidatos ficam escondidos até o fim. Duas eleições de 2026 (1º turno em 04/10):

- **Governador do Rio de Janeiro**: 18 cenas de competência estadual.
- **Presidente da República**: 16 cenas de competência federal, com Lula (PT) e Flávio
  Bolsonaro (PL), os dois primeiros nas pesquisas (Datafolha 17/09, Quaest 21/09).

E uma área **"Prometeu, fez?"** de acompanhamento de promessas, construída mas fora
do ar até depois do 2º turno (ver abaixo).

## Como funciona

```
pipeline/dossies/<eleicao>/*.json   propostas por candidato, com trecho literal e URL (pesquisa com Exa)
pipeline/pesquisa-*.md              dores do eleitor, perfis, fatos nacionais e limites legais, com fonte
        │
        ▼  pipeline/gerar_cenas.py   (Claude, offline) → rascunho → revisão humana
src/data/quiz*.json                 cenas; cada opção tem uma "preferencia" de política pública implícita
        │
        ▼  pipeline/aderencia.py     (Claude, offline) → revisão humana
src/data/aderencia*.json            nota 0-100 (ou null) por cena × opção × candidato, com evidências
src/data/evidencias*.json           só os trechos citados, para o site mostrar
        │
        ▼  site (React, 100% no navegador, sem IA em tempo de uso)
perfil (5 toques) → escolhe as cenas → afinidade = média das notas das opções escolhidas
```

- **Perfil sem rótulo de classe.** Cinco toques (onde vai ao médico, escola das
  crianças, como se desloca, trabalho, número de banheiros), todos opcionais. Não se
  pergunta renda: a ABEP considera a pergunta mau estimador de nível socioeconômico,
  e banheiros é o item de maior peso do Critério Brasil 2026. O índice estima uma faixa
  larga (serviço público, misto, serviço privado), nunca mostrada na tela. Base em
  `pipeline/pesquisa-perfis.md`.
- **Cena por perfil.** Cenas do mesmo assunto formam um grupo; cada pessoa vê uma
  por grupo. Quem usa carro vê trânsito e roubo de carro; servidor vê recomposição e
  Rioprevidência; quem tem empresa vê licença e custo de contratar; faixas média e
  alta veem imposto de renda e segurança na orla. Quem pula o perfil vê as cenas padrão.
- **Competência respeitada.** Plano de saúde e mensalidade escolar são federais (ou de
  ninguém) e não entram como cena de governador.
- **Ausência não é discordância.** Sem proposta sobre o assunto, a nota é `null` e a
  escolha não conta nem a favor nem contra; o resultado diz quantas escolhas ficaram
  de fora para cada candidato. Abaixo de 3 situações com evidência, mostra "—".
- **Nada sai do navegador.** Sem backend, sem login, sem armazenar respostas.

## Prometeu, fez?

`pipeline/acompanhamento/<mandato>.json`: compromissos do plano de governo com status
(`cumprida`, `parcial`, `em_andamento`, `nao_cumprida`, `na_contramao`,
`sem_informacao`), explicação neutra e evidências com trecho e URL.
`pipeline/acompanhar.py` reapura cada compromisso com Claude + busca na web; evidência
cuja URL não veio da busca é descartada, e toda mudança vai para
`pipeline/acompanhamento/pendentes/` para revisão humana.

Primeiro caso: mandato atual de Lula comparado com o plano de 2022 (40 compromissos).
**Decisão editorial: a área só vai ao ar depois do 2º turno**, para não publicar em
plena campanha um placar que só existe para quem já governou. O build de produção só
inclui esses dados com `VITE_PUBLICAR_ACOMPANHAMENTO=true`. Os vencedores de 2026
passam a ser acompanhados a partir da posse.

## Restrições legais que moldaram o desenho

Levantamento em `pipeline/pesquisa-eleitor-rj.md` (seção 5) e
`pipeline/pesquisa-perfis.md` (LGPD). Validar com advogado eleitoral antes de publicar.

- **IA não recomenda candidato** (Res. TSE 23.755/2026, art. 28, §1º-C da Res.
  23.610): nenhuma IA roda no site. A IA propõe cenas e notas nos bastidores; o que é
  publicado é decisão editorial revisada por uma pessoa.
- **Enquete proibida desde 15/08/2026:** só resultado individual, nenhum agregado.
- **Anonimato vedado** (Lei 9.504/97, art. 57-D): preencher `src/config.ts`.
- **Sem impulsionamento pago** nem influenciador pago.
- **Nada de conteúdo sintético novo com candidato entre 01 e 05/10.**
- **LGPD:** respostas e resultado podem revelar opinião política (dado sensível):
  nada de analytics com respostas, nada de respostas na URL, nada de scripts de terceiros.

## Rodando

```bash
npm install
npm run dev        # desenvolvimento
npm test           # afinidade, perfil e integridade dos dados das duas eleições
npm run build && npm run lint

# pipelines com Claude (precisa de ANTHROPIC_API_KEY ou `ant auth login`)
pip install "anthropic>=1"
python pipeline/gerar_cenas.py --eleicao presidente --tema saude --perfil "tem plano de saúde"
python pipeline/aderencia.py --eleicao governador-rj
python pipeline/acompanhar.py lula-2022

# build com a área de acompanhamento (só depois do 2º turno)
VITE_PUBLICAR_ACOMPANHAMENTO=true npm run build
```

## Antes de publicar (pendências reais)

- [ ] **Revisão humana das notas** (`pipeline/relatorio-aderencia*.md`): são rascunho
      de IA (campo `modelo`); preencher `revisado_por` depois de conferir.
- [ ] **Revisão humana do acompanhamento de Lula 2022**: status discutíveis marcados
      pelo agente (salário mínimo e reforma tributária como "cumprida", "mandato único"
      como "na contramão", orçamento secreto proibido pelo STF antes da posse).
- [ ] **Conferir os planos com o original do TSE**: todos vieram de espelhos (Nexo,
      ND+, Poder360), porque o download direto do TSE falhou deste ambiente.
- [ ] **Pontos marcados pelos agentes**: contradições entre plano e falas de André
      Marinho; plano de Luan Monteiro é o programa nacional do PCO; Garotinho sem plano
      oficial e com candidatura sub judice (fora do quiz); falas de Lula só na TVT News;
      trechos de notícia de Flávio copiados à mão.
- [ ] **Validar a heurística de perfil**: os cortes 0,34 e 0,66 são ponto de partida;
      calibrar com um piloto contra o Critério Brasil completo.
- [ ] **Testar as cenas com 5-10 eleitores** de perfis diferentes.
- [ ] **Preencher o responsável** em `src/config.ts` e **validação jurídica**.
- [ ] Acessibilidade (contraste e leitor de tela).

## Deploy

Site estático (`npm run build` gera `dist/`). Nenhum deploy foi feito.
