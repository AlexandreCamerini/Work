-- Só contadores agregados: nenhuma linha por voto, nenhum horário, IP ou identificador.
-- Não dá para saber quem votou em quem nem em que ordem os votos chegaram.
CREATE TABLE IF NOT EXISTS placar (
  eleicao TEXT NOT NULL,
  candidato TEXT NOT NULL,
  votos INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (eleicao, candidato)
);
