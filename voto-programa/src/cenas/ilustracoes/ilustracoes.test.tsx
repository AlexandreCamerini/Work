import { describe, expect, it } from 'vitest'
import { createElement, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import quizPR from '../../data/quiz-presidente.json'
import quizRJ from '../../data/quiz.json'
import { Generica, ilustracaoDe, porGrupo, porId, porTema } from './index'

const perguntas = [...quizRJ.perguntas, ...quizPR.perguntas]
const todas = new Set<ComponentType>([...Object.values(porId), ...Object.values(porGrupo), ...Object.values(porTema), Generica])
const desenhar = (C: ComponentType) => renderToStaticMarkup(createElement(C))

describe('ilustrações das cenas', () => {
  it('toda cena dos dois quizzes tem desenho próprio (por id ou por grupo), nunca o genérico', () => {
    for (const p of perguntas) {
      expect(porId[p.id] ?? porGrupo[p.grupo], `${p.id} (${p.grupo})`).toBeDefined()
      expect(ilustracaoDe(p)).not.toBe(Generica)
    }
  })

  it('todo tema dos quizzes tem genérica por tema', () => {
    for (const t of [...quizRJ.temas, ...quizPR.temas]) expect(porTema[t.id], t.id).toBeDefined()
  })

  it('cai no tema e depois na genérica', () => {
    expect(ilustracaoDe({ id: 'nova', grupo: 'novo', tema: 'energia' })).toBe(porTema.energia)
    expect(ilustracaoDe({ id: 'nova', grupo: 'novo' })).toBe(Generica)
  })

  it('cada SVG: 320×160, decorativo, sem texto nem imagem externa, até 6 KB', () => {
    for (const C of todas) {
      const svg = desenhar(C)
      const nome = C.name
      expect(svg, nome).toMatch(/^<svg class="ilu" viewBox="0 0 320 160" aria-hidden="true"/)
      expect(svg, nome).not.toMatch(/<(text|image|foreignObject|use)\b|href=|style=/)
      expect(new TextEncoder().encode(svg).length, nome).toBeLessThanOrEqual(6 * 1024)
    }
  })
})
