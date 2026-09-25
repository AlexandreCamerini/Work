# Qual proposta combina com o seu dia a dia?

Quiz para o eleitor comparar as próprias escolhas em situações do dia a dia com as
propostas documentadas dos candidatos, com a fala literal de cada um e a fonte. Os
candidatos ficam escondidos até o fim. Duas eleições de 2026 (1º turno em 04/10):

- **Governador do Rio de Janeiro**: 18 cenas de competência estadual e 8 candidatos.
  Anthony Garotinho fica fora: candidatura sub judice e sem plano de governo registrado.
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
perfil (5 toques) → escolhe as cenas → afinidade = média dos pontos centrados por cena
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
- **Nota centrada por cena.** O ponto de cada escolha é 50 + (nota da opção escolhida −
  média das notas do candidato naquela cena). Quem apoia todas as opções fica em 50.
  Com a média simples, um eleitor que respondia ao acaso via Douglas Ruas em 1º em 76%
  das vezes, e cinco candidatos perto de 0%. `pipeline/auditar_vies.py` refaz essa
  checagem (eleitor aleatório e eleitor-espelho) e deve rodar a cada mudança de nota.
- **Ausência não é discordância.** Sem proposta sobre o assunto, a nota é `null` e a
  escolha não conta nem a favor nem contra; o resultado diz quantas escolhas ficaram
  de fora para cada candidato. Abaixo de 3 situações com evidência, mostra "—".
- **Ordem misturada.** Cada pessoa recebe as cenas numa ordem sorteada, sem dois temas
  iguais em sequência (`src/lib/ordem.ts`), e as opções de cada cena também em ordem
  sorteada, para a primeira da lista não ser favorecida. Toda cena tem pelo menos 4 opções.
- **Atende / não atende.** No resultado, cada candidato (às cegas) mostra quais escolhas
  ele atende (nota 70+), atende em parte (40-69) e não atende (abaixo de 40). Justificativa
  e fonte só aparecem depois do voto, porque citação e veículo entregariam quem é.
- **Voto às cegas, depois os nomes.** A pessoa vota no "Candidato A, B…"; só então os
  nomes aparecem. Nenhum placar é mostrado.
- **Respostas não saem do navegador.** Sem login e sem armazenar respostas. O único
  dado enviado é a posição do candidato votado no ranking da pessoa (ver abaixo).

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

## Votação anônima, só para uso interno

`server/`: API em [Hono](https://hono.dev) com duas rotas (`GET /api/estado`,
`POST /api/votos`). **Não existe rota de leitura:** nenhum resultado é mostrado na página
nem pode ser consultado pela internet.

- **Por quê.** A Res. TSE 23.600/2019, art. 23, §1º, define enquete como o levantamento
  sem método científico "quando apresentados resultados que possibilitem ao eleitor
  inferir a ordem dos candidatos". Sem resultado apresentado, o argumento é que não há
  enquete. **Validar com advogado eleitoral** (a Lei 9.504/97, art. 33, §5º, fala em
  "realização").
- **O que é gravado durante a campanha** (`COLETA_ATIVA=true`): só a **posição, no ranking
  de afinidade da pessoa, do candidato em que ela votou** (1º, 2º…), tabela
  `posicao_voto`. Não diz quem é o candidato, então não permite inferir a ordem da
  disputa. Serve para medir o produto: se a maioria vota no 1º ou 2º, o teste ajuda a
  pessoa a se reconhecer nas propostas.
- **Contador por candidato** (`CONTAR_CANDIDATO`, tabela `placar`): **desligado**. Com ele
  desligado, o navegador nem envia o candidato, e o servidor descarta se receber. Ligar
  só depois do 2º turno e com aval jurídico.
- **Só contadores.** Nenhuma linha por voto, horário, IP, cookie ou identificador.
- **Leitura só com acesso ao banco** (conta Cloudflare ou Postgres), nunca por página:
  `npm run interno:posicoes` e, depois do 2º turno, `npm run interno:candidatos`.
- **Regras de uso interno (combinar com a equipe):** nenhum número sai da equipe, nem
  print, nem "mais ou menos"; vazamento transforma a coleta em enquete divulgada (multa de
  R$ 53 mil a R$ 106 mil e ordem de remoção). Nada vai para campanha ou partido: dado de
  intenção de voto cedido de graça pode ser visto como doação estimável em dinheiro, e
  vinda de pessoa jurídica é proibida.
- **Contra fraude sem identificar ninguém:** lista fechada de eleições e candidatos,
  posição dentro do ranking, JSON obrigatório (força preflight de CORS, que não é
  liberado), origem conferida, corpo de até 4 KB, limite de 5 votos por minuto por IP (a
  chave vive só no limitador, nunca é gravada), Cloudflare Turnstile opcional (sem cookie;
  o IP não é enviado na verificação) e trava de um voto por navegador em `localStorage`.
- **Transparência:** antes de votar, a pessoa lê exatamente o que é guardado; depois,
  "registrado de forma anônima, só para análise interna; não divulgamos resultado".
- **Cabeçalhos de segurança** em tudo: CSP restrita a `'self'` (mais Turnstile), HSTS,
  `frame-ancestors 'none'`, `Referrer-Policy: no-referrer`. Fontes servidas pelo próprio
  site (antes vinham do Google, que recebia o IP de cada visitante). Nenhum script de
  terceiros, nenhum analytics. `public/_headers` repete os cabeçalhos para os arquivos
  estáticos; um teste confere que batem.

## Restrições legais que moldaram o desenho

Levantamento em `pipeline/pesquisa-eleitor-rj.md` (seção 5) e
`pipeline/pesquisa-perfis.md` (LGPD). Validar com advogado eleitoral antes de publicar.

- **IA não recomenda candidato** (Res. TSE 23.755/2026, art. 28, §1º-C da Res.
  23.610): nenhuma IA roda no site. A IA propõe cenas e notas nos bastidores; o que é
  publicado é decisão editorial revisada por uma pessoa.
- **Enquete proibida desde 15/08/2026:** nenhum resultado de votação é apresentado, e
  o contador por candidato fica desligado até depois do 2º turno.
- **Anonimato vedado** (Lei 9.504/97, art. 57-D): preencher `src/config.ts`.
- **Sem impulsionamento pago** nem influenciador pago.
- **Nada de conteúdo sintético novo com candidato entre 01 e 05/10.**
- **LGPD:** respostas, resultado e voto revelam opinião política (dado sensível). Por
  isso o voto vira só +1 num contador (dado anonimizado, fora da LGPD pelo art. 12), e
  nada de analytics com respostas, nada de respostas na URL, nada de scripts de terceiros.

## Rodando

```bash
npm install
npm run dev        # desenvolvimento
npm test           # afinidade, perfil, ordem, dados das duas eleições e API de votos
npm run build && npm run lint

# API de votos local, no runtime da Cloudflare (workerd), com D1 local
npx wrangler d1 migrations apply voto-programa --local
npx wrangler dev

# pipelines com Claude (precisa de ANTHROPIC_API_KEY ou `ant auth login`)
pip install "anthropic>=1"
python pipeline/gerar_cenas.py --eleicao presidente --tema saude --perfil "tem plano de saúde"
python pipeline/aderencia.py --eleicao governador-rj
python pipeline/mesclar_rascunhos.py --eleicao governador-rj --excluir anthony-garotinho
python pipeline/auditar_vies.py --eleicao governador-rj
python pipeline/acompanhar.py lula-2022

# build com a área de acompanhamento (só depois do 2º turno)
VITE_PUBLICAR_ACOMPANHAMENTO=true npm run build
```

## Antes de publicar (pendências reais)

- [ ] **Revisão humana das notas** (`pipeline/relatorio-aderencia*.md`): são rascunho
      de IA (campo `modelo`); preencher `revisado_por` depois de conferir.
- [ ] **Calibração entre avaliadores**: as notas de Paes e Ruas foram feitas numa
      rodada e as dos outros 6 em outra, com escala mais comprimida (Marinho 35-75 onde
      Paes/Ruas têm 10-95). A centragem reduz o efeito mas não zera. No eleitor-espelho,
      Siri fica em 3º e Luan em 2º mesmo escolhendo as opções preferidas deles.
- [ ] **Notas duvidosas apontadas pelos avaliadores**: Marinho em medida-protetiva (tudo
      null apesar do Pacto contra o feminicídio); Marinho 45 e Siri 55 no Banco Master
      (servidor-recomposicao/c); Siri 40 em policiamento só por convocação de concursados;
      Busnello 40 em letalidade (d) e 40 em fila-especialista; Cyro 60 em falta-agua/c
      por inferência; Luan 40 em letalidade; Juliete 40 no BRT da Baixada e 30 em
      presença do Estado pós-operação.
- [ ] **Situação do registro** de Marinho, Siri, Busnello, Cyro, Juliete e Luan no
      DivulgaCand (hoje só consta "registrada").
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
- [ ] **Pré-teste cognitivo das cenas**: 5 a 8 pessoas por faixa lendo em voz alta e
      dizendo o que entenderam (ver `pipeline/curadoria-cenas.md`, que registra a
      curadoria metodológica de 25/09 e seus critérios).
- [ ] **Região no perfil** (capital, Baixada, Niterói/São Gonçalo, interior): recomendado
      para o governo do Rio, onde a região muda transporte, água e segurança.
- [ ] **Preencher o responsável** em `src/config.ts` e **validação jurídica**, inclusive
      da coleta interna (tese do art. 23, §1º) e de quando ligar o contador por candidato.
- [ ] **Termos e aviso de privacidade** na página, mesmo com dado anonimizado.
- [ ] Acessibilidade (contraste e leitor de tela).

## Deploy

Nenhum deploy foi feito. Duas opções prontas:

| | **Cloudflare Workers + D1 (recomendado)** | Railway + Postgres |
|---|---|---|
| Arquivos | `wrangler.jsonc`, `server/worker.ts` | `railway.json`, `server/node.ts` |
| IP do eleitor | não aparece para nós: sem Workers Logs (`observability` desligado) e sem Logpush | **os logs HTTP da plataforma gravam o IP de origem** (`srcIp`) de toda requisição, e não dá para desligar |
| Ataque e robôs | DDoS e WAF da Cloudflare, Rate Limiting na borda, Turnstile nativo | sem WAF configurável; o próprio Railway recomenda pôr Cloudflare na frente |
| Pico de acesso (WhatsApp) | borda global, escala sozinho | um container por região; precisa dimensionar |
| Custo nesta escala | plano gratuito cobre | pago por uso (serviço + Postgres) |

Passos na Cloudflare:

```bash
npx wrangler login
npx wrangler d1 create voto-programa        # copiar o database_id para wrangler.jsonc
npm run db:migrar
npx wrangler secret put TURNSTILE_SECRET    # opcional; TURNSTILE_SITE_KEY em "vars"
npm run deploy:cloudflare
```

Depois: domínio próprio no painel. Só depois do 2º turno e com aval jurídico,
`CONTAR_CANDIDATO` para `"true"` em `wrangler.jsonc` e novo deploy.

No Railway: novo serviço a partir do repositório (raiz `voto-programa/`), plugin
Postgres (injeta `DATABASE_URL`) e as mesmas variáveis (`COLETA_ATIVA`,
`CONTAR_CANDIDATO`, `TURNSTILE_*`). As tabelas são criadas na subida; leitura interna
com `psql "$DATABASE_URL" -c 'SELECT * FROM posicao_voto'`.
