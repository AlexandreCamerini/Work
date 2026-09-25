import { describe, expect, it } from 'vitest'
import { eleicoes } from '../data/estatico'

const semAcento = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '')
const palavra = (termo: string, flags = '') => new RegExp(`(^|[^\\p{L}])${termo}([^\\p{L}]|$)`, `u${flags}`)

/** Tudo que aparece antes do voto (cena, pergunta, opções, fato, fonte e link) não pode entregar candidato. */
describe.each(eleicoes.map((e) => [e.id, e] as const))('cegamento: %s', (_id, eleicao) => {
  // nome e sobrenome como palavra inteira: no texto, com maiúscula ("Ruas", não "nas ruas");
  // no link, em minúscula e sem acento, como aparece em endereço de notícia
  const partes = eleicao.candidatos.flatMap((c) => c.nome.split(/\s+/)).filter((p) => p.length > 3 && p !== 'Coronel')

  it('nenhum nome de candidato em cena, pergunta, opção, fato, fonte ou link', () => {
    for (const p of eleicao.quiz.perguntas) {
      const textos = [p.cena, p.pergunta, ...p.opcoes.map((o) => o.texto), p.fato.texto, p.fato.fonte]
      for (const parte of partes) {
        for (const t of textos) expect(palavra(parte).test(t), `${p.id}: "${parte}" em "${t}"`).toBe(false)
        expect(palavra(semAcento(parte).toLowerCase(), 'i').test(p.fato.url), `${p.id}: "${parte}" no link ${p.fato.url}`).toBe(false)
      }
    }
  })
})
