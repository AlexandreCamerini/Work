# ADR 0002 — F9: helper root sob demanda, XPC com requisito de assinatura e verbos tipados

Status: aceita · 12 nov 2026 · marco M1 · revisão de segurança do contrato: ver PR #4

## Contexto
Parte da coleta (itens em segundo plano via `sfltool dumpbtm`, perfis, `sudoers`, conexões de todos os processos) e todas as correções exigem root (M0). Um helper root é o maior risco do produto: um verbo genérico vira escalada de privilégio.

## Decisão
- Daemon registrado com `SMAppService.daemon`, sob demanda, sem `KeepAlive`, sem rede (RNF-05, 7.1 item 5).
- Conexão XPC com requisito de assinatura nos dois sentidos (identificador, Team ID, versão mínima). Nunca validar por PID.
- Contrato em `app-nativo/MDHelperProtocol`, em tipos Swift `Codable & Sendable`:
  - `MDHelperService`: um método `async throws(HelperError)` por verbo da SPEC 7.2.
  - `HelperRequest` / `HelperResponse`: enum fechado, um caso por verbo; é o que trafega. `HelperWire` fixa a codificação (JSON, chaves ordenadas, datas em milissegundos) e um teto de 16 KiB por requisição; qualquer coisa fora do enum vira `HelperError.malformedRequest`.
  - Alvos de ação são `ItemRef` (id opaco do item + id do snapshot em que o helper o coletou). O helper recusa snapshot velho (`staleSnapshot`) e alvo mudado (`targetChangedSinceSnapshot`).
  - `ProtocolVersion` com regra `canServe`: mesma `major`, `minor` do helper >= a do app; divergência vira `incompatibleProtocol(helper:app:)` (7.1 item 7).
- Transporte: a ligar no M5. Direção escolhida: API Swift de XPC (`XPCSession` / `XPCListener`) com as mensagens `Codable` deste pacote e requisito de par; `NSXPCConnection` + `setCodeSigningRequirement` como alternativa se a API Swift não cobrir o requisito nas três versões. O contrato não depende da escolha: não há `@objc` nem `NSSecureCoding`.

## Divergências registradas em relação à tabela 7.2 da SPEC (SPEC atualizada no mesmo PR)
1. `terminateProcess` recebe `ProcessIdentity` (PID, executável, início em microssegundos), não um id opaco. Motivo: processos são coletados pelo app (seção 8, coleta "App"), não pelo helper, e 7.1 item 3 exige os três campos. O caminho é só critério de conferência com o processo vivo; o helper nunca abre, move nem executa a partir dele. É o único texto que entra no helper, e um teste de reflexão garante isso para todos os verbos.
2. `setGatekeeper` e `setFirewall` não têm parâmetro: só ligam. O catálogo 10.1 só prevê ligar; desligar é pelos Ajustes. Um verbo root capaz de desligar proteção seria ação fora do catálogo.

## Consequências
- Ganho: forma dos verbos auditável num arquivo; verbo novo quebra a compilação do teste de forma até ser auditado.
- Custo: cada verbo novo muda o enum, a versão do protocolo e o pacote aberto.
- Onde quebra: o teto de 16 KiB limita `scanPrivileged` só na ida; respostas grandes (snapshot) não têm teto no contrato — o transporte do M5 decide.
- Pendente para o M5: nome do serviço Mach e requisito de assinatura dependem do Team ID e do nome do produto (D4, D5); testes de abuso da seção 14.1.
