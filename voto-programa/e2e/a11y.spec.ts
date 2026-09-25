/**
 * Acessibilidade (B-interacao.md §7 e §9: A14, A15, B1) e critério 6 do plano de QA:
 * axe-core em cada etapa do fluxo, 0 violações serious/critical.
 */
import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { ELEICOES, abrir, comecar, esperarEtapa, estadoTela, expect, irParaCenas, opcoes, responderCenas, test } from './apoio'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

async function auditar(page: Page, tela: string, graves: string[]) {
  const r = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  for (const v of r.violations) {
    if (v.impact === 'serious' || v.impact === 'critical') {
      graves.push(`${tela}: ${v.id} (${v.impact}) em ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
    }
  }
}

/** A14: botões, links e cartões de opção visíveis com caixa ≥ 44×44 (links em texto corrido não contam: WCAG 2.5.8, exceção "inline"). */
async function alvosPequenos(page: Page) {
  return page.evaluate(() => {
    const pequenos: string[] = []
    for (const el of document.querySelectorAll<HTMLElement>('button, a[href], label.opcao, [role="switch"]')) {
      const r = el.getBoundingClientRect()
      if (!r.width || !r.height) continue
      const cs = getComputedStyle(el)
      if (cs.visibility === 'hidden' || el.closest('[aria-hidden="true"], .sr-only')) continue
      if (el.closest('dialog') && !el.closest('dialog[open]')) continue
      if (el.tagName === 'A' && cs.display === 'inline' && el.parentElement && el.parentElement.textContent!.trim() !== el.textContent!.trim()) continue
      if (r.width < 44 - 0.5 || r.height < 44 - 0.5) pequenos.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 40)}" ${Math.round(r.width)}×${Math.round(r.height)}`)
    }
    return pequenos
  })
}

for (const eleicao of ELEICOES) {
  test(`6. ${eleicao} · axe sem violação serious/critical em cada etapa (e alvos ≥ 44 px)`, async ({ page }) => {
    const graves: string[] = []
    const pequenos: string[] = []
    const passo = async (tela: string) => {
      await auditar(page, tela, graves)
      for (const p of await alvosPequenos(page)) pequenos.push(`${tela}: ${p}`)
    }

    await page.goto('/')
    await passo('home')
    await abrir(page, eleicao)
    await passo('abertura')
    await comecar(page)
    await passo('perfil')
    // B1: cada tela do perfil sem rolagem
    for (let i = 0; i < 8 && (await estadoTela(page)).etapa === 'perfil'; i++) {
      const rola = await page.evaluate(() => document.documentElement.scrollHeight > innerHeight)
      expect(rola, `perfil ${i + 1} rola`).toBe(false)
      if (i === 1) await passo('perfil-2')
      const antes = await estadoTela(page)
      await page.getByRole('group').getByRole('button').first().click()
      await expect.poll(() => estadoTela(page)).not.toEqual(antes)
    }
    await esperarEtapa(page, 'prioridades')
    await passo('prioridades')
    const temas = page.getByRole('group').getByRole('button')
    for (let i = 0; i < 4; i++) await temas.nth(i).click()
    await passo('prioridades-erro')
    await page.getByRole('button', { name: 'Continuar', exact: true }).click()
    await esperarEtapa(page, 'cena')
    await passo('cena')
    await opcoes(page).first().check()
    await passo('cena-escolhida')
    await page.getByTestId('fato-chip').click()
    await passo('fato-aberto')
    await page.keyboard.press('Escape')
    await responderCenas(page)
    await esperarEtapa(page, 'resumo')
    await passo('resumo-1')
    await page.getByRole('button', { name: 'Continuar', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Ver resultado às cegas' })).toBeVisible()
    await passo('resumo-2')
    await page.getByRole('button', { name: 'Ver resultado às cegas' }).click()
    await esperarEtapa(page, 'resultado')
    await passo('resultado')
    await page.locator('[data-testid^="linha-"]').first().click()
    await passo('detalhe-as-cegas')
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Como calculamos' }).click()
    await passo('como-calculamos')
    await page.keyboard.press('Escape')
    await page.getByTestId('resultado-votar').click()
    await esperarEtapa(page, 'voto')
    await passo('voto')
    await page.getByTestId('voto-confirmar').click()
    await expect(page.getByRole('alert')).toBeVisible()
    await passo('voto-erro')
    await page.getByRole('radio').first().check()
    await passo('voto-escolhido')
    await page.getByTestId('voto-confirmar').click()
    await esperarEtapa(page, 'revelacao')
    await expect(page.locator('.carta.destaque.virada')).toBeVisible()
    await passo('revelacao-voto')
    await page.getByRole('button', { name: 'Revelar os outros' }).click()
    await expect(page.getByRole('button', { name: 'Montar meu cartão' })).toBeVisible()
    await passo('revelacao-todos')
    await page.locator('[data-testid^="carta-"]').first().click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await passo('detalhe-revelado')
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Montar meu cartão' }).click()
    await esperarEtapa(page, 'cartao')
    await expect(page.getByTestId('cartao-previa')).toBeVisible()
    await passo('cartao')
    await page.getByRole('switch').click()
    await passo('cartao-com-nomes')

    expect(graves, graves.join('\n')).toEqual([])
    expect(pequenos, `A14, alvos < 44 px:\n${pequenos.join('\n')}`).toEqual([])
  })

  test(`A15. ${eleicao} · movimento reduzido: nenhuma animação acima de 1 ms na cena`, async ({ page }) => {
    await irParaCenas(page, eleicao)
    await opcoes(page).nth(1).check()
    await page.getByTestId('fato-chip').click()
    await page.keyboard.press('Escape')
    await page.getByTestId('cena-avancar').click()
    const longas = await page.evaluate(() =>
      document
        .getAnimations()
        .map((a) => {
          const t = a.effect?.getTiming()
          return { nome: (a as CSSAnimation).animationName ?? a.constructor.name, dur: Number(t?.duration ?? 0) }
        })
        .filter((a) => a.dur > 1),
    )
    expect(longas).toEqual([])
  })
}

