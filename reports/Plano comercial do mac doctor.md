# Reescrever, auditar e só então vender o mac-doctor

**Recomendação.** O protótipo Python serve como especificação das regras, não como base de produto: as notas sustentam uma reescrita nativa em Swift (SwiftUI para estrutura, AppKit para tabelas), com daemon root embutido via `SMAppService`, XPC travado por requisito de assinatura, distribuição direta com Developer ID, notarização e Sparkle 2, IA em nuvem atrás de um proxy fino com piso determinístico de severidade, licença própria assinada em Ed25519 e Paddle como merchant of record. O plano tem 14 etapas; **dev-apple-imagem** é o agente de maior peso (prova em Mac real, implementação e pipeline de release), **engineering:architecture** e **engineering:system-design** fixam as decisões antes do código, **claude-api** governa a camada de IA e **security-review** prepara a auditoria. Três blocos **não são cobertos por nenhum agente instalado**: compilar, assinar e notarizar (exige Mac com Xcode ou runner macOS), a auditoria externa do helper e todo o trabalho jurídico, contábil e de seguros. Cinco descobertas mudam o plano em relação ao que o protótipo pressupõe: a leitura direta do TCC foi descontinuada no macOS 27 e o Acesso Total ao Disco será restringido; o produto cai quase certamente em Classe I do Cyber Resilience Act, com dever de reporte já em vigor; o modelo on-device da Apple não comporta o pacote de achados; para vendedor no Brasil só a Paddle fecha a conta entre os MoR clássicos, e ela não emite chaves de licença; e o teto de gasto de US$ 500/mês da API pode parar o produto inteiro num pico de lançamento. O maior risco não é técnico: é lançar uma ferramenta root de um fundador desconhecido sem auditoria publicada, numa categoria com histórico de scareware, a menos de um mês da nova diretiva europeia de responsabilidade por produto.

## Cinco descobertas que mudam o plano

**1. A leitura do TCC por sqlite tem prazo de validade.** As notas de lançamento do macOS 27 dizem, em Deprecations: "Apps can no longer access the local TCC database directly" ([Apple, macOS 27 Release Notes](https://developer.apple.com/documentation/macos-release-notes/macos-27-release-notes)). Em 2 out 2026 a Apple anunciou "additional controls" para o Acesso Total ao Disco, sem versão, data ou API ([Apple Developer News](https://developer.apple.com/news/?id=p6zjojqw)). Há um relato de campo conflitante: no macOS 27.0 a leitura ainda funcionou a partir de um shell cujo terminal tinha FDA, e falhou com "authorization denied" quando feita por um job do launchd sem processo responsável com FDA, que é exatamente a forma do helper do protótipo ([Blake Crosley](https://blakecrosley.com/blog/macos-full-disk-access-ai-agents), fonte secundária, uma máquina). O `tccutil list` novo só responde em dispositivos gerenciados ([Blake Crosley](https://blakecrosley.com/blog/macos-27-golden-gate-release), secundária). Consequência: a auditoria de permissões vira recurso de melhor esforço, isolado atrás de verificação de capacidade por versão, com degradação para "abrir o painel de Privacidade".

**2. O produto é Classe I do CRA e o reporte já vale.** O Anexo III, Classe I, item 4 cobre "software that searches for, removes, or quarantines malicious software" ([Regulamento 2024/2847](https://eur-lex.europa.eu/legal-content/EL-EN/TXT/?from=EN&uri=CELEX%3A32024R2847)), e o regulamento de execução inclui varredura manual (citado por [Cybiq](https://cybiq.eu/cra-class-anti-malware.html), secundária). Desde 11 set 2026 qualquer fabricante com produto disponível na UE deve reportar vulnerabilidade ativamente explorada em 24 h, 72 h e 14 dias; as obrigações completas chegam em 11 dez 2027 ([Comissão Europeia](https://digital-strategy.ec.europa.eu/en/policies/cra-summary); [CRA reporting](https://digital-strategy.ec.europa.eu/en/policies/cra-reporting)). Classe I só admite autoavaliação com normas harmonizadas aplicadas na íntegra, ou se o produto for software livre com documentação técnica pública (Art. 32(5)). Em paralelo, a nova Diretiva de Responsabilidade por Produto trata software como produto e cobre "destruction or corruption of data that are not used for professional purposes" para produtos colocados no mercado a partir de 9 dez 2026 ([EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A02024L2853-20241118)).

**3. O modelo on-device da Apple não substitui a nuvem.** A janela é de 4.096 tokens por sessão, somando instruções, esquema e resposta ([Apple, mirror da doc](https://apple-docs.everest.mt/docs/foundationmodels/managing-the-context-window/)), e a própria Apple diz que o modelo "is not designed for world knowledge or advanced reasoning" ([WWDC25 286](https://developer.apple.com/videos/play/wwdc2025/286/)). Um pacote de 3 a 10 mil tokens de achados não cabe; a priorização entre achados, que é a saída de maior valor, fica de fora. Modelos abertos embutidos (MLX, llama.cpp) pedem 5 a 7 GB de memória unificada para classe 8B, o que contradiz um produto que diagnostica lentidão ([SpecPicks](https://specpicks.com/reviews/run-llama-3-1-8b-on-m4), benchmark de entusiasta).

**4. Pagamento a partir do Brasil reduz as opções a uma.** Stripe Managed Payments não lista o Brasil entre as localidades de vendedor e a Polar não paga no Brasil ([agentaos.ai citando docs Stripe](https://agentaos.ai/answers/lemon-squeezy-stripe-managed-payments-not-available); [Polar](https://polar.sh/docs/merchant-of-record/supported-countries)). A Lemon Squeezy paga o Brasil só via PayPal e declarou caminho de migração para o produto que exclui o país ([GetPaidAtlas](https://getpaidatlas.com/country/brazil); [Lemon Squeezy](https://www.lemonsqueezy.com/blog/2026-update)). Resta a Paddle (5% + US$ 0,50, Pix e Pix Automático em BRL), que não paga em BRL e cujo Paddle Billing não gera chaves de licença ([Paddle](https://www.paddle.com/help/manage/get-paid/can-i-be-paid-in-my-local-currency); [capawesome PR](https://github.com/capawesome-team/revenue-sdk/pull/5)). O licenciamento precisa ser próprio.

**5. A API tem um teto comercial duro e classificadores que recusam conteúdo de segurança.** O tier Start limita o gasto a US$ 500/mês; ao atingir, a API pausa até o dia 1 e responde 429 sem `retry-after`. Organizações novas podem começar no tier Evaluation, com limites não publicados ([Anthropic rate limits](https://platform.claude.com/docs/en/api/rate-limits)). Classificadores de segurança podem recusar com HTTP 200 e `stop_reason: "refusal"`, e trechos de script de persistência real são justamente o que eles observam (referência da Anthropic empacotada, não reverificada ao vivo). Os modelos Fable exigem retenção de 30 dias e ficam fora de ZDR ([Anthropic, data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention)).

## Decisões de arquitetura que as notas sustentam

| Decisão | Recomendação | Evidência nas notas | Ressalva |
|---|---|---|---|
| Linguagem e forma | Reescrita em Swift 6.x; app fino mais pacotes Swift locais (`Core`, `Scanner`, `HelperProtocol`, `Licensing`); protótipo Python vira oráculo de regras | Toda alternativa não nativa ainda exige Swift para XPC, `SMAppService` e Sparkle; pacotes locais validam com `swift build`/`swift test` sem Xcode ([iPucu Lab](https://ipucubilisim.com.tr/en/blog-tuist-spm-xcodeproj.html)) | Usar o Python como oráculo é inferência deste relatório |
| UI | SwiftUI para estrutura, formulários e detalhe; `NSTableView`/`NSOutlineView` via `NSViewRepresentable` para listas de processos, achados e itens | `List` do SwiftUI: 45 FPS e ~220 MB em 10 mil linhas, 22 FPS e ~800 MB em 100 mil; `NSTableView`: 60 FPS e 45 MB em 100 mil ([Rockxy](https://rockxy.io/blog/virtual-scrolling-swiftui), blog de projeto, M1) | Não há benchmark independente de `Table` no macOS 26/27 |
| Por que não web/Electron/Tauri | Descartar; a UI em 127.0.0.1 do protótipo sai | Nativo: 0,14 s de partida fria e ~78 MB contra Tauri 0,91 s e ~173 MB em 4 processos ([Nucleus](https://nucleusframework.dev/en/docs/compare/)); WebView exige exceções de JIT no hardened runtime ([electron/notarize](https://github.com/electron/notarize?tab=readme-ov-file)) | Fontes de benchmark são em parte fornecedores |
| Alvo mínimo | macOS 14, binário universal enquanto houver suporte a 26; piso técnico é 13 | `SMAppService` e `setCodeSigningRequirement` exigem 13+; 13 e anteriores somam ~8,2% na amostra menos atualizada ([JUCE forum](https://forum.juce.com/t/xcode-27-macosx-deployment-target-12/69752)); macOS 27 é só Apple silicon | Não existe participação por versão para a população geral nem para o Brasil |
| Liquid Glass | Controles padrão, vidro customizado mínimo em telas densas | Com SDK do Xcode 27 o opt-out é ignorado ([Lastres](https://lastres.ai/blog/liquid-glass-opt-out-ends-ios-27/)); Apple recomenda parcimônia e teste de performance ([Apple](https://developer.apple.com/documentation/technologyoverviews/adopting-liquid-glass.md)) | Custo de renderização em Macs antigos não foi quantificado |
| Helper privilegiado | Daemon root sob demanda (sem `KeepAlive`), embutido e registrado com `SMAppService.daemon`, serviço Mach, `NSXPCConnection.setCodeSigningRequirement` com identificador, Team ID e versão mínima; verbos tipados, nunca "executar comando" | [Apple, register()](https://developer.apple.com/documentation/servicemanagement/smappservice/register().md); classes de falha em XPC ([Alkemade, OBTS](https://objectivebythesea.org/v6/talks/OBTS_v6_tAlkemade.pdf); [Fitzl](https://theevilbit.github.io/posts/secure_coding_xpc_part2/)); CleanMyMac X aceitava chamadas de qualquer app como root ([Cisco Talos](https://blog.talosintelligence.com/vulnerability-spotlight-cleanmymac-x/)) | Conflito de fonte sobre onde o binário privilegiado deve morar (ver "O que não sabemos") |
| TCC | Recurso com verificação de capacidade por versão; camada útil sem FDA (launchd, processos); FDA só para BTM e TCC; no 27+, degradar para guiar o usuário ao painel; rótulo "redefinir", não "revogar" | `tccutil reset` é o único verbo suportado e não há API de leitura ([Quinn](https://developer.apple.com/forums/thread/678819)) | Comportamento real no 27 só se resolve em hardware |
| BTM | Parser tolerante do arquivo `.btm` com matriz por versão e fallback para `sfltool dumpbtm` no helper | Formato privado, sufixo de versão muda entre releases ([DumpBTM](https://github.com/objective-see/DumpBTM)) | Exige FDA |
| Endpoint Security | Fora da v1 | Scanner sob demanda não precisa; entitlement é concedido caso a caso, com um único caso conhecido de concessão a indivíduo ([TAOMM vol. 2](https://taomm.org/vol2/pdfs/CH%2011%20Persistence%20Monitor.pdf)) | Se proteção em tempo real entrar no roteiro, pedir cedo e como empresa |
| IA | Regras decidem; nuvem por proxy explica e prioriza, com opt-in explícito; chave própria do usuário permanece como modo avançado; on-device da Apple como camada posterior, por achado | Híbrido regras+modelo: 81% e zero ataques perdidos contra 48% do modelo sozinho em laboratório pequeno ([soc-triage-lab](https://dev.to/willeysingh/private-ai-soc-triage-lab-can-a-small-local-llm-triage-alerts-safely-16l7)); defesas de prompt caem acima de 90% sob ataque adaptativo ([arXiv 2510.09023](https://arxiv.org/abs/2510.09023)) | Sequenciar on-device depois da nuvem é recomendação deste relatório |
| Atualização | Sparkle 2 (>= 2.9.6), arquivos EdDSA, `SURequireSignedFeed`, rollout em 7 grupos; handshake de versão app-helper a cada abertura, re-registro só em divergência | 2.9.6 corrige escalada local em ferramentas root que usam Sparkle ([Sparkle](https://sparkle-project.org/documentation/security-and-reliability/)); Sparkle não atualiza daemons ([discussão #2572](https://github.com/sparkle-project/Sparkle/discussions/2572)) | Versão mais recente em nov/2026 não confirmada |
| Licença | Arquivo de licença Ed25519 verificado offline com CryptoKit, TTL de 14 a 30 dias, carência offline; atrás de um protocolo com duas implementações (direta, Setapp) | [Keygen](https://keygen.sh/docs/api/cryptography/); [Keygate](https://keygate.app/docs/swift) (fornecedor) | Nunca falhar fechado em função de segurança |
| Pagamento | Paddle como MoR, Pix em preço BRL; pré-aprovar o produto na política de uso aceitável antes de construir o checkout | [Paddle Pix](https://developer.paddle.com/concepts/payment-methods/pix/); Paddle pode rejeitar produto fora da sua "risk tolerance" ([Paddle terms](https://www.paddle.com/legal/terms)) | Aceitação de vendedor brasileiro vem de rastreador de terceiros |
| Telemetria | Analytics opt-in; crash opt-in ou opt-out claramente divulgado; helper sem SDK e sem rede; nunca enviar achados, caminhos ou nomes de processo | Padrão mais estrito encontrado: dados de crash ficam em disco sem opt-in ([MacWrench](https://macwrench.app/blog/release-1-1-7)) | Análise de consentimento LGPD/GDPR para crash não foi pesquisada |
| CI | Testes de pacotes em runner barato; build assinado e notarização no Mac do fundador ou runner próprio, com o mesmo script | Runner macOS do GitHub a US$ 0,062/min ([GitHub Docs](https://docs.github.com/en/billing/reference/actions-runner-pricing)); Xcode Cloud inclui 25 h/mês ([Apple](https://developer.apple.com/xcode-cloud/get-started/)) | Xcode Cloud com export Developer ID e Sparkle não foi verificado |

### Modelo e custo por análise

As notas calculam, a preços de lista de 12 nov 2026, o custo de uma análise entre 3k de entrada com 2k de saída e 10k de entrada com 4k de saída ([Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing)). São contas das notas, não medições.

| Modelo | Preço entrada / saída (US$ por milhão) | Custo por análise | Análises no teto de US$ 500 (cenário alto) | ZDR possível |
|---|---|---|---|---|
| Haiku 5.5 | 0,10 / 0,50 | 0,0013 a 0,003 | ~166.000 | Sim, por acordo |
| Sonnet 5.5 | 2 / 10 | 0,026 a 0,06 | ~8.300 | Sim, por acordo |
| Opus 5.5 | 4 / 20 | 0,052 a 0,12 | ~4.100 | Sim, por acordo |
| Fable 5.2 | 8 / 40 | 0,104 a 0,24 | não calculado nas notas | Não |

A saída responde por 67 a 77% do custo, então limitar o tamanho da explicação rende mais que cortar entrada; cache de prompt economiza menos de 15% nesse tamanho. Em Opus 5.5 e Fable 5.2 o raciocínio não desliga e é cobrado como saída, logo o custo real pode exceder a conta (ressalva das notas, a verificar na doc de extended thinking). A recomendação deste relatório, a confirmar por eval na etapa 8: **Haiku 5.5 para veredito tipado por achado e Sonnet 5.5 para a priorização da máquina inteira**, evitando Fable para manter a opção de ZDR. O indício a favor do Haiku é um teste em que ele seguiu 0 de 60 injeções em cada condição ([CyberS3c](https://www.cybers3c.pt/blog/o-atacante-tambem-escreve-nos-seus-logs/)), com o aviso dos próprios autores de que zero é sinal, não garantia.

## O plano em 14 etapas, com um agente responsável por etapa

Critérios marcados como **(meta proposta)** são alvos de engenharia sugeridos por este relatório, ancorados em medições citadas; não são números das notas.

| # | Etapa | Agente principal | Apoio | Fora dos instalados |
|---|---|---|---|---|
| 0 | Prova do protótipo em Mac real | dev-apple-imagem | engineering:tech-debt | Macs com macOS 15, 26 e 27 |
| 1 | Posicionamento, escopo e modelo comercial | raiz-consultor | deep-research | Decisão do fundador |
| 2 | Trilha jurídica e societária (paralela) | **Nenhum** | engineering:documentation | Advogados BR/UE/EUA, contador, corretor, busca de marca |
| 3 | Decisões de arquitetura (ADRs) | engineering:architecture | dev-apple-imagem | — |
| 4 | Limites: protocolo XPC, modelo de achados, API do proxy | engineering:system-design | security-review | — |
| 5 | Direção de design e UX de confiança | diretor-design-arte | Mobbin / Figma | — |
| 6 | Estratégia de testes e corpus de detecção | engineering:testing-strategy | claude-api | Macs/VMs, parecer sobre posse de malware |
| 7 | Implementação nativa (núcleo, helper, UI) | dev-apple-imagem | security-review | Mac com Xcode |
| 8 | Camada de IA: proxy, prompts, evals | claude-api | Supabase | Aumento de tier na Anthropic |
| 9 | Licença, pagamento e site | Supabase | Vercel | Conta Paddle |
| 10 | Pipeline de release | dev-apple-imagem | engineering:deploy-checklist | Apple Developer Program, Mac ou runner macOS |
| 11 | Endurecimento e auditoria | security-review | engineering:tech-debt | Auditoria externa |
| 12 | Beta e lançamento em fases | engineering:deploy-checklist | engineering:documentation | — |
| 13 | Operação e resposta a incidentes | engineering:incident-response | engineering:testing-strategy | Contato de segurança monitorado |

### Etapa 0. Provar o protótipo em Mac real

- **Objetivo:** descobrir quais coletores funcionam de fato em macOS 15, 26 e 27, com e sem FDA, antes de qualquer decisão. O protótipo nunca rodou em macOS.
- **Agente:** dev-apple-imagem, em Claude Code local no Mac. Apoio: engineering:tech-debt para inventariar o que do protótipo se porta, se reescreve ou se descarta.
- **Por que esse:** as incógnitas são de plataforma (processo responsável do TCC, sufixo do arquivo BTM, FDA herdado ou não pelo daemon). raiz-consultor e architecture decidiriam sobre premissas não testadas; testing-strategy planeja, não executa. A sessão de nuvem em Linux não serve aqui.
- **Entregáveis:** matriz coletor por versão por estado de FDA; amostras reais anonimizadas de saída de `sfltool dumpbtm`, plists e esquema do TCC; inventário de dívida do protótipo.
- **Aceite:** 100% dos coletores classificados como funciona, degrada ou falha em cada uma das 3 versões; leitura do TCC testada no 27 como job do launchd e como filho do app; resultado registrado com build do sistema.
- **Dependências:** acesso a hardware. Macs Intel só rodam até o 26.
- **Riscos:** conclusão de uma máquina só, como no relato de campo citado; comportamento mudar em 27.x.

### Etapa 1. Fixar posicionamento, escopo e modelo comercial

- **Objetivo:** decidir o que o produto alega, o que a v1 corrige, como cobra e como se chama.
- **Agente:** raiz-consultor. Apoio: deep-research para fechar lacunas pontuais.
- **Por que esse:** são escolhas com caminhos reais e excludentes, que é o formato do raiz-consultor: (a) "inspetor de persistência e diagnóstico" contra "antimalware", que define a classe do CRA e a exposição na PLD; (b) abrir o código todo, só o helper, ou nada, sabendo que só o produto inteiro livre destrava a autoavaliação; (c) assinatura, compra única com cota de análises, ou ambos. architecture registra decisão técnica, não de mercado.
- **Entregáveis:** documento de posicionamento com lista de alegações permitidas e proibidas; escopo de correções da v1; hipótese de preço; lista curta de nomes.
- **Aceite:** nenhuma alegação do tipo "remove todo malware" ou "protege seu Mac"; toda correção da v1 tem desfazer; preço dentro das âncoras das notas (US$ 29 a 39/ano ou US$ 59 a 79 em compra única com 1 ano de atualizações, inferência das notas a partir de [Cindori](https://cindori.com/store/sensei) e [MacPaw](https://macpaw.com/store/cleanmymac)).
- **Dependências:** etapa 0.
- **Riscos:** "licença vitalícia" conflita com a data de fim de suporte exigida pelo CRA a partir de dez/2027; o custo variável de LLM não existe nos concorrentes de compra única; "Mac Doctor" combina "Mac" com palavra genérica, o que as diretrizes da Apple restringem (texto lido em cópia não oficial).

### Etapa 2. Trilha jurídica e societária, em paralelo desde a etapa 1

- **Objetivo:** constituir a empresa, validar classificação regulatória, contratos e seguro.
- **Agente:** **nenhum dos instalados cobre.** engineering:documentation apenas monta o dossiê (fluxo de dados, lista de subprocessadores, rascunho de RIPD, política de divulgação de vulnerabilidades) para o profissional revisar.
- **Necessário fora:** advogado no Brasil (CDC, LGPD, estrutura), na UE (classe do CRA, PLD, representante do Art. 27 do GDPR), nos EUA (rotulagem de software de terceiros, FTC); contador (Simples, exportação de serviço, câmbio); corretor de seguros; busca de marca em INPI, USPTO e EUIPO.
- **Entregáveis:** SLU constituída; parecer de classe do CRA; EULA com ressalva explícita dos direitos de consumidor; política de privacidade; conta no Single Reporting Platform da ENISA; cotações reais de E&O e cyber.
- **Aceite:** entidade não é MEI nem EI (desenvolvimento e licenciamento de software não constam das ocupações de MEI, segundo [Mistrello](https://mistrelloassessoria.com.br/insights/programador-pode-ser-mei/), fonte secundária); canal de segurança monitorado e procedimento de 24 h/72 h escritos antes do primeiro download na UE.
- **Riscos:** cláusula de limitação de responsabilidade é nula contra consumidor no Brasil (CDC art. 51, I, [Procon-SP](https://www.procon.sp.gov.br/wp-content/uploads/2025/02/CDC_2025.pdf)); MoR não é escudo de responsabilidade por produto.

### Etapa 3. Registrar as decisões de arquitetura

- **Objetivo:** transformar a tabela da seção anterior em ADRs com trade-offs e consequências.
- **Agente:** engineering:architecture. Apoio: dev-apple-imagem para os fatos de plataforma.
- **Por que esse:** cada decisão tem alternativa viva e custo de reversão alto (local do binário privilegiado, DMG contra pkg, destino do TCC, IA em camadas). ADR é o artefato que um fundador que orquestra agentes consegue reusar como contexto fixo em toda sessão. system-design entra depois, sobre decisões já tomadas.
- **Entregáveis:** no mínimo 10 ADRs: stack de UI, alvo mínimo, helper, local do binário privilegiado, TCC/BTM, IA, atualização, licença, telemetria, CI e assinatura.
- **Aceite:** cada ADR cita a evidência, a alternativa rejeitada e o gatilho de revisão (por exemplo, "revisar TCC a cada release 27.x").
- **Dependências:** etapas 0 e 1.
- **Riscos:** decidir antes do parecer do CRA; a recomendação de alvo mínimo assenta em amostras enviesadas.

### Etapa 4. Desenhar os limites entre componentes

- **Objetivo:** especificar o protocolo XPC, o modelo de dados dos achados e a API do proxy.
- **Agente:** engineering:system-design. Apoio: security-review sobre o desenho.
- **Por que esse:** a literatura de vulnerabilidades mostra que, com a validação de cliente correta, a superfície de API do helper é o alvo real. Isso é desenho de fronteira e contrato, o núcleo do system-design; dev-apple-imagem implementaria sem contrato fechado.
- **Entregáveis:** protocolo XPC versionado com verbos de intenção ("desativar item de launchd com este label neste domínio", "quarentenar este caminho"), argumentos tipados, revalidação de caminho no helper, handshake autenticado de versão; esquema de achado com ID atribuído pelo app; contrato do proxy (modelo e prompt de sistema fixos no servidor, cota por licença, disjuntor global de orçamento, log só de metadados).
- **Aceite:** zero verbos genéricos de caminho ou comando; 100% dos verbos com operação inversa definida; campos que cruzam fronteira de confiança são enum, booleano, inteiro limitado ou ID; o cliente não escolhe modelo nem prompt.
- **Riscos:** TOCTOU e symlink em operações root; o proxy virar um Claude gratuito de uso geral.

### Etapa 5. Dirigir o design e a UX de confiança

- **Objetivo:** especificar a interface com gates de performance e acessibilidade, e os fluxos sensíveis.
- **Agente:** diretor-design-arte. Apoio: Mobbin para referências reais e Figma para os artefatos.
- **Por que esse:** é o único que entrega tokens e critérios mensuráveis com HIG e Liquid Glass, e a UX aqui é controle de risco jurídico: os critérios de PUP da Malwarebytes e a ordem da FTC contra a Restoro leem como especificação negativa de produto ([Malwarebytes PUP](https://www.malwarebytes.com/pup); [FTC](https://search.ftc.gov/system/files/ftc_gov/pdf/Restoro.SignedOrder.pdf)). Ele não implementa; quem implementa é a etapa 7.
- **Entregáveis:** tokens; onboarding do helper (aprovação em Itens de Início) e do FDA (pré-popular, abrir painel, sondar, pedir reabertura); tela de achados sem contador alarmista; categoria distinta "software de monitoramento/acesso remoto" com interstício; registro de desfazer; prévia do payload pseudonimizado antes do envio à IA.
- **Aceite:** tabelas a 60 fps com 100 mil linhas (meta proposta, referência [Rockxy](https://rockxy.io/blog/virtual-scrolling-swiftui)); WCAG 2.2 AA e respeito a Reduzir Movimento e Transparência; em Mac limpo, zero achados acima de "informativo"; nenhum "corrigir tudo" que inclua a categoria de monitoramento; texto da IA renderizado como texto puro, sem links nem comandos.
- **Riscos:** vidro customizado em telas densas; APIs de Liquid Glass alucinadas por agentes (um pacote público lista 14 nomes recorrentes, [liquid-glass-skills](https://github.com/YordiLorenzo/liquid-glass-skills)).

### Etapa 6. Definir a estratégia de testes e o corpus de detecção

- **Objetivo:** fixar como se mede qualidade de detecção antes de escrever o detector.
- **Agente:** engineering:testing-strategy. Apoio: claude-api para o desenho dos evals do LLM.
- **Por que esse:** a métrica comercialmente decisiva é falso positivo em Macs limpos com software real, e ela exige um plano de corpus, não só testes unitários. code-review olha diffs; tech-debt olha o passado.
- **Entregáveis:** conjunto malicioso (artefatos de persistência extraídos de amostras da [Objective-See](https://objective-see.org/malware.html) detonadas em VM descartável, mais os atomics de macOS do [Atomic Red Team](https://www.atomicredteam.io/docs/atomics/T1543.001)); conjunto benigno (instalações limpas por versão e imagens "persona": desenvolvedor, corporativo, criativo); matriz de helper (instalação limpa, aprovação negada, concedida depois, desativada, app movido, atualizado com helper rodando, downgrade, assinatura danificada, [Cosenza](https://danielcosenza.com/posts/mac-smappservice-login-items/)); plano de eval do LLM com divisão adversarial.
- **Aceite:** taxa de falso positivo medida por regra; regra que dispara no conjunto benigno não pode ter correção automática; 100% das correções com teste de desfazer; lista protegida (assinado pela Apple, caminhos SIP, componentes do próprio produto) coberta por teste.
- **Dependências:** saídas reais da etapa 0.
- **Riscos:** não existe benchmark público de taxa aceitável de falso positivo para scanner de persistência; legalidade de baixar e manter amostras vivas no Brasil não foi verificada; não se versiona malware vivo no CI.

### Etapa 7. Implementar o app nativo

- **Objetivo:** construir pacotes de núcleo, daemon e UI.
- **Agente:** dev-apple-imagem, em Claude Code local com Xcode. Apoio: security-review em todo diff que toque helper, XPC ou atualização; code-review como rotina em todos os diffs.
- **Por que esse:** é a única persona instalada de Swift, SwiftUI, AppKit, build e assinatura. Limite a declarar: a descrição dela é centrada em iOS, híbrido e imagem, e não menciona XPC, `SMAppService` nem launchd. Por isso os ADRs e o contrato da etapa 4 entram como contexto obrigatório e security-review é apoio fixo, não opcional.
- **Entregáveis:** pacotes com Swift Testing; daemon de linha de comando sem isolamento de UI; app com isolamento padrão no main actor; `CLAUDE.md` com modo de linguagem, comandos exatos de build e proibição de `@unchecked Sendable`; hook que bloqueia escrita em `project.pbxproj`.
- **Aceite:** `swift test` verde nos pacotes; concorrência estrita completa sem escape; conexão XPC de cliente não assinado, com Team ID errado ou versão antiga é invalidada em 100% dos testes; `Process` sempre com vetor de argumentos e caminho absoluto; `SMAppService.status` fora de caminho quente; partida fria e memória ociosa na faixa medida para apps nativos (meta proposta: abaixo de 0,2 s e de 80 MB, referência [Nucleus](https://nucleusframework.dev/en/docs/compare/)).
- **Dependências:** etapas 3 a 6. Pacotes sem framework Apple podem ser compilados e testados na sessão Linux (inferência); o restante exige Mac.
- **Riscos:** os modos de falha documentados de agentes em projetos Xcode ([Simas](https://simaspavlos.medium.com/making-claude-code-safe-for-xcode-projects-4-changes-that-fixed-it-for-me-538ee83b29d8)); nenhuma fonte cobre agentes trabalhando em apps com helper privilegiado; diálogos de aprovação de admin não são verificáveis por agente.

### Etapa 8. Construir a camada de IA

- **Objetivo:** proxy, prompts, saída estruturada, fallback de recusa e evals.
- **Agente:** claude-api. Apoio: Supabase (Edge Function mais Postgres para contadores de cota).
- **Por que esse:** a etapa depende de fatos que mudam rápido (IDs de modelo, preços, cache, `output_config.format`, fallback de recusa, construção de evals), que são a razão de existir do claude-api. Entre os MCPs de infraestrutura, as notas apontam Cloudflare Workers como melhor encaixe para proxy de streaming, mas ele **não está instalado**. Supabase vence os outros dois instalados por juntar função e banco de licenças; Vercel tem piso comercial de US$ 20/mês; Railway em modo serverless pode devolver 502 na primeira requisição após ociosidade (afirmação de concorrente).
- **Entregáveis:** função de proxy; prompt com delimitadores aleatórios por requisição; esquema de veredito; pisos de severidade em código; campo `injection_suspected`; fallback para texto de regra; harness de eval; limite de gasto próprio abaixo do teto.
- **Aceite:** o modelo nunca rebaixa achado abaixo do piso da regra; recusa, saída inválida ou timeout produzem texto determinístico e nunca "sem problemas"; payload não é registrado em nenhuma camada; a função começa o streaming cedo o bastante para respeitar o tempo ocioso de 150 s e a CPU de 2 s do Supabase ([limites](https://supabase.com/docs/guides/functions/limits)); eval reporta falso negativo em itens maliciosos, falso positivo em máquinas só benignas, estabilidade entre execuções, taxa de esquema válido, taxa de recusa, sucesso de injeção, custo e latência; nenhum dado de usuário dentro do esquema JSON.
- **Dependências:** corpus da etapa 6; pedido de aumento de tier antes do lançamento.
- **Riscos:** teto de US$ 500 e tier Evaluation; taxa de recusa em triagem defensiva não tem dado público; ZDR só por negociação com vendas; região da função fora do Brasil é transferência internacional; modelos frontier marcaram de 36 a 86% de tráfego benigno como malicioso em benchmark conduzido por fornecedor ([DeepTempo](https://www.deeptempo.ai/blogs/the-36-percent-false-positive-problem-with-llm-in-the-soc)).

### Etapa 9. Montar licença, pagamento e site

- **Objetivo:** vender globalmente a partir do Brasil com licença verificável offline.
- **Agente:** Supabase (webhook da Paddle que emite a licença assinada, tabelas de licença e ativação). Apoio: Vercel para o site.
- **Por que esse:** o emissor de licença compartilha banco com os contadores de cota do proxy; manter os dois no mesmo lugar reduz a cadeia de processadores. **Nenhum instalado cobre a Paddle em si**: conta, verificação e configuração de checkout são manuais.
- **Entregáveis:** emissor Ed25519 com chave privada fora do host web; verificação no app; checkout com Pix em BRL e cartão; página de preço com renovação igual à entrada; desinstalador completo documentado.
- **Aceite:** licença valida offline; expiração e `issued` no futuro são rejeitados; recursos de segurança não falham fechados; teste sem cartão; produto pré-aprovado pela Paddle por escrito; Pix confirmado num checkout real, não na página de marketing.
- **Riscos:** recebimento em USD por SWIFT com tarifa de US$ 15 mais custos de câmbio; mandato de valor fixo do Pix Automático quebra em reajuste ([Paddle changelog](https://developer.paddle.com/changelog/2026/pix-automatico)); tratamento tributário não pesquisado.

### Etapa 10. Montar o pipeline de release

- **Objetivo:** produzir build assinado, notarizado, grampeado e publicado por script.
- **Agente:** dev-apple-imagem. Apoio: engineering:deploy-checklist.
- **Por que esse:** assinatura, hardened runtime e notarização estão no domínio declarado da persona. **A sessão de nuvem não executa nada disto**: exige o Mac do fundador ou runner macOS, mais adesão ao Apple Developer Program (US$ 99/ano, valor de fonte secundária).
- **Entregáveis:** script único que roda local e em CI: arquivar, assinar helper e depois app, `notarytool submit --wait`, `stapler`, `generate_appcast`; DMG com `.app` único; rotação anual do certificado G2 no calendário.
- **Aceite:** `spctl --assess` retorna Notarized Developer ID; assinatura por hash de identidade; chave EdDSA em cofre com backup offline; workflow de release restrito a tag protegida com aprovação; nenhum `.pkg` assinado pela sub-CA antiga, que deixa de instalar em 1 fev 2027 ([Apple](https://developer.apple.com/news/?id=w4atic4c)).
- **Riscos:** perder a chave do Sparkle impede atualizar a base instalada, vazá-la permite assinar atualização maliciosa; chave de API comprometida que notariza malware derruba a conta inteira; builds reproduzíveis são questão aberta.

### Etapa 11. Endurecer e auditar

- **Objetivo:** fechar a superfície de escalada local antes de qualquer usuário externo.
- **Agente:** security-review. Apoio: engineering:tech-debt para a lista do que fica para depois.
- **Por que esse:** revisão de diffs por segurança reduz o escopo e o custo da auditoria paga. **Não a substitui, e nenhum instalado a cobre**: o sinal de confiança é um relatório de terceiro publicado.
- **Entregáveis:** revisão interna de validação XPC, operações de arquivo como root, atualizador, instalador e desinstalador; relatório externo público; `security.txt` e política de divulgação.
- **Aceite:** zero achados altos em aberto no lançamento; reteste incluído no contrato; desinstalação remove helper e plist.
- **Custo:** as notas estimam de 6 a 15 dias-pessoa, cerca de US$ 9.000 a 52.000, por inferência de auditorias publicadas (ProtonVPN macOS, 6 dias, [SEC Consult](https://protonvpn.com/files/proton-vpn-macos-app-audit-report-2020.pdf); Mullvad, 30 dias-pessoa, [X41](https://www.x41-dsec.de/static/reports/X41-Mullvad-Audit-Public-Report-2024-12-10.pdf)) e tabelas de preço de terceiros. É estimativa, não cotação.
- **Riscos:** fila de semanas nas firmas de marca; auditoria é a maior despesa pré-receita.

### Etapa 12. Rodar beta e lançar em fases

- **Objetivo:** expor o produto gradualmente, começando sem correções.
- **Agente:** engineering:deploy-checklist. Apoio: engineering:documentation (TELEMETRY.md, runbooks, notas de versão).
- **Por que esse:** o checklist com gatilhos de rollback é a evidência de diligência que faltou no caso Delta contra CrowdStrike, cuja alegação sobrevivente descreve implantação "without staged deployments" ([CRN](https://www.crn.com/news/security/2025/5-things-to-watch-in-delta-s-lawsuit-against-crowdstrike)).
- **Entregáveis:** canal beta do Sparkle; primeira coorte com build somente leitura; rollout em 7 grupos; atualizações de regras tratadas como código, com canário e interruptor; envio prévio de builds a VirusTotal e a fornecedores para evitar marcação como PUP.
- **Aceite:** gatilhos de rollback numéricos definidos antes do lançamento; aumento de tier da API aprovado; limite de gasto próprio configurado; modo relatório como padrão.
- **Riscos:** TestFlight não se aplica à distribuição por Developer ID (premissa não confirmada em fonte primária); pico de lançamento esgotar a API.

### Etapa 13. Operar e responder a incidentes

- **Objetivo:** sustentar o produto contra mudanças do macOS, falsos positivos e incidentes.
- **Agente:** engineering:incident-response. Apoio: engineering:testing-strategy para regressão por release do sistema.
- **Por que esse:** há três relógios legais simultâneos e um cenário de revogação que precisam de runbook pronto. Conectores de gestão (Linear, Notion, Slack) estão indisponíveis, então o runbook vive no repositório.
- **Entregáveis:** runbook com CRA 24 h/72 h/14 dias, GDPR 72 h e LGPD 3 dias úteis, dobrados para agente de pequeno porte ([Resolução ANPD 15/2024](http://in.gov.br/en/web/dou/-/resolucao-cd/anpd-n-15-de-24-de-abril-de-2024-556243024)); runbook de revogação indevida de Developer ID; regressão a cada beta do macOS (TCC, BTM, FDA, prompts on-device).
- **Aceite:** simulação de cada runbook antes do lançamento; tempo de resposta a relato de falso positivo definido e medido.
- **Riscos:** fundador único como ponto de falha em janelas de 24 h.

## Riscos e dívida, sem atenuar

**Jurídico.** Contra consumidor, limitar responsabilidade no EULA não funciona no Brasil nem na UE. A doutrina brasileira aplica responsabilidade objetiva a atualização defeituosa ([Migalhas](https://www.migalhas.com.br/coluna/migalhas-de-responsabilidade-civil/443574/responsabilidade-civil-por-falhas-em-softwares-caso-crowdstrike)), e a PLD inclui entre os fatores de defeito a falha de um produto "whose very purpose is to prevent damage", o que torna também a detecção perdida um argumento. O registro de execução mostra, porém, que o risco mais provável para um fornecedor pequeno é engano de marketing e UX: MacKeeper (US$ 2 milhões), Restoro (US$ 26 milhões), Office Depot (US$ 35 milhões), todos por varreduras que alarmavam em máquina limpa ([Truth in Advertising](https://truthinadvertising.org/class-action/mackeeper/); [BleepingComputer](https://www.bleepingcomputer.com/news/security/tech-support-firms-restoro-reimage-fined-26-million-for-scare-tactics/); [Ars Technica](https://arstechnica.com/tech-policy/2019/03/office-depot-tricked-people-into-buying-pc-support-with-fake-virus-scans/)). No sentido inverso, chamar software de terceiro de "malicioso" pode sustentar ação por propaganda enganosa nos EUA; "potencialmente indesejado" foi considerado vago demais para isso ([9th Cir., Enigma v. Malwarebytes](https://cdn.ca9.uscourts.gov/datastore/opinions/2023/06/02/21-16466.pdf)). Rótulos devem ser fatos verificáveis: sem assinatura, não notarizado, inicia no login.

**Privacidade.** Dados pseudonimizados localmente continuam sendo dados pessoais para o fundador, que consegue ligá-los a uma licença ([EDPB 01/2025](https://www.edpb.europa.eu/system/files/2025-01/edpb_guidelines_202501_pseudonymisation_en.pdf)). Ao sair do modelo de chave do usuário para o proxy, o fundador passa a ser controlador e cliente da Anthropic. A afirmação verdadeira em termos padrão é "exclusão em até 30 dias, sem treino, conteúdo sinalizado retido por até 2 anos" ([Anthropic Privacy Center](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data)); "retenção zero" só após acordo. Software instalado pode revelar categorias sensíveis, para as quais legítimo interesse não vale na LGPD.

**Confiança.** Um fundador solo desconhecido pedindo root e FDA, numa categoria que a própria Apple passou a vigiar, não tem crédito inicial. A pilha crível e proporcional é auditoria externa publicada, helper de código aberto, política de divulgação e conformidade estrita com critérios anti-PUP. Certificação AV-TEST ou AV-Comparatives pressupõe proteção em tempo real e pontuaria mal por construção. Para stalkerware, a orientação da Coalition é explícita e implementável: nunca remover automaticamente, rotular de forma distinta, avisar que a remoção pode alertar o agressor e destrói evidência, dar escolha, apontar recursos a partir de um dispositivo seguro ([Coalition Against Stalkerware](https://stopstalkerware.org/information-for-tech-companies/)). No teste EFF/AV-Comparatives de 2025, só um produto avisava das consequências ([EFF](https://www.eff.org/files/2025/11/05/avc_stalkerware_2025.pdf)). O próprio produto tem privilégios de stalkerware; qualquer recurso de visualização remota é inaceitável.

**Qualidade de detecção.** Launch agents são usados majoritariamente por software legítimo, como o próprio ATT&CK reconhece. Os incidentes históricos de dano (McAfee 2010, Webroot 2017, Defender 2023, CrowdStrike 2024) foram todos atualizações de conteúdo, não de binário, e no caso Defender a correção não restaurou os arquivos apagados ([BleepingComputer](https://www.bleepingcomputer.com/news/microsoft/buggy-microsoft-defender-asr-rule-deletes-windows-app-shortcuts/)). As heurísticas de texto do protótipo foram validadas só contra dados simulados; isso é a maior dívida de produto. A camada de IA soma o risco de alucinação que a própria MacPaw admite no Smart Insights ([MacPaw](https://macpaw.com/news/introducing-smart-insights)).

**Helper como alvo.** O produto é o alvo de escalada local mais valioso do Mac do usuário. Os precedentes são diretos: CleanMyMac X com funções root chamáveis por qualquer app, e uma atualização que deixou o helper vulnerável antigo no disco ([Cisco Talos](https://blog.talosintelligence.com/cleanmymacx-helper-service-remote-code-execution-vuln/)); atualizador do Zoom com TOCTOU ([CVE-2022-28756](https://www.cve.org/CVERecord?id=CVE-2022-28756)). Cada falha dessas é também evento reportável no CRA se explorada.

**Dependência da Apple.** "Any Developer ID app signed with a certificate that has been revoked can no longer be installed nor launch if it's already installed" ([Apple](https://developer.apple.com/help/account/certificates/create-developer-id-certificates/)). Já houve revogação por engano, com um dia de negócio parado ([Charlie Monroe](https://blog.charliemonroe.net/a-day-without-business/)). Ações que lembram malware (encerrar processos, mexer em TCC, desativar itens) têm de ser iniciadas pelo usuário, registradas e reversíveis. O FDA, do qual BTM e TCC dependem, está sob revisão anunciada sem detalhes.

**Dívida herdada do protótipo.** Execução como root de todo o coletor; UI web em localhost; chamadas a ferramentas de linha de comando onde há API (libproc, Security framework); `sqlite` direto no TCC; ausência de testes em macOS; modelo de chave do usuário que não escala para consumidor leigo.

## O que não sabemos

| Lacuna ou conflito | Estado nas notas | Quem resolve |
|---|---|---|
| Leitura do TCC no macOS 27 com FDA | Nota de versão diz descontinuado; um relato diz que ainda leu no 27.0 | Teste em hardware (etapa 0) |
| Controles adicionais de FDA | Anunciados sem versão, data ou isenção para ferramentas de segurança | Acompanhar a Apple |
| FDA concedido ao app cobre o daemon do `SMAppService` | Esperado, mas o algoritmo "is not documented, has changed in the past" | Teste por release |
| Onde mora o binário privilegiado | `SMAppService` mantém no bundle; Fitzl recomenda `/Library` após a falha ".localized"; Cure53 elogia instalação por pkg como root; as notas preferem DMG | ADR mais pergunta ao auditor |
| Auto-atualizador | Cure53 trata a ausência como redução de superfície; o plano usa Sparkle | Incluir no escopo da auditoria |
| Classe do CRA e disponibilidade de normas harmonizadas para o item 4 | Classe I muito provável; normas não localizadas | Advogado UE |
| Pessoa responsável na UE sob a PLD para venda direta sem importador; papel do MoR | Não resolvido | Advogado UE |
| Tetos de multa do CRA, CSIRT competente, spillovers da NIS2 | Não verificados | Advogado UE |
| Representante do Art. 27 do GDPR; ePrivacy para leitura do dispositivo; AI Act | Provável obrigação; base não confirmada | Advogado UE |
| Cláusulas-padrão da ANPD no DPA da Anthropic; DPF | Não encontrado | Advogado BR |
| Texto exato dos Termos Comerciais da Anthropic ("not for consumer use", revenda) | Lido por sumarizador automático | Advogado, releitura da página |
| Tensão entre "não retido por padrão" (docs) e "até 30 dias" (Privacy Center) | Não resolvida | Pergunta à Anthropic |
| Limites do tier Evaluation; critérios de ZDR e do Cyber Verification Program | Não publicados ou não recuperados | Contato com a Anthropic |
| Taxa de recusa e latência reais no caso de uso | Sem dado | Eval próprio (etapa 8) |
| Janela de 8.192 tokens no macOS 27, lista de idiomas e de Macs elegíveis; regras de uso aceitável do Foundation Models | Não verificados | Teste em hardware, leitura da Apple |
| Paddle aceita vendedor brasileiro e pessoa física ou jurídica; política para utilitários de segurança | Rastreador de terceiros; AUP não lida | Contato com a Paddle |
| Tributação de recebimentos de MoR estrangeiro, câmbio, pagamento à Anthropic em USD | Não pesquisado | Contador |
| Desconsideração da personalidade jurídica em caso de consumo; jurisdição sobre consumidor estrangeiro | Sem fonte | Advogado BR |
| Custo de auditoria e de seguro | Só estimativas por inferência e páginas de corretor | Cotações reais |
| Nome "Mac Doctor" | Sem busca de marca; diretriz da Apple lida em cópia não oficial | Advogado de PI |
| Posse de amostras de malware no Brasil | Não verificado | Advogado BR |
| Conversão, churn e LTV de utilitários indie de Mac | Nenhuma fonte confiável; 2% é suposição | Só dados próprios |
| Base instalada de Macs, mercado de segurança para Mac, prevalência de stalkerware em macOS | Sem fonte; dados de stalkerware são de celular | Não usar números |
| Jamf contra Moonlock sobre composição de ameaças | Jamf (corporativo): trojans 50%; Moonlock (consumidor): adware ~65% | Para consumidor, as notas preferem Moonlock |
| Builds reproduzíveis para app notarizado; Xcode Cloud com Developer ID e Sparkle | Sem fonte | Experimento |
| Taxa da Apple (US$ 99) e prazo atual de notarização | Fonte secundária; SLA é de 2021 | Página da Apple |
| Prompt de Itens em Segundo Plano ao re-registrar após atualização no 26/27 | Sem relato de primeira mão | Teste em hardware |

## Conclusão

A ordem das etapas inverte a intuição de quem tem um protótipo funcionando: o código é a parte mais barata e a mais bem servida pelos agentes instalados. O que determina se o produto existe em 2027 está fora deles, em três itens com prazo próprio: um Mac real para a etapa 0, que pode mudar o escopo antes de qualquer linha de Swift; a decisão de posicionamento que define a classe do CRA; e a auditoria externa, que tem fila. Vale iniciar os três na mesma semana.

A segunda implicação é que a vantagem competitiva documentada nas notas não é a detecção, cujo piso de preço a Objective-See fixou em zero, nem a explicação por IA, que a MacPaw já entrega on-device. É a combinação de raciocínio entre achados com correção reversível e comportamento correto diante de stalkerware, coisa que quase nenhum produto comercial faz. Essas três propriedades são exatamente as que reduzem a exposição jurídica, o que torna o plano coerente: o que protege o usuário é o que protege o fundador.
