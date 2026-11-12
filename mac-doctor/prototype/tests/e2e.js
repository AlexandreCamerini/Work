const { chromium } = require('playwright');
const url = process.argv[2], out = process.argv[3];
const assert = (c, m) => { if (!c) { console.log('FALHOU:', m); process.exitCode = 1; } else console.log('ok  ', m); };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1000, height: 1300 } });
  const p = await ctx.newPage(); const erros = [];
  p.on('console', m => { if (m.type() === 'error') erros.push(m.text()); }); p.on('pageerror', e => erros.push(String(e)));
  await p.goto(url);
  await p.waitForSelector('text=Diagnóstico do seu Mac', { timeout: 15000 });
  const n = await p.locator('.card').count(); assert(n >= 12, 'painel com ' + n + ' achados');
  assert(await p.locator('.aviso-demo').count() === 1, 'faixa de demonstração visível');
  await p.screenshot({ path: out + '/g2-painel.png' });
  // cartão do script desativado
  const card = p.locator('.card', { hasText: 'Script em segundo plano (desativado): com.x.upd' });
  await card.locator('button.cab').click();
  assert(await card.locator('text=baixa código da internet e executa na hora').count() >= 1, 'indicadores do script visíveis');
  assert(await card.locator('button[data-acao]').count() >= 1, 'há botões de correção no cartão');
  await card.scrollIntoViewIfNeeded(); await p.screenshot({ path: out + '/g3-cartao.png' });
  // ação com confirmação
  await card.locator('button', { hasText: 'Mover para quarentena' }).click();
  await p.waitForSelector('dialog[open]');
  const dlg = await p.locator('dialog').innerText();
  assert(dlg.includes('launchctl bootout gui/501/com.x.upd') && dlg.includes('Dá para desfazer?'), 'confirmação mostra comandos exatos e reversibilidade');
  await p.screenshot({ path: out + '/g4-confirmar.png' });
  await p.keyboard.press('Escape'); assert(await p.locator('dialog[open]').count() === 0, 'Esc fecha o diálogo sem executar');
  assert(await card.locator('.feito-msg').count() === 0, 'nada executado após cancelar');
  await card.locator('button', { hasText: 'Mover para quarentena' }).click(); await p.locator('#b-exec').click();
  await card.locator('.feito-msg').waitFor({ timeout: 5000 });
  assert((await card.locator('.tags').innerText()).includes('Ação aplicada'), 'cartão marcado como "Ação aplicada"');
  // IA
  await p.locator('#b-ia').scrollIntoViewIfNeeded(); await p.locator('#b-ia').click();
  await p.waitForFunction(() => document.querySelector('dialog pre') && document.querySelector('dialog pre').textContent.includes('"achados"'));
  const previa = await p.locator('dialog pre').innerText();
  assert(!/maria/i.test(previa) && previa.includes('/Users/USUARIO') && !previa.includes('sk-ant-'), 'prévia do envio sem usuário nem chave');
  assert(!previa.includes('conteudo_script'), 'conteúdo de script fora do envio por padrão');
  await p.locator('#ia-scripts').check(); await p.waitForFunction(() => document.querySelector('dialog pre').textContent.includes('conteudo_script'));
  assert(!(await p.locator('dialog pre').innerText()).includes('sk-ant-'), 'com scripts incluídos, token continua oculto');
  await p.screenshot({ path: out + '/g5-ia.png' });
  await p.locator('#b-enviar').click();
  await p.waitForSelector('text=Análise por IA em andamento', { timeout: 4000 });
  await p.waitForSelector('text=Risco alto', { timeout: 10000 });
  assert(await p.locator('.tag', { hasText: 'IA: Suspeito' }).count() >= 1, 'veredito da IA aparece nos cartões');
  await p.evaluate(() => window.scrollTo(0, 0)); await p.screenshot({ path: out + '/g6-com-ia.png' });
  // histórico + desfazer
  await p.locator('#b-hist').click(); await p.waitForSelector('dialog .hist li');
  assert((await p.locator('dialog .hist').innerText()).includes('Mover para quarentena'), 'histórico registra a ação');
  await p.locator('dialog .hist button', { hasText: 'Desfazer' }).click(); await p.waitForSelector('dialog .hist .tag.ok');
  await p.screenshot({ path: out + '/g7-historico.png' }); await p.keyboard.press('Escape');
  // filtros
  await p.locator('.seg button', { hasText: 'Desempenho' }).click();
  assert(await p.locator('.card.critico, .card.atencao, .card.info, .card.resolvido').count() < n, 'filtro por tipo reduz a lista');
  // estreito + escuro
  const m = await ctx.newPage(); await m.setViewportSize({ width: 390, height: 800 }); await m.emulateMedia({ colorScheme: 'dark' }); await m.goto(url);
  await m.waitForSelector('text=Diagnóstico do seu Mac');
  assert(!(await m.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)), 'sem rolagem horizontal em 390 px');
  await m.screenshot({ path: out + '/g8-escuro-estreito.png' });
  // segurança do servidor
  const base = url.split('/?')[0], tok = url.split('t=')[1];
  const r1 = await ctx.request.get(base + '/api/estado'); assert(r1.status() === 403, 'API sem token -> 403');
  const r2 = await ctx.request.get(base + '/?t=errado'); assert(r2.status() === 403, 'página com token errado -> 403');
  const r3 = await ctx.request.get(base + '/api/estado', { headers: { 'X-MD-Token': tok, 'Host': 'evil.example' } }); assert(r3.status() === 403, 'Host forjado (DNS rebinding) -> 403');
  const r4 = await ctx.request.post(base + '/api/acao', { headers: { 'X-MD-Token': tok, 'Origin': 'http://evil.example', 'Content-Type': 'application/json' }, data: { id: 'A01.desativar' } }); assert(r4.status() === 403, 'Origin de outro site -> 403');
  const r5 = await ctx.request.post(base + '/api/acao', { headers: { 'X-MD-Token': tok, 'Content-Type': 'application/json' }, data: { id: '; rm -rf /' } });
  const t5 = await r5.text(); assert(r5.status() === 200 && JSON.parse(t5).ok === false, 'id de ação inventado é recusado [' + r5.status() + ' ' + t5.slice(0,80) + ']');
  const hd = (await ctx.request.get(url)).headers(); assert(/default-src 'none'/.test(hd['content-security-policy'] || ''), 'CSP restritiva na página');
  assert(erros.length === 0, 'sem erros de console/CSP (' + erros.join(' | ') + ')');
  // nova análise mostra a tela de progresso
  await p.locator('#b-scan').click(); await p.waitForSelector('text=Analisando seu Mac', { timeout: 3000 }); await p.screenshot({ path: out + '/g1-varredura.png' });
  await p.waitForSelector('text=Diagnóstico do seu Mac', { timeout: 15000 }); assert(await p.locator('.feito-msg').count() === 0, 'nova análise zera o estado das ações');
  // encerrar
  await p.locator('#b-sair').click(); await p.waitForSelector('text=O mac-doctor foi encerrado');
  await b.close();
})().catch(e => { console.log('EXCEÇÃO:', e.message); process.exit(1); });
