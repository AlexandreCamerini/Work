# mac-doctor — especificação de construção (v1 comercial)

Status: rascunho para execução · 12 nov 2026 · idioma do produto: pt-BR
Evidência e fontes: `reports/Plano comercial do mac doctor.md` e `research_notes/Plano comercial do mac doctor/`.
Oráculo de comportamento: `mac-doctor/prototype/mac-doctor.py` (v2.1, Python).

Convenções: **RF** = requisito funcional, **RNF** = não funcional, **D** = decisão em aberto, **M** = marco.
Números marcados **(meta)** são alvos propostos, a calibrar no M0; não vêm de medição.

---

## 0. Como usar este documento

- É a fonte de verdade de escopo e contratos. Se o código e este documento divergirem, pare e corrija um dos dois no mesmo PR.
- Ordem de leitura para um agente novo: seções 1, 2, 6, 7, 16, depois o marco em que vai trabalhar (seção 15).
- O protótipo Python define **o que** as regras detectam e **como** os textos explicam. Ele não define arquitetura: nada de servidor web local, nada de `subprocess` genérico no componente privilegiado.
- Pare e pergunte ao dono do produto quando: uma decisão da seção 2 bloquear o trabalho; um requisito exigir enfraquecer um item da seção 16; um comportamento do macOS contrariar uma premissa da seção 6.

---

## 1. Decisões fechadas

| # | Tema | Decisão | Consequência direta |
|---|---|---|---|
| F1 | Público | Pessoa leiga que suspeita de espionagem ou tem o Mac lento | Linguagem simples, um achado por cartão, fluxo de segurança para stalkerware |
| F2 | Cobrança | Diagnóstico grátis e completo; correções em um clique e IA na assinatura anual | O diagnóstico nunca é limitado nem exagerado para vender (seção 3.3) |
| F3 | IA | Chave de API do próprio usuário | Sem backend de IA, sem custo por uso, sem dados de análise passando por servidor nosso. Ver conflito D1 |
| F4 | Mercado | Brasil primeiro | Só pt-BR, preço em BRL, Pix. Venda bloqueada fora do Brasil até decisão explícita (D7) |
| F5 | macOS mínimo | macOS 15 | Matriz de teste: 15, 26, 27. Binário universal (15 e 26 rodam em Intel; 27 é só Apple Silicon) |
| F6 | Código aberto | Só o helper privilegiado e o protocolo XPC | Repositório público separado; licença em D6 |
| F7 | Correções | Só reversíveis, com confirmação e desfazer; suspeita de stalkerware nunca é removida direto | Catálogo fechado (seção 10); fluxo de segurança (seção 10.3) |
| F8 | Stack | Swift nativo: SwiftUI para estrutura, AppKit (`NSTableView`) para listas grandes | A interface web em `127.0.0.1` do protótipo é descartada |
| F9 | Privilégio | Daemon root sob demanda via `SMAppService`, XPC com requisito de assinatura, verbos tipados | Nenhum verbo "executar comando" (seção 7) |
| F10 | Distribuição | Direta: Developer ID, hardened runtime, notarização, DMG, Sparkle 2 (>= 2.9.6) | Fora da Mac App Store |
| F11 | Autoridade | Regras locais decidem severidade e ações; a IA só explica e prioriza | Piso de severidade em código (seção 9.5) |

Pré-requisitos já disponíveis: Mac com macOS 26 ou 27 e conta Apple Developer. Falta: pessoa jurídica (D3).

---

## 2. Decisões em aberto

Cada uma tem um padrão assumido para o trabalho não parar, e um marco-limite para ser fechada.

| # | Pendência | Padrão assumido | Quem decide | Limite |
|---|---|---|---|---|
| D1 | **Conflito F1 x F2 x F3.** Leigo não obtém chave de API sozinho, e cobrar assinatura por uma IA que o usuário já paga ao provedor é difícil de justificar | IA fica na assinatura, como respondido; a camada de IA é construída atrás de um protocolo (`AIProvider`) para trocar a origem sem reescrever. Recomendação: reavaliar no fim do beta entre (a) IA com chave própria gratuita, (b) proxy nosso, (c) modelo on-device da Apple por achado no macOS 26+ | Dono | Fim do M10 |
| D2 | Meio de pagamento. A pesquisa cobriu intermediários globais; para venda só no Brasil um gateway nacional com Pix pode ser mais barato e pagar em BRL, mas exige emissão de nota | Não integrar nenhum até D3; a licença é independente do gateway (seção 11) | Dono + contador | Início do M7 |
| D3 | Pessoa jurídica. MEI não é permitido para software; a rota usual é sociedade limitada unipessoal no Simples | Desenvolver e rodar beta fechado gratuito sem vender | Dono + contador | Antes de qualquer cobrança |
| D4 | Conta Apple Developer individual ou de organização. Individual mostra o nome pessoal no certificado; migrar depois exige D-U-N-S | Usar a conta existente no desenvolvimento; não publicar build público antes de fechar | Dono | Início do M8 |
| D5 | Nome do produto. "mac-doctor" é codinome; a regra da Apple para "Mac" em nomes e a busca de marca no INPI não foram verificadas | Usar o codinome só em código e documentos internos; nome visível vem de uma constante única | Dono + advogado | Início do M2 |
| D6 | Licença do helper aberto | Licença permissiva, a confirmar | Dono + advogado | Antes do M9 |
| D7 | Venda fora do Brasil. Na UE o produto cai quase certamente na Classe I do Cyber Resilience Act e na nova diretiva de responsabilidade por produto | Bloqueada | Dono + advogado | Pós-lançamento |
| D8 | Leitura das permissões de privacidade no macOS 27. A Apple declarou a leitura direta do banco descontinuada; um relato de campo diz que ainda funciona com Acesso Total ao Disco | Recurso de melhor esforço com verificação de capacidade por versão (RF-12) | Resultado do M0 | Fim do M0 |
| D9 | Onde mora o binário privilegiado: dentro do app (padrão do `SMAppService`) ou copiado para `/Library`. Há conflito de fonte após a falha de instaladores ".localized" | Dentro do app, registrado com `SMAppService`; pergunta explícita ao auditor | Arquitetura + auditor | Fim do M9 |
| D10 | Modelo padrão da IA | `claude-opus-5-5`, selecionável; trocar só com resultado de avaliação | Avaliação do M6 | Fim do M6 |

---

## 3. Produto

### 3.1 Proposta
Um app que examina o Mac, mostra em português simples o que encontrou, diz o que cada achado significa e permite corrigir com um clique reversível.

### 3.2 Fora do escopo da v1
- Proteção em tempo real, antivírus por assinatura de arquivo, firewall.
- Painel de frota, contas de equipe, versão em inglês.
- Limpeza de disco, desinstalador, "otimizador".
- Proxy de IA nosso e modelo on-device (ver D1).
- Exportação de relatório em PDF.

### 3.3 Princípios que viram requisito
- **P1. Sem susto para vender.** A versão gratuita mostra todos os achados, com severidade real e explicação completa. Nenhum texto, contagem ou cor muda conforme o estado da licença.
- **P2. Alerta não é veredito.** A interface nunca chama um programa de "malware" ou "vírus". Usa "suspeito", "sem desenvolvedor identificado", "merece verificação".
- **P3. Nada é apagado.** Toda ação é desfazível ou é inócua de repetir.
- **P4. O usuário vê antes de sair.** Nada sai do Mac sem uma tela mostrando o conteúdo exato.
- **P5. Dizer o que não foi verificado.** Toda varredura lista as verificações que não rodaram e o motivo.

### 3.4 Gratuito x assinatura

| Recurso | Gratuito | Assinatura |
|---|---|---|
| Varredura completa de segurança e desempenho | Sim | Sim |
| Explicação de cada achado e passo a passo manual | Sim | Sim |
| Botões que abrem o painel certo dos Ajustes | Sim | Sim |
| Fluxo de segurança para suspeita de stalkerware | Sim | Sim |
| Correções em um clique, histórico e desfazer | Não | Sim |
| Análise por IA (chave do usuário) | Não | Sim (ver D1) |
| Atualização das regras de detecção | Sim | Sim |

A licença controla só o que o app oferece na interface. O helper não conhece a licença.

---

## 4. Requisitos funcionais

**Varredura**
- RF-01 Uma varredura roda todos os coletores disponíveis e mostra progresso por etapa.
- RF-02 Sem o helper aprovado, a varredura roda em modo parcial e lista o que ficou de fora (P5).
- RF-03 Varredura é somente leitura. Nenhum coletor escreve fora da pasta de dados do app.
- RF-04 Resultados ficam só em memória e num arquivo local protegido; nunca são enviados a servidor nosso.

**Achados**
- RF-05 Cada achado tem: identificador estável, regra, severidade (crítico, atenção, informativo), categoria (segurança, desempenho), título, evidência estruturada, situação e lista de correções aplicáveis.
- RF-06 O catálogo de regras da v1 é o da seção 8. Cada regra portada passa nos testes dourados contra o protótipo (seção 14.2).
- RF-07 Item que aponta para arquivo inexistente vira achado próprio ("órfão"), nunca alerta de risco ativo.
- RF-08 A tela inicial mostra placar por severidade, plano de ação ordenado e a lista de achados com filtro por categoria e severidade.

**Scripts em segundo plano**
- RF-09 Para cada item que executa script: estado (ativo, desativado, órfão), gatilho, caminho, dono, permissões, datas, origem de download, SHA-256, indicadores com a linha que os disparou e o conteúdo (até 150 linhas, só local).

**Permissões e capacidades**
- RF-10 O app funciona sem Acesso Total ao Disco. A lista de itens em segundo plano vem do helper e não depende dele; só as permissões de privacidade dependem (e de D8).
- RF-11 O app nunca pede Acesso Total ao Disco na primeira execução; oferece quando o usuário abre um recurso que depende dele, explicando o ganho.
- RF-12 Cada coletor declara uma verificação de capacidade por versão do macOS. Se a leitura das permissões de privacidade falhar, o cartão correspondente vira "não foi possível verificar nesta versão" com botão para o painel de Privacidade.

**Correções**
- RF-13 Só existem as correções da seção 10. Cada uma mostra, antes de executar: o que será feito em linguagem simples, os alvos exatos e se dá para desfazer.
- RF-14 Toda correção executada entra no histórico com data, alvo e botão Desfazer quando aplicável.
- RF-15 Desfazer nunca sobrescreve um arquivo que reapareceu no lugar original.
- RF-16 Achado classificado como possível stalkerware não oferece correção direta; segue o fluxo da seção 10.3.

**IA**
- RF-17 A IA é opcional e desligada por padrão. Exige chave de API do usuário, guardada no Keychain.
- RF-18 Antes de cada envio o app mostra o conteúdo exato. Só achados são enviados; inventário não.
- RF-19 O conteúdo é pseudonimizado localmente (seção 9.2). Se o filtro detectar dado pessoal remanescente, o envio é bloqueado.
- RF-20 A resposta é validada (seção 9.4). A IA não cria, remove nem rebaixa achados abaixo do piso da regra.
- RF-21 Caminhos citados pela IA que não constam no conteúdo enviado geram aviso visível.

**Licença e atualização**
- RF-22 Licença em arquivo assinado, verificada offline. Sem licença válida o app continua funcionando no modo gratuito.
- RF-23 Atualização automática com feed e pacotes assinados; o usuário pode desligar.
- RF-24 Após atualizar, o app confere a versão do helper e o registra de novo só se divergir.
- RF-25 Desinstalar remove o helper, o registro em Itens de Início e, com confirmação, a quarentena.

---

## 5. Requisitos não funcionais

| # | Requisito | Alvo |
|---|---|---|
| RNF-01 | Primeira tela após abrir | <= 400 ms num MacBook Air M1 **(meta)** |
| RNF-02 | Varredura completa | <= 20 s no mesmo Mac; nenhuma etapa sem progresso por mais de 3 s **(meta)** |
| RNF-03 | Memória do app ocioso | <= 120 MB **(meta)** |
| RNF-04 | Rolagem de listas | 60 quadros por segundo com 5 mil linhas **(meta)** |
| RNF-05 | Helper | Não fica em execução com o app fechado; sem `KeepAlive`; sem rede |
| RNF-06 | Tamanho do app | <= 30 MB no DMG **(meta)** |
| RNF-07 | Acessibilidade | VoiceOver em todos os fluxos, navegação completa por teclado, contraste AA, respeito a Reduzir Movimento e Aumentar Contraste |
| RNF-08 | Compatibilidade | macOS 15, 26 e 27; Intel e Apple Silicon onde o sistema existir |
| RNF-09 | Concorrência | Swift 6 em modo estrito; nenhum `@unchecked Sendable` sem comentário justificando e revisão de segurança |
| RNF-10 | Falha segura | Erro em um coletor não derruba a varredura; erro de licença nunca desliga diagnóstico |

---

## 6. Arquitetura

### 6.1 Processos

```
┌──────────────────────────── App (usuário, sem root) ───────────────────────────┐
│ UI SwiftUI/AppKit ─ MDRules ─ MDScanner(coletores sem privilégio) ─ MDAI ─ MDLic │
└───────────────┬─────────────────────────────────────────────────────────────────┘
                │ XPC (serviço Mach; requisito de assinatura nos dois sentidos)
┌───────────────▼──────────────── Helper (root, sob demanda) ─────────────────────┐
│ Coletores privilegiados (somente leitura) · Ações do catálogo · Registro · Quarentena │
└─────────────────────────────────────────────────────────────────────────────────┘
```

- O app é o único cliente do helper. O helper valida o chamador por requisito de assinatura (identificador, Team ID, versão mínima), nunca por PID.
- A rede só existe no app, e só para: atualização, validação de licença e chamada de IA com a chave do usuário.
- O helper é registrado com `SMAppService.daemon`; o usuário aprova uma vez em Itens de Início.

### 6.2 Módulos (pacotes Swift locais)

| Pacote | Conteúdo | Depende de | Aberto |
|---|---|---|---|
| `MDModel` | Tipos de achado, evidência, severidade, snapshot da varredura | — | Sim |
| `MDHelperProtocol` | Protocolo XPC, tipos de requisição e resposta, versão | `MDModel` | Sim |
| `MDHelper` | Daemon: coletores privilegiados, ações, registro, quarentena | `MDHelperProtocol` | Sim |
| `MDScanner` | Coletores sem privilégio e orquestração da varredura | `MDModel`, `MDHelperProtocol` | Não |
| `MDRules` | Regras, catálogo, roteiros de explicação e correção | `MDModel` | Não |
| `MDAI` | Pseudonimização, `AIProvider`, validação de resposta | `MDModel` | Não |
| `MDLicensing` | Verificação do arquivo de licença, estados | — | Não |
| `App` | Alvo fino: telas, navegação, composição | todos | Não |

Regras: `MDRules` e `MDModel` não importam AppKit nem fazem I/O; `MDHelper` não importa nada fechado; o alvo `App` não contém lógica de negócio.

### 6.3 Premissas a validar no M0
- Um daemon registrado pelo app herda o Acesso Total ao Disco concedido ao app (atribuição de processo responsável). Não é documentado; testar por versão.
- Itens em segundo plano: **resolvido no M0**. `sfltool dumpbtm` no helper é o caminho; funciona como root sem Acesso Total ao Disco. O leitor direto do arquivo foi descartado (pasta protegida).
- Leitura das permissões de privacidade nas três versões (D8).

---

## 7. Contrato do helper

### 7.1 Regras invioláveis
1. Nenhum verbo recebe comando, caminho livre ou argumento de linha de comando. Ações recebem o **identificador de um item que o próprio helper coletou** no snapshot atual.
2. O helper refaz a validação no momento da ação: o alvo ainda existe, é arquivo ou pasta real (nunca link simbólico), está numa área permitida e não mudou desde o snapshot.
3. Matar processo exige PID, caminho do executável e hora de início; os três têm de bater.
4. Quarentena e registro ficam em pasta do root que o usuário não grava.
5. O helper não abre soquete de rede, não lê licença e não carrega código externo.
6. Toda chamada entra num registro local com hora, verbo, alvo e resultado.
7. Versões incompatíveis de app e helper recusam a conexão com erro tipado.

### 7.2 Verbos

| Verbo | Tipo | Entrada | Saída |
|---|---|---|---|
| `handshake` | Controle | versão do protocolo | versão do helper, capacidades |
| `scanPrivileged` | Leitura | conjunto de coletores pedidos | snapshot com itens identificados e lista do que não pôde ser lido |
| `disableLaunchItem` | Ação | id do item | registro |
| `quarantineItem` | Ação | id do item | registro com origem e destino |
| `terminateProcess` | Ação | identidade do processo: PID, caminho do executável e hora de início (só conferência, ver 7.1 item 3 e ADR 0002) | registro |
| `removeLoginHook` | Ação | — | registro com valor anterior |
| `setGatekeeper` / `setFirewall` | Ação | — (só liga; desligar é pelos Ajustes, catálogo 10.1) | estado resultante |
| `undo` | Ação | id do registro | resultado |
| `history` | Leitura | — | registros |
| `uninstall` | Controle | — | resultado |

Contrato em código: `app-nativo/MDHelperProtocol` (ADR 0002). Alvos de ação de item carregam o id do snapshot em que o helper os coletou.

Coletores privilegiados: itens em segundo plano, tarefas agendadas do administrador, regras de `sudo`, perfis de configuração, conexões de rede de todos os processos, scripts ilegíveis para o usuário.

### 7.3 Áreas em que mover arquivo é permitido
Pasta pessoal do usuário, `/Users/Shared`, pastas temporárias, `/Library` (exceto `/Library/Apple`) e `/Applications`. Nunca `/System`, `/usr`, `/bin`, `/sbin`, nem o interior de um `.app`.

---

## 8. Catálogo de regras da v1

Identificadores iguais aos do protótipo. "Helper" = precisa do helper para coletar; "FDA" = precisa de Acesso Total ao Disco.

| Regra | Categoria | Piso | Coleta | Correção |
|---|---|---|---|---|
| `sip_off` | Segurança | Crítico | App | Guia manual |
| `gatekeeper_off` | Segurança | Atenção | App | `setGatekeeper` |
| `filevault_off` | Segurança | Atenção | App | Abrir Ajustes |
| `firewall_off` | Segurança | Informativo | App | `setFirewall` |
| `persist_caminho` | Segurança | Crítico | App | Desativar, quarentena |
| `persist_sem_assinatura` | Segurança | Crítico (informativo se ferramenta de desenvolvimento) | App | Desativar, quarentena |
| `persist_orfao` | Segurança | Informativo ou atenção | App | Quarentena do `.plist` |
| `script_bg` | Segurança | Pelo maior indicador | App + Helper | Desativar, quarentena |
| `login_hook` | Segurança | Crítico | App | `removeLoginHook` |
| `cron` | Segurança | Atenção | App + Helper | Guia manual |
| `perfil_shell` | Segurança | Crítico | App | Guia manual |
| `legado` | Segurança | Atenção | App | Guia manual |
| `ssh_chaves` | Segurança | Atenção | App | Guia manual |
| `sudoers` | Segurança | Atenção | Helper | Guia manual |
| `permissao_sensivel` | Segurança | Atenção | FDA (D8) | Redefinir permissão, abrir Ajustes |
| `perfil_mdm` | Segurança | Atenção | Helper | Abrir Ajustes |
| `acesso_remoto_ativo` | Segurança | Atenção | App | Abrir Ajustes |
| `proxy` | Segurança | Atenção | App | Abrir Ajustes |
| `cert_raiz` | Segurança | Atenção | App | Abrir Acesso às Chaves |
| `proc_caminho` | Segurança | Crítico | App | Encerrar, quarentena |
| `proc_sem_assinatura` | Segurança | Atenção | App | Encerrar |
| `proc_dev` | Segurança | Informativo | App | — |
| `app_sem_assinatura` | Segurança | Atenção | App | Quarentena |
| `indicador_conhecido` | Segurança | Por categoria | App | Fluxo 10.3 se stalkerware ou monitoramento |
| `mem_pressao`, `swap_alto` | Desempenho | Crítico, atenção | App | Abrir Monitor de Atividade |
| `kernel_task`, `termico` | Desempenho | Crítico | App | Guia manual |
| `cpu_alto`, `carga_alta` | Desempenho | Atenção | App | Encerrar (se não for do sistema) |
| `disco_cheio` | Desempenho | Crítico | App | Abrir Ajustes |
| `smart_falha`, `panic` | Desempenho | Crítico | App | Guia manual |
| `spotlight`, `timemachine`, `uptime`, `pouca_ram`, `pouca_energia`, `bateria`, `travamentos`, `muitos_agentes` | Desempenho | Como no protótipo | App | Abrir Ajustes ou guia |

Saem em relação ao protótipo: liberar cache de memória e refazer o índice do Spotlight (não são reversíveis nem necessários).

Achados do M0 que viram regra (ver `docs/M0-matriz.md`): saída de comando muda com o idioma do sistema (decimal com vírgula) e entre versões (nome da autoridade de assinatura); binário da Apple se reconhece por requisito de assinatura (`anchor apple`), nunca por texto; estado térmico não vem de `pmset` em Apple Silicon.

Os coletores usam APIs do sistema no lugar de comandos sempre que existir API pública (processos, assinatura de código, memória, disco, estado térmico). Onde não existir, o comando roda com caminho absoluto, argumentos fixos e tempo limite.

---

## 9. Camada de IA (chave do usuário)

### 9.1 Forma
- `AIProvider` é um protocolo com uma operação: recebe o conteúdo pseudonimizado e devolve a análise estruturada. A v1 tem uma implementação, que chama a API da Anthropic direto do app com a chave do usuário.
- Sem ferramentas. Saída estruturada por esquema. Sem redirecionamento HTTP. Sem proxy do sistema.
- Recusa do provedor ou erro de rede: o app mostra a mensagem e mantém os achados locais intactos.

### 9.2 Pseudonimização (portar a classe `Filtro` do protótipo, com os mesmos testes)
Troca por marcadores reversíveis só em memória: pasta pessoal, usuário, nome do Mac, partes do nome próprio, IPs internos. Troca por marcadores não reversíveis: e-mails, endereços MAC, UUIDs, senhas e tokens, credenciais em URL, parâmetros de URL, blocos longos sem cara de caminho. Preserva: caminhos de arquivo, nomes de app e processo, identificadores de equipe, IPs públicos de destino, SHA-256.

### 9.3 O que é enviado
Lista de achados (regra, piso, título, evidência filtrada), resumo do sistema, maiores consumidores de CPU e memória, verificações não executadas. Conteúdo de script só com opção marcada na tela de envio.

### 9.4 Validação da resposta
Só aceita identificadores de achados enviados; valores fora do esquema viram o valor mais conservador; texto sem links, sem crases e com tamanho limitado; marcadores revertidos localmente; caminhos não confirmados geram aviso (RF-21).

### 9.5 Piso de severidade
A severidade exibida é a da regra. A IA contribui com um parecer separado (provavelmente legítimo, investigar, suspeito) que aparece como etiqueta e nunca altera cor, ordem do placar nem disponibilidade de correção. Texto vindo da máquina é dado, nunca instrução; um item cujo conteúdo se dirija a um analista ou a uma IA é tratado como suspeito pela própria regra.

### 9.6 Avaliação
Conjunto de casos com resposta esperada, incluindo tentativas de injeção em nomes de processo e em scripts. Critério de aceite no M6.

---

## 10. Correções

### 10.1 Catálogo

| Correção | Efeito | Desfazer |
|---|---|---|
| Desativar item de inicialização | Para o item e impede novo início; arquivo fica no lugar | Reativa |
| Quarentena | Desativa e move os arquivos para pasta protegida | Devolve ao lugar e reativa |
| Encerrar processo | Encerra após conferir que é o mesmo programa | Não se aplica |
| Remover gancho de login | Remove a configuração; guarda o valor anterior | Restaura |
| Redefinir permissão de privacidade | O app volta a pedir a permissão quando precisar | Conceder de novo |
| Ligar Gatekeeper ou firewall | Liga a proteção | Desligar nos Ajustes |
| Abrir painel dos Ajustes | Só navega | Não se aplica |

### 10.2 Confirmação
Diálogo com título da ação, nome do item, descrição em uma frase, alvos exatos e a linha "Dá para desfazer?". Botão primário com o verbo da ação. Fechar o diálogo nunca executa.

### 10.3 Fluxo de segurança para possível stalkerware
Dispara quando a regra `indicador_conhecido` é de stalkerware ou monitoramento, ou quando o mesmo item tem inicialização automática e permissão de ler teclado ou gravar tela.

1. O cartão abre com um aviso antes de qualquer botão: remover pode alertar quem instalou e apaga evidência.
2. O usuário escolhe uma de três saídas: **guardar evidência** (salva um arquivo com os dados do achado), **ver orientações** (texto fixo: procurar apoio a partir de outro aparelho, com os canais de ajuda), **remover agora** (só então aparecem as correções, com uma segunda confirmação).
3. Nenhuma ação automática, sugestão de prioridade ou texto da IA pode pular o passo 1.

O texto de orientação e a lista de canais de ajuda precisam ser validados com uma organização especializada antes do lançamento.

---

## 11. Licença e cobrança

- Arquivo de licença assinado com Ed25519, verificado offline com a chave pública embutida. Campos: identificador, plano, validade, emissão.
- Revalidação periódica pela rede com carência longa offline. Falha de rede nunca rebaixa o plano dentro da carência.
- Estados: gratuito, assinatura ativa, assinatura vencida (volta ao gratuito, sem bloquear nada do gratuito).
- Backend mínimo: uma função que recebe o aviso de pagamento e emite a licença, e uma que revalida. Hospedagem proposta: Supabase. Nenhum dado de varredura passa por ele.
- O gateway de pagamento fica atrás de uma interface; a escolha é D2.
- Página de venda e de download: site estático.

---

## 12. Distribuição e atualização

- Assinatura com Developer ID, hardened runtime, carimbo de tempo seguro, sem `get-task-allow`. Ordem: helper, app, notarização, grampo, DMG.
- Sparkle 2 na versão 2.9.6 ou superior, com feed assinado obrigatório e pacotes EdDSA. Liberação em grupos.
- Regras de detecção atualizam junto com o app na v1. Atualização de regras em separado só depois de ter a mesma liberação em fases.
- O mesmo roteiro de release roda no Mac do dono e, depois, em CI com runner macOS. Segredos de assinatura nunca entram no repositório.

---

## 13. Telemetria e privacidade

- Nada é coletado por padrão. Relatório de falha e métricas de uso são opt-in, com texto que diz o que vai.
- Nunca enviar: achados, caminhos, nomes de processo, conteúdo de script, identificadores do aparelho.
- O helper não tem telemetria.
- Política de privacidade e termos de uso são entregáveis da trilha jurídica (seção 15, TJ).

---

## 14. Testes

### 14.1 Camadas
- Unidade por pacote com `swift test`, sem Xcode aberto.
- Contrato do helper: testes que tentam abusar de cada verbo (identificador inventado, link simbólico, caminho com `..`, alvo trocado depois do snapshot, cliente sem assinatura).
- Interface: fluxos principais automatizados, incluindo teclado e VoiceOver.
- Matriz manual por versão: 15, 26, 27, com e sem Acesso Total ao Disco, com e sem helper.

### 14.2 Testes dourados contra o protótipo
O protótipo gera, a partir de snapshots de entrada, a lista de achados esperada. As mesmas entradas alimentam `MDRules`; a saída tem de coincidir em regra, piso e campos de evidência. Os testes do filtro de privacidade e da validação de IA do protótipo são portados caso a caso.

### 14.3 Qualidade de detecção
- Corpus benigno: Macs reais com software comum de usuário e de desenvolvimento.
- Corpus de persistência: técnicas públicas de inicialização automática aplicadas em máquina de teste isolada.
- Medidas: achados críticos por Mac limpo e técnicas do corpus detectadas. Alvos no M9.

---

## 15. Marcos

Cada marco só fecha com seus critérios cumpridos e registrados no PR. Agente principal entre parênteses.

**M0. Prova em Mac real** (`dev-apple-imagem`)
- Rodar o protótipo nas versões disponíveis; preencher a matriz de capacidades (coletor x versão x com/sem Acesso Total ao Disco).
- Aceite: matriz preenchida; D8 respondida com evidência; lista do que se porta, se reescreve ou se descarta.

**M1. Decisões e contratos** (`engineering:architecture`, depois `engineering:system-design`)
- Registros de decisão para F8 a F11 e D9; protocolo XPC e modelo de achados em código compilável, sem implementação.
- Aceite: `MDModel` e `MDHelperProtocol` compilam; revisão de segurança do protocolo sem pendência.

**M2. Design** (`diretor-design-arte`)
- Especificação das telas: varredura, painel, cartão, confirmação, histórico, envio à IA, fluxo 10.3, estados vazio, erro e parcial.
- Aceite: tokens e critérios de aceite por tela; RNF-07 coberto; nenhuma tela depende do estado da licença para severidade (P1).

**M3. Regras** (`dev-apple-imagem`, apoio `engineering:testing-strategy`)
- `MDRules` com o catálogo da seção 8 e os textos.
- Aceite: 100% dos testes dourados passando; nenhuma dependência de I/O no pacote.

**M4. Diagnóstico gratuito** (`dev-apple-imagem`)
- `MDScanner` sem privilégio e interface de diagnóstico.
- Aceite: RF-01 a RF-12 no modo sem helper; RNF-01 a RNF-04 medidos e registrados.

**M5. Helper e correções** (`dev-apple-imagem`, apoio fixo `security-review`)
- `MDHelper`, registro, quarentena, histórico, desfazer, fluxo 10.3.
- Aceite: RF-13 a RF-16; todos os testes de abuso da seção 14.1 passando; seção 7.1 conferida item a item.

**M6. IA** (`claude-api`)
- `MDAI` com chave do usuário, tela de envio, validação.
- Aceite: RF-17 a RF-21; avaliação com zero injeções seguidas no conjunto de teste e nenhuma violação do piso; D10 fechada.

**M7. Licença e venda** (Supabase, apoio Vercel)
- `MDLicensing`, emissão e revalidação, site.
- Aceite: RF-22; app íntegro sem rede; D2 e D3 fechadas antes de ligar cobrança.

**M8. Release** (`dev-apple-imagem`, apoio `engineering:deploy-checklist`)
- Roteiro de assinatura, notarização, DMG e Sparkle.
- Aceite: build instalado em Mac limpo sem aviso do Gatekeeper; atualização de uma versão para outra com helper re-registrado (RF-24); desinstalação limpa (RF-25).

**M9. Endurecimento e auditoria** (`security-review`, apoio `engineering:tech-debt`)
- Revisão interna, publicação do helper, auditoria externa do helper e do atualizador.
- Aceite: nenhum achado alto ou crítico em aberto; alvos de detecção definidos e medidos; D6 e D9 fechadas.

**M10. Beta e lançamento no Brasil** (`engineering:deploy-checklist`, depois `engineering:incident-response`)
- Beta fechado gratuito, depois lançamento em fases.
- Aceite: critérios de saída do beta definidos antes de começar; canal de contato de segurança ativo; D1 reavaliada com dados do beta.

**TJ. Trilha jurídica, em paralelo desde o M1** (nenhum agente instalado)
- Empresa, termos de uso, política de privacidade, busca de marca, revisão do fluxo 10.3, seguro.
- Bloqueia: M7 (cobrança) e M10 (lançamento).

---

## 16. Guardrails para agentes

Nunca, sem aprovação explícita do dono:
1. Adicionar ao helper um verbo que aceite comando, caminho livre ou argumentos arbitrários.
2. Afrouxar o requisito de assinatura do XPC ou validar o chamador por PID.
3. Dar acesso de rede ao helper.
4. Criar ação que apague arquivo ou que não tenha desfazer, fora do catálogo 10.1.
5. Fazer severidade, contagem ou texto de achado dependerem da licença.
6. Deixar a IA alterar severidade, criar achado ou acionar correção.
7. Enviar a qualquer servidor dado de varredura, caminho, nome de processo ou conteúdo de script.
8. Silenciar erro de concorrência com `@unchecked Sendable` ou equivalente.
9. Editar `project.pbxproj` à mão; estrutura de projeto muda por pacote ou por gerador.
10. Colocar segredo de assinatura, chave de API ou chave privada de licença no repositório.
11. Desativar, pular ou marcar como instável um teste para o build passar.

Definição de pronto de qualquer PR: compila sem avisos novos, testes do pacote passam, requisitos tocados estão citados, e mudança no helper ou no protocolo passou por revisão de segurança.

---

## 17. Riscos assumidos

| Risco | Efeito | Tratamento |
|---|---|---|
| Apple restringe mais o Acesso Total ao Disco e a leitura de permissões | Parte do diagnóstico some | RF-12; produto útil sem FDA |
| Chave do próprio usuário afasta o leigo | IA pouco usada; assinatura sustentada só pelas correções | D1 no fim do beta |
| Falso positivo leva a quarentena de algo legítimo | Dano ao usuário e exposição jurídica | Só ações reversíveis; P2; corpus benigno; termos de uso na TJ |
| Falha no helper vira escalada de privilégio | Dano grave de reputação | Seção 7.1; código aberto; auditoria no M9 |
| Certificado Developer ID revogado | App para de abrir para todos | Conduta conservadora; plano de comunicação no M10 |
| Fornecedor desconhecido em categoria de baixa confiança | Baixa conversão | Diagnóstico gratuito real; helper aberto; auditoria publicada |
| Nada foi executado em macOS até agora | Premissas da seção 6.3 podem cair | M0 antes de qualquer código novo |
