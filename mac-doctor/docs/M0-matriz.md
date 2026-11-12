# M0 — matriz de capacidades (parcial)

Estado: **em andamento**. Coberto até agora: 1 Mac, macOS 27.3 (build 26C5035r), Apple M2, sem Acesso Total ao Disco, como usuário e como root. Sonda v1.
Falta: rodada com a sonda v3 (separa "sem acesso" de "banco bloqueado"); macOS 26 e 15; Intel.

O sufixo com letra no número de build costuma indicar versão de teste. Se for o caso, repetir na versão final antes de fechar a D8.

## Resultado por fonte de dados

| Fonte | Usuário, sem FDA | Root, sem FDA | Leitura |
|---|---|---|---|
| SIP, Gatekeeper, FileVault, firewall | OK | OK | Funciona sem privilégio |
| Arquivos `.plist` de inicialização (3 pastas) | OK (30 arquivos) | OK | Funciona sem privilégio |
| `launchctl print-disabled` | OK | OK | Formato novo: `enabled` / `disabled` |
| `launchctl print <serviço>` | Inconclusivo | Inconclusivo | A sonda v1 usou um rótulo que não existe; corrigido na v2 |
| Itens em segundo plano via `sfltool dumpbtm` | Não testado | **OK** (110 registros, todos os campos) | Funciona como root **sem** Acesso Total ao Disco |
| Arquivo de itens em segundo plano | FALHA | FALHA | Não listável nem como root; a v2 distingue "pasta protegida" de "caminho mudou" |
| Permissões de privacidade (banco do usuário) | FALHA | FALHA | `unable to open database` |
| Permissões de privacidade (banco do sistema) | FALHA | FALHA | `unable to open database` |
| `tccutil` | Presente | Presente | Só existência; nenhuma redefinição foi executada |
| Spotlight por identificador de app | OK | OK | |
| Assinatura de um app (`codesign`) | OK | OK | |
| Assinatura de binário do sistema | **FALHA** | **FALHA** | A saída não trouxe `Authority=Software Signing`; a v2 registra os campos reais |
| Lista de processos com caminho | OK | OK | |
| Conexões de rede (`lsof`) | Só do usuário | 5 usuários | Root é necessário para ver processos do sistema |
| Proxy, certificados confiáveis, estado de MDM | OK | OK | |
| Lista de perfis | Não testado | OK | Requer root |
| `top`, `memory_pressure`, tempo ligado | OK | OK | Ver ressalva de idioma abaixo |
| Swap (`sysctl vm.swapusage`) | **FALHA** | **FALHA** | Saída não casou com o formato esperado; hipótese: decimal com vírgula |
| Limite térmico (`pmset -g therm`) | FALHA | FALHA | Sem `CPU_Speed_Limit`; esperado em Apple Silicon |
| Bateria, SMART, Time Machine, relatórios de falha | OK | OK | |
| `python3`, Xcode, Swift | OK | OK | O Mac está pronto para compilar |

## O que já dá para concluir

1. **Itens em segundo plano não dependem de Acesso Total ao Disco.** `sfltool dumpbtm` como root entrega tudo. A especificação previa ler o arquivo e usar `sfltool` como alternativa; a ordem se inverte: `sfltool` no helper é o caminho principal.
2. **Root sozinho não lê as permissões de privacidade.** Sem Acesso Total ao Disco, nem o usuário nem o root abrem os bancos. Um helper root não resolve isso por si.
3. **Limite térmico por `pmset` não existe neste Mac.** A regra `termico` do protótipo nunca dispara em Apple Silicon. No app nativo, usar o estado térmico da API do sistema.
4. **O Mac tem o necessário para o desenvolvimento nativo**: Xcode e Swift respondem.

## Hipóteses a confirmar com a sonda v2

| Hipótese | Por que importa | Como a v2 confirma |
|---|---|---|
| Em Macs em português, `sysctl` e `top` imprimem decimais com vírgula | O protótipo perderia swap e a lista de maiores consumidores de CPU, sem avisar | Compara a saída no idioma do usuário e em `en_US` |
| `codesign` não mostra mais `Authority=Software Signing` para binários do sistema | O protótipo classificaria binários da Apple como "assinatura não verificável", gerando alerta falso | Lista os campos reais e testa o requisito `anchor apple` |
| A pasta do arquivo de itens em segundo plano é protegida, não inexistente | Define se vale manter um leitor do arquivo | Lista a pasta e registra o tipo de erro |

O protótipo 2.2 já roda todo comando com idioma fixo (`en_US.UTF-8`), o que elimina a primeira hipótese como fonte de erro independentemente do resultado.

## Decisão D8 (leitura das permissões de privacidade no macOS 27)

**Ainda aberta, com um indício forte.** O dono relata ter concedido Acesso Total ao Disco ao Terminal e a leitura continuou falhando. Há duas explicações e a sonda v1/v2 não as separa, porque usava o próprio banco de permissões para detectar o acesso:

- o macOS 27.3 bloqueia o banco mesmo com o acesso concedido, como a Apple anunciou; ou
- o acesso não estava valendo para aquele processo (Terminal não reaberto, ou concessão feita a outro app de terminal).

A sonda v3 detecta o acesso por outras pastas protegidas (Safari, Mail, Mensagens) e registra o app de terminal em uso. Se ela marcar `com-fda` e a leitura do banco continuar falhando, a D8 fecha como "bloqueado no macOS 27": a auditoria de permissões sai da v1 nessa versão e o cartão passa a guiar o usuário ao painel de Privacidade.

## Premissas da SPEC 6.3

| Premissa | Estado |
|---|---|
| Daemon registrado pelo app herda o Acesso Total ao Disco | Não testável no M0 |
| Arquivo de itens em segundo plano legível com Acesso Total ao Disco | Pendente da rodada com FDA; perdeu importância, dado o item 1 |
| Leitura das permissões de privacidade nas três versões | Pendente (D8) |

## Portar, reescrever, descartar (parcial)

| Coletor do protótipo | Destino | Motivo |
|---|---|---|
| Postura do sistema | Portar | Funciona sem privilégio |
| Itens de inicialização por `.plist` | Portar | Funciona sem privilégio |
| Itens em segundo plano | Portar, via helper com `sfltool` | Confirmado como root |
| Permissões de privacidade | Em espera | D8 |
| Assinatura de código | Reescrever com a API de segurança do sistema | A leitura de texto do `codesign` falhou para binário do sistema |
| Métricas por `sysctl`, `top`, `pmset` | Reescrever com APIs do sistema | Saída sensível a idioma; térmico indisponível por `pmset` |
| Conexões de rede | Portar no helper | Precisa de root para cobertura total |

## Defeitos da sonda v1 corrigidos na v2
- Rótulo inexistente no teste de `launchctl print`.
- Contagem de linhas mostrava 0 para saídas de uma linha.
- Teste de `top` só conferia o cabeçalho, não o formato dos números.
