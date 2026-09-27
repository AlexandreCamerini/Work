# Verificação adversarial da curadoria (27/09/2026)

Revisor independente de `textos-letramento.json` (46 trocas) e de `variantes-novas.json` (9), `ajustes-publico.json` (3) e `cenas-padrao.json` (3). Considera a mudança de perfil já aplicada em `src/` (`aplicativo` e `a_pe` como valores próprios; `perfil.ts` já pontua os dois com 0). O veredito item a item, com os textos corrigidos, está em `veredito.json`.

## Contagem

| Pacote | aprovar | ajustar | rejeitar |
|---|---|---|---|
| Letramento (46) | 40 | 6 | 0 |
| Variantes novas (9) | 1 | 8 | 0 |
| Ajustes de público (3) | 1 | 2 | 0 |
| Cenas padrão (3) | 3 | 0 | 0 |
| Remoção de encosta-serra | aprovada com condições | | |
| Propagações obrigatórias | 9 | | |

## Problemas graves (corrigir antes de mesclar)

1. **Nove opções das variantes novas copiam o texto antigo** de opções que o letramento trocou. Se as variantes entrarem como estão, a mesma preferência aparece com dois textos, e o texto antigo é justamente o que o letramento julgou ruim. Lista completa em `propagar`: conta-propria/c, jornada-familia/c, fila-aposentado (presidente)/b, neto-escola/b e /d, chuva-interior/d, passagem-moto/c, passagem-interior/c e passagem-leste/c. fila-aposentado (governador) não precisa: fila-especialista não teve troca.
2. **`passagem-moto` não cobre `a_pe`.** A cena fala de "moto, bicicleta ou caminhada", mas com o perfil novo `moto` é só moto. Público corrigido: `{deslocamento: ["moto", "a_pe"]}`. A cena também afirmava uma causa ("trocou o ônibus… a passagem pesava demais") que a fonte do próprio contexto contradiz. Pela Coppe/UFRJ (conferida), na Grande Rio o tempo decidiu a troca e só 14% citam o custo. Cena nova: "Você anda de moto, de bicicleta ou a pé. Quando precisa de ônibus, a passagem pesa." A pergunta volta a ser a da origem.
3. **`passagem-leste`: erro factual no contexto.** O texto diz "A barca Arariboia–Praça XV custa R$ 4,70", mas desde 8/02/2026 ela custa **R$ 5,00** (g1, 10/02/2026, e o site da Barcas Rio). Nenhuma fonte listada sustenta os R$ 4,70. Parágrafo e fonte corrigidos no veredito.
4. **`chuva-interior`: erro no contexto.** O texto diz "Os rios são do estado, pelo Inea", mas o próprio 1º parágrafo cita o Pomba e o Muriaé, que vêm de Minas e são da União (CF art. 20, III). O Paraíba do Sul também é da União. A frase veio de encosta-serra.
5. **`neto-escola`: conflito de público.** Com só `trabalho: aposentado`, quem marcou "escola particular" vê "seu neto está no ensino médio **público**". A lacuna real é do aposentado que marcou "não tem criança na escola" (hoje ele cai em pagar-faculdade). Público corrigido: `{trabalho: ["aposentado"], escola: ["nenhuma"]}`. A cena passa a dizer "Seu neto, ou um jovem da família", porque essa pessoa não tem neto na escola.
6. **As duas `fila-aposentado` dizem "Você passou dos 60".** O perfil pergunta "Já me aposentei", não a idade. Quem se aposentou por tempo de contribuição, por invalidez ou em regime especial (muito PM e servidor no RJ) tem menos de 60. Corrigido para "Você já se aposentou…", com "plano na sua idade custa caro".
7. **Perguntas das variantes que trazem de volta o viés que o letramento tirou.** jornada-familia ("O que você defenderia pra jornada de trabalho?") repete o "pra sua jornada" que o letramento removeu de escala-6x1 por puxar a e b. conta-propria ("O que faria a carteira assinada valer a pena pra você?") pressupõe que o autônomo quer carteira e, somada à cena "a vaga… é 6x1", puxa a opção a. As duas passam a usar a pergunta nova da origem: "O que você mudaria nas regras do trabalho?".

## Letramento: os 6 ajustes

| Item | Problema | Texto corrigido |
|---|---|---|
| Gov transito-carro/pergunta | A troca inverte o viés: "o que faria o trânsito andar melhor?" para quem está parado na Linha Vermelha puxa a c (novas pistas) e afasta a d (tarifa zero) | "O que devia vir primeiro?" |
| Gov celular-roubado/c | "Investigar sem parar" é hipérbole (energia que as irmãs não têm); a preferência é "investigação permanente" | "Investigação permanente contra quem compra celular roubado." |
| Gov primo-desempregado/c | "Criar emprego fica com as empresas" tem infinitivo como sujeito, pior de ler que o original | "Deixar a criação de emprego com as empresas e investir em segurança." |
| Pres video-falso/a | "Barrar" = impedir de sair; a preferência é "conter". O sentido vai para o lado da censura, justo no item em que a b fala disso | "Criar regras pras redes sociais combaterem mentira e discurso de ódio." |
| Pres largar-escola/d | "Aula o dia inteiro" estreita "tempo integral" e soa como castigo para o jovem que quer largar a escola | "Escola o dia inteiro, em toda escola pública." |
| Gov barca-leste/d | Única opção do quiz de governador que diz "governo" em vez de "estado" (pode ser lido como o federal) | "Passar a barca pro estado e baixar a passagem." |

Pontos pedidos e aprovados:
- **"Casa popular"** (rua-alagada/garagem-alagada/encosta-serra, opção d) é o nome do dia a dia de "habitação de interesse social", que está na preferência. "Levar" não esconde a mudança e tira o "digna".
- **primo-desempregado/a** é fiel: a preferência tem aprendizagem técnica e incentivo à contratação.
- **"Sai sozinha"** (clima/c) é o jeito falado de "concessão automática". "Se o governo atrasar" = perder o prazo, que é a condição da preferência. As opções somadas estão em 257, e trocas mais longas estouram 260.
- Das 4 perguntas reenquadradas, 3 ficaram neutras (falta-tecnico, celular-roubado do governador, escala-6x1); só transito-carro pede ajuste.

Folgas apertadas, para quem mexer depois: saude-interior (259/260), celular-roubado e celular-sinal do presidente (259), operacao-policial com cena+pergunta em 168/170. Dois problemas antigos, fora destas trocas: o contexto de barca-leste diz que o estado já comanda as barcas desde fev/2025, o que deixa confusa a preferência "estatizar"; e falta "aprendizagem" em falta-tecnico/c.

## Variantes novas

- **Preferências:** as 36 opções são idênticas às da origem (conferido por script). O texto também é idêntico, com uma exceção: chuva-interior/b ("canais e valões"). Aprovei essa, porque é a mesma preferência e a fonte do fato cita valões transbordando em Itaperuna e em São Fidélis.
- **Fontes abertas** (pelo menos 1 por variante):
  - IBGE PNAD 2º tri/2026: 25,3%; 33,8% no Maranhão;
  - Censo 2022: 32.113.490 pessoas, +56%; RS 20,2%, RJ 18,8%;
  - Anuário 2026: 74,3% concluíram;
  - g1 Itaperuna: 2.600 afetados e 315 desalojados;
  - Technibus/CNT: 69,6%; Coppe/UFRJ: 14% citam custo;
  - A Voz da Serra: 11,69% de reajuste; Friburgo–Cordeiro R$ 20; Macuco R$ 30;
  - Tempo Real: R$ 7,10;
  - g1 6x1: 14,8 milhões;
  - g1 hérnia: 78 → 164 dias.

  Todas batem, fora a barca (item 3 acima).
- **Nomes:** nenhum nome de candidato, vice, partido ou "Garotinho" como palavra inteira em textos, títulos ou URLs. As únicas ocorrências são palavras comuns dos nomes de coligação ("pra", "mais", "rio", "real").
- **Cena da chuva:** "a barreira caiu na estrada" troca o risco que mata na Serra (deslizamento sobre casas) por um bloqueio de estrada que nenhuma opção resolve. Nova cena: "…a água entrou nas casas e caiu barreira no morro."
- **Metrô (opção d) em passagem-interior e passagem-leste:** fica fora do mundo do eleitor, e na prática ele escolhe entre 3 opções. Aceito como limite. Outro efeito: no interior, o subsídio ao ônibus intermunicipal pesa em dobro (estrada-interior/d + passagem-*/a). Isso já acontecia antes.
- **jornada-familia:** a opção b protegida diz "a minha jornada" para um aposentado. Mantive o texto (é protegido). É a variante de menor ganho; se for preciso cortar alguma, comece por ela.
- **Ordem em `selecionarCenas`:** não há conflito novo.
  - Aposentado do interior: saude-interior vem antes de fila-aposentado, e ele vê a tia na van, o que é plausível.
  - Aposentado com plano: vê fila-aposentado antes de plano-voltou-sus. Correto.
  - Aposentado que dirige: as variantes novas de aposentado estão em grupos sem variante por deslocamento, então não há disputa.
  - Moto do interior ou do Leste: vê passagem-moto antes da regional. Plausível.

## Ajustes de público

- **trabalho-app:** substituir por `{trabalho: ["aplicativo"]}`. A versão de B (autônomo + moto/carro/app) fica obsoleta e tinha resíduo.
- **vale-transporte:** a cena diz "vem de Nova Iguaçu", o que é implausível para um empregador de Niterói. Deixar `regiao: ["capital"]` (Leste vai para passagem-leste). Mantêm-se `carro`/`casa` e a faixa mista/privada.
- **via-expressa-fechada:** aprovado.

## Remoção de encosta-serra

A remoção se justifica: chuva-interior, com a cena corrigida, cobre a Serra e a planície. Três perdas precisam ser repostas:

1. O deslizamento sobre casas: já volta na cena corrigida.
2. A dica "Viu rachadura nova? Chame a Defesa Civil": volta no 4º parágrafo do contexto.
3. A ilustração `EncostaSerra`: mapear `'chuva-interior': EncostaSerra` em `src/cenas/ilustracoes/index.ts`. Sem isso, a cena cai em `RuaAlagada`, que é uma rua urbana.

Quem aplicar também precisa limpar:
- `quiz.json`, `contexto.json` e `aderencia.json`;
- `src/lib/perfil.test.ts:89`, que espera `encosta-serra` para o interior;
- `pipeline/ux/golden-baseline.json`.

## Limites de texto (F)

`checar_legibilidade.py --propostas textos-letramento.json`: 0 violações.

Simulei o estado final completo por script: letramento com os 6 ajustes, cenas padrão e as 9 variantes com as propagações e as correções deste veredito. Resultado: 0 violações. Casos no limite:
- neto-escola: frase de cena com 20 palavras;
- chuva-interior: 19 palavras;
- fila-aposentado do governador: 145 caracteres de cena + pergunta.

Os parágrafos de contexto corrigidos têm no máximo 53 palavras, e o contexto soma no máximo 156.

## Opções protegidas (H)

escala-6x1/b, operacao-policial/b, via-expressa-fechada/b e trabalho-app/b estão intactas nas 46 trocas. jornada-familia e conta-propria reusam escala-6x1/b literal, o que está certo pela regra de proteção, com a ressalva de sentido para o aposentado (acima).
