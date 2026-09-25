/**
 * Cena (B-interacao.md §4.4 e §9, A1–A13): layout estável, seleção, voltar, recarregar e fato.
 * Critérios 1, 2 e 3 do plano de QA (pipeline/ux/E-qa.md).
 */
import type { Page } from '@playwright/test'
import {
  ELEICOES,
  PERFIS,
  avancarBtn,
  avancarCena,
  cartoesOpcao,
  cenasEsperadas,
  esperarEtapa,
  estadoTela,
  expect,
  irParaCenas,
  opcoes,
  ordemOpcoes,
  test,
} from './apoio'

interface Medida {
  x: number
  y: number
  w: number
  h: number
  sh: number
  sw: number
  ih: number
  iw: number
  scrollY: number
  /** px que o conteúdo do MEIO passa da altura dele (A2; > 0 = rola por dentro). */
  sobraMeio: number
}

const medir = (page: Page) =>
  page.evaluate((): Medida => {
    const b = document.querySelector('[data-testid="cena-avancar"]')!.getBoundingClientRect()
    const m = document.getElementById('meio')!
    return {
      x: b.x,
      y: b.y,
      w: b.width,
      h: b.height,
      sh: document.documentElement.scrollHeight,
      sw: document.documentElement.scrollWidth,
      ih: innerHeight,
      iw: innerWidth,
      scrollY,
      sobraMeio: m.scrollHeight - m.clientHeight,
    }
  })

/** Botão inteiro na viewport e é ele quem recebe o toque no centro (nada o cobre). */
async function inteiroENaFrente(page: Page, m: Medida, rotulo: string) {
  expect(m.y, `${rotulo}: topo do botão`).toBeGreaterThanOrEqual(0)
  expect(m.x, `${rotulo}: esquerda do botão`).toBeGreaterThanOrEqual(0)
  expect(m.y + m.h, `${rotulo}: base do botão`).toBeLessThanOrEqual(m.ih)
  expect(m.x + m.w, `${rotulo}: direita do botão`).toBeLessThanOrEqual(m.iw)
  const naFrente = await avancarBtn(page).evaluate((el) => {
    const r = el.getBoundingClientRect()
    const alvo = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)
    return !!alvo && (alvo === el || el.contains(alvo))
  })
  expect(naFrente, `${rotulo}: botão coberto por outro elemento`).toBe(true)
}

for (const eleicao of ELEICOES) {
  test.describe(`${eleicao} · cena`, () => {
    // ---------------------------------------------------------------- critério 1 (A1–A4, A7, A13)
    for (const { nome, perfil } of PERFIS[eleicao]) {
      test(`1. layout estável em todas as cenas · perfil ${nome}`, async ({ page }) => {
        await irParaCenas(page, eleicao, perfil)
        const esperadas = cenasEsperadas(eleicao, perfil)
        const n = esperadas.length
        const vistas: string[] = []

        for (let i = 0; i < 40; i++) {
          const { etapa, cena } = await estadoTela(page)
          if (etapa !== 'cena' || !cena) break
          vistas.push(cena)
          const rot = `cena ${i + 1}/${n} (${cena})`

          // A13: marcos na ida, uma vez só (no perfil vazio, confere que voltar e avançar não repete)
          const marco = i === n - 1 && n > 1 ? 'Última' : i === Math.ceil(n / 2) - 1 && i > 0 ? 'Metade' : null
          if (marco) {
            const aviso = page.getByRole('status').filter({ hasText: marco })
            await expect(aviso).toBeVisible()
            if (nome === 'vazio') {
              await expect(aviso).toBeHidden({ timeout: 5_000 })
              await page.getByTestId('cena-voltar').click()
              await expect.poll(async () => (await estadoTela(page)).cena).not.toBe(cena)
              await avancarCena(page)
              expect((await estadoTela(page)).cena).toBe(cena)
              await page.waitForTimeout(300)
              await expect(aviso).toBeHidden()
            }
          }

          // A1: antes de escolher, a página não rola
          const antes = await medir(page)
          expect(antes.sh, `${rot}: página rola antes de escolher`).toBeLessThanOrEqual(antes.ih)
          // A2: o MEIO também não rola por dentro (texto cabe); se falhar, a mensagem diz quantos px faltam
          expect(antes.sobraMeio, `${rot}: o meio rola por dentro (faltam ${antes.sobraMeio}px)`).toBeLessThanOrEqual(0)

          // escolhe (varia a opção de cena para cena)
          const k = i % (await opcoes(page).count())
          await opcoes(page).nth(k).check()
          await expect(opcoes(page).nth(k)).toBeChecked()
          await expect(avancarBtn(page)).toHaveText(i === n - 1 ? 'Ver meu resultado' : 'Próxima')

          // A3/A4: depois de escolher, botão inteiro na viewport, nada cresce, nada se move
          const depois = await medir(page)
          await inteiroENaFrente(page, depois, rot)
          expect(depois.sh, `${rot}: scrollHeight mudou ao escolher`).toBe(antes.sh)
          expect(depois.sh, `${rot}: página rola depois de escolher`).toBeLessThanOrEqual(depois.ih)
          expect(depois.sw, `${rot}: rolagem horizontal`).toBeLessThanOrEqual(depois.iw)
          expect(depois.scrollY, `${rot}: página rolou`).toBe(0)
          expect({ y: depois.y, h: depois.h }, `${rot}: botão mudou de lugar ao escolher`).toEqual({ y: antes.y, h: antes.h })

          // A7: abrir e fechar o fato não mexe no botão
          await page.getByTestId('fato-chip').click()
          await expect(page.getByRole('dialog')).toBeVisible()
          const aberto = await medir(page)
          expect({ y: aberto.y, h: aberto.h }, `${rot}: botão mudou ao abrir o fato`).toEqual({ y: antes.y, h: antes.h })
          expect(aberto.sh, `${rot}: página rola com o fato aberto`).toBeLessThanOrEqual(aberto.ih)
          await page.getByRole('dialog').getByRole('button', { name: 'Fechar' }).click()
          await expect(page.getByRole('dialog')).toBeHidden()
          const fechado = await medir(page)
          expect({ y: fechado.y, h: fechado.h, sh: fechado.sh }, `${rot}: layout mudou ao fechar o fato`).toEqual({ y: antes.y, h: antes.h, sh: antes.sh })

          await avancarCena(page)
        }

        // todas as cenas do perfil apareceram, e só elas
        expect([...vistas].sort()).toEqual([...esperadas].sort())
        await esperarEtapa(page, 'resumo')
      })
    }

    // ---------------------------------------------------------------- critério 2 (A5, A6, A9–A12)
    test('2. trocar, desmarcar, voltar (botão e sistema) e recarregar preservam resposta e ordem', async ({ page }) => {
      await irParaCenas(page, eleicao)
      const n = Number(await page.getByTestId('progresso').getAttribute('aria-valuemax'))
      const [a, b, c] = [opcoes(page).nth(0), opcoes(page).nth(1), opcoes(page).nth(2)]

      // A5: trocar muda a seleção e não trava as outras
      await a.check()
      await expect(a).toBeChecked()
      await c.check()
      await expect(c).toBeChecked()
      await expect(a).not.toBeChecked()
      await expect(a).toBeEnabled()
      await expect(page.locator('main[data-etapa="cena"] input:checked')).toHaveCount(1)
      await expect(page.getByTestId('fato-chip')).toContainText('Trocado')
      // teclado: seta move a seleção dentro do grupo (rádio nativo)
      await c.focus()
      await page.keyboard.press('ArrowUp')
      await expect(b).toBeChecked()
      await expect(page.locator('main[data-etapa="cena"] input:checked')).toHaveCount(1)

      // A6: tocar de novo na escolhida desmarca
      await cartoesOpcao(page).nth(1).click()
      await expect(page.locator('main[data-etapa="cena"] input:checked')).toHaveCount(0)
      await expect(avancarBtn(page)).toHaveText(/^Nenhuma dessas/)
      await expect(page.getByTestId('fato-chip')).toHaveCount(0)

      // resposta final da cena 1: opção 2 (índice 1)
      await b.check()
      const cena1 = await estadoTela(page)
      const ordem1 = await ordemOpcoes(page)
      const escolhida1 = await b.getAttribute('value')

      // A12: ao trocar de cena, o foco vai para a pergunta e o aria-live diz a situação
      await avancarCena(page)
      await expect(page.locator('#q-cena')).toBeFocused()
      await expect(page.locator('[aria-live="polite"]').filter({ hasText: `Situação 2 de ${n}` })).toHaveCount(1)
      const cena2 = await estadoTela(page)
      await opcoes(page).nth(2).check()
      const ordem2 = await ordemOpcoes(page)
      const escolhida2 = await opcoes(page).nth(2).getAttribute('value')

      // A9: botão Voltar preserva resposta, ordem e progresso
      await page.getByTestId('cena-voltar').click()
      await expect.poll(async () => (await estadoTela(page)).cena).toBe(cena1.cena)
      await expect(page.locator(`input[value="${escolhida1}"]`)).toBeChecked()
      expect(await ordemOpcoes(page)).toEqual(ordem1)
      await expect(page.getByTestId('progresso')).toHaveAttribute('aria-valuenow', '1')
      await expect(page.locator('#q-cena')).toBeFocused()

      // de volta à cena 2: a resposta dela também ficou
      await avancarCena(page)
      expect((await estadoTela(page)).cena).toBe(cena2.cena)
      await expect(page.locator(`input[value="${escolhida2}"]`)).toBeChecked()
      await avancarCena(page)
      const cena3 = await estadoTela(page)
      expect(cena3.passo).toBe('3')

      // A10: Voltar do sistema leva à cena anterior (não à home), com tudo preservado
      await page.goBack()
      await expect.poll(async () => (await estadoTela(page)).cena).toBe(cena2.cena)
      await expect(page.locator(`input[value="${escolhida2}"]`)).toBeChecked()
      expect(await ordemOpcoes(page)).toEqual(ordem2)
      await page.goBack()
      await expect.poll(async () => (await estadoTela(page)).cena).toBe(cena1.cena)
      await expect(page.locator(`input[value="${escolhida1}"]`)).toBeChecked()
      expect(await ordemOpcoes(page)).toEqual(ordem1)
      expect(page.url()).toContain(`#${eleicao}`)
      // segue de novo para a cena 2 (o Avançar do navegador não refaz a ida: ver E-qa.md, riscos)
      await avancarCena(page)
      expect((await estadoTela(page)).cena).toBe(cena2.cena)

      // A11: recarregar volta na mesma cena, com a resposta e a ordem
      await page.reload()
      await expect.poll(async () => (await estadoTela(page)).cena).toBe(cena2.cena)
      await expect(page.locator(`input[value="${escolhida2}"]`)).toBeChecked()
      expect(await ordemOpcoes(page)).toEqual(ordem2)
      await expect(page.getByTestId('progresso')).toHaveAttribute('aria-valuenow', '2')
      // depois de recarregar, o Voltar da tela ainda funciona e a cena 1 está intacta
      await page.getByTestId('cena-voltar').click()
      await expect.poll(async () => (await estadoTela(page)).cena).toBe(cena1.cena)
      await expect(page.locator(`input[value="${escolhida1}"]`)).toBeChecked()
      expect(await ordemOpcoes(page)).toEqual(ordem1)
    })

    // ---------------------------------------------------------------- critério 3 (A8)
    test('3. folha do fato: dialog modal, Tab preso, Esc fecha e o foco volta ao chip', async ({ page }) => {
      await irParaCenas(page, eleicao)
      await expect(page.getByTestId('fato-chip')).toHaveCount(0)
      await opcoes(page).first().check()
      const chip = page.getByTestId('fato-chip')
      await expect(chip).toBeVisible()
      await expect(chip).toHaveAttribute('aria-haspopup', 'dialog')

      await chip.click()
      const folha = page.getByRole('dialog', { name: 'Você sabia?' })
      await expect(folha).toBeVisible()
      await expect(folha).toHaveJSProperty('open', true)
      expect(await folha.evaluate((d) => d.matches(':modal'))).toBe(true)
      await expect(folha.getByRole('heading', { name: 'Você sabia?' })).toBeFocused()
      await expect(folha.getByRole('link', { name: /^Fonte:/ })).toBeVisible()

      // Tab e Shift+Tab não saem da folha
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Tab')
        expect(await folha.evaluate((d) => d.contains(document.activeElement)), `Tab ${i + 1} saiu da folha`).toBe(true)
      }
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Shift+Tab')
        expect(await folha.evaluate((d) => d.contains(document.activeElement)), `Shift+Tab ${i + 1} saiu da folha`).toBe(true)
      }

      await page.keyboard.press('Escape')
      await expect(folha).toBeHidden()
      await expect(chip).toBeFocused()

      // o botão "Fechar" também devolve o foco ao chip; toque no véu fecha
      await chip.click()
      await expect(folha).toBeVisible()
      await folha.getByRole('button', { name: 'Fechar' }).click()
      await expect(folha).toBeHidden()
      await expect(chip).toBeFocused()
      await chip.click()
      await expect(folha).toBeVisible()
      await page.mouse.click(5, 5)
      await expect(folha).toBeHidden()
      // e a resposta continua marcada
      await expect(opcoes(page).first()).toBeChecked()
    })
  })
}
