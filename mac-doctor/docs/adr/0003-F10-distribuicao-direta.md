# ADR 0003 — F10: distribuição direta com Developer ID, notarização e Sparkle 2

Status: aceita · 12 nov 2026 · marco M1

## Contexto
O produto precisa de um daemon root (F9) e lê áreas do sistema que o sandbox da Mac App Store não permite. A cobrança é por licença própria (seção 11), não por compra na loja.

## Decisão
- Fora da Mac App Store. Assinatura com Developer ID, hardened runtime, carimbo de tempo seguro, sem `get-task-allow`.
- Ordem: assinar helper, assinar app, notarizar, grampear, montar DMG.
- Atualização com Sparkle 2 na versão 2.9.6 ou superior, feed assinado obrigatório e pacotes EdDSA; o usuário pode desligar (RF-23). Após atualizar, o app confere a versão do helper pelo `handshake` (`HandshakeInfo.helperVersion`) e re-registra só se divergir (RF-24).
- Segredos de assinatura e a chave EdDSA do Sparkle nunca entram no repositório.

## Consequências
- Ganho: controle de release e de preço; helper possível.
- Custo: sem vitrine da loja; confiança tem de vir de notarização, helper aberto (F6) e auditoria (M9).
- Onde quebra: revogação do Developer ID para o app para todos (risco da seção 17). Conta individual expõe o nome pessoal no certificado (D4, fecha no início do M8).
