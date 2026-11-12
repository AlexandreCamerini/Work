# ADR 0001 — F8: Swift nativo (SwiftUI + AppKit)

Status: aceita · 12 nov 2026 · marco M1

## Contexto
O protótipo serve a interface por um servidor web em `127.0.0.1`. Para um app que roda com helper root, um servidor local é superfície de ataque (outro processo do usuário fala com ele) e não entrega VoiceOver, teclado e desempenho de lista no nível do RNF-04 e RNF-07.

## Decisão
- App nativo em Swift 6, modo de linguagem 6 (concorrência estrita, RNF-09). macOS 15 mínimo (F5).
- SwiftUI para estrutura e navegação; AppKit (`NSTableView`) para listas grandes (RNF-04).
- Lógica em pacotes Swift locais testáveis com `swift test` (SPEC 6.2). O alvo do app fica fino.
- Primeiros pacotes, no M1: `MDModel` (tipos de achado, evidência, severidade, snapshot) e `MDHelperProtocol` (contrato XPC). Ambos sem I/O e sem AppKit.
- Valores crus dos tipos (regra, severidade, categoria, parecer da IA) são os mesmos do protótipo, para os testes dourados do M3 compararem sem tabela de tradução.

## Consequências
- Ganho: sem soquete local; acessibilidade nativa; tipos `Sendable` checados pelo compilador.
- Custo: compilar exige Mac com Xcode; sessão Linux só trabalha em documento e protótipo.
- Onde quebra: SwiftUI puro em listas de 5 mil linhas; por isso o `NSTableView`. Mistura SwiftUI/AppKit exige cuidado com `@MainActor`.
- Nota de ambiente: no sandbox do Claude Code o `swift build` falha ao gravar o manifesto do serviço de build (`Operation not permitted`); o build roda fora do sandbox.
