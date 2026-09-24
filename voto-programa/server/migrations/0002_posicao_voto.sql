-- Métrica interna do produto: em que posição do ranking de afinidade estava o candidato
-- votado (1 = o que mais combinou). Não diz quem é o candidato, então não permite inferir
-- a ordem da disputa. Também só contadores: nada por pessoa, sem horário.
CREATE TABLE IF NOT EXISTS posicao_voto (
  eleicao TEXT NOT NULL,
  posicao INTEGER NOT NULL,
  votos INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (eleicao, posicao)
);
