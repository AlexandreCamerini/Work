# M0 — matriz de capacidades (parcial)

Estado: **em andamento**. Coberto: 1 Mac, macOS 27.3 (build 26C5035r), Apple M2, Terminal da Apple, **sem** Acesso Total ao Disco, como usuário e como root. Sonda v3, 12 nov 2026.
Falta: rodada **com** Acesso Total ao Disco efetivo; macOS 26 e 15; Intel.

O sufixo com letra no número de build costuma indicar versão de teste. Se for o caso, repetir na versão final antes de fechar a D8.

## Resultado por fonte de dados (macOS 27.3, sem Acesso Total ao Disco)

| Fonte | Usuário | Root | Leitura |
|---|---|---|---|
| SIP, Gatekeeper, FileVault, firewall | OK | OK | Sem privilégio |
| Arquivos `.plist` de inicialização (3 pastas) | OK (30 arquivos) | OK | Sem privilégio |
| `launchctl print-disabled` | OK | OK | Valores `enabled` / `disabled` |
| `launchctl print` de serviço existente e ausente | OK | OK | Ausente devolve `Could not find service`, código 113 |
| Itens em segundo plano via `sfltool dumpbtm` | Não testado | **OK** (110 registros, todos os campos) | Root basta; não precisa de Acesso Total ao Disco |
| Pasta do arquivo de itens em segundo plano | Negado | Negado | `Operation not permitted`: a pasta existe e é protegida |
| Pastas protegidas (Safari, Mail, Mensagens) | Negado | Negado | Confirma que o Terminal estava sem Acesso Total ao Disco |
| Pasta do banco de permissões do usuário | **Não existe** | **Não existe** | `No such file` no caminho clássico |
| Pasta do banco de permissões do sistema | Negado | Negado | `Operation not permitted` |
| Leitura dos bancos de permissões | FALHA | FALHA | Esperado sem o acesso |
| `tccutil` | Presente | Presente | Nenhuma redefinição executada |
| Spotlight por identificador de app | OK | OK | |
| `codesign` em app | OK | OK | |
| `codesign` em binário do sistema | Formato mudou | Formato mudou | Autoridade agora é `macOS Software Signing` |
| Requisito `anchor apple` | OK | OK | Forma estável de reconhecer binário da Apple |
| Lista de processos com caminho | OK | OK | |
| Conexões de rede (`lsof`) | Só do usuário | 5 usuários | Root dá cobertura total |
| Proxy, certificados confiáveis, MDM | OK | OK | |
| Lista de perfis | Não testado | OK | Requer root |
| `top` (formato numérico) | OK | OK | Ponto decimal nos dois idiomas |
| Swap (`sysctl vm.swapusage`) | FALHA em pt-BR, OK em `en_US` | idem | Decimal com **vírgula** no idioma do usuário |
| Limite térmico (`pmset -g therm`) | Indisponível | Indisponível | Só notas; sem `CPU_Speed_Limit` em Apple Silicon |
| Bateria, SMART, Time Machine, relatórios de falha | OK | OK | |
| `python3`, Xcode, Swift | OK | OK | Mac pronto para compilar |

## Conclusões firmes

1. **Itens em segundo plano: usar `sfltool dumpbtm` no helper.** Funciona como root sem Acesso Total ao Disco. O leitor direto do arquivo sai do plano: a pasta é protegida. Altera a SPEC (seção 8, linha BTM, e premissa 6.3).
2. **Saída de comando depende do idioma.** Swap veio com vírgula decimal. Regra para o app nativo: nenhuma métrica vem de texto de comando; onde um comando for inevitável, idioma fixo. O protótipo 2.2 já fixa o idioma em todo comando.
3. **Reconhecer binário da Apple por requisito de assinatura, não por texto.** O nome da autoridade mudou para `macOS Software Signing`; o requisito `anchor apple` passou. O protótipo 2.3 aceita os dois nomes.
4. **Estado térmico não vem de `pmset` em Apple Silicon.** Usar a API do sistema; a regra `termico` do protótipo não dispara neste Mac.
5. **Root sem Acesso Total ao Disco não lê permissões de privacidade.** Um helper root, sozinho, não resolve.
6. **O Mac serve para o desenvolvimento nativo**: Xcode e Swift respondem.

## Indício novo sobre as permissões de privacidade

A pasta do banco de permissões **do usuário** não existe no caminho clássico (`~/Library/Application Support/com.apple.TCC`), nem para o usuário nem para o root. A do sistema existe e é protegida. Isso é compatível com a mudança anunciada pela Apple no macOS 27, mas não a comprova: falta ver o que acontece com o acesso concedido.

## Decisão D8

**Aberta.** A sonda v3 mostrou que o Terminal estava **sem** Acesso Total ao Disco efetivo (três pastas protegidas negadas), então a falha de leitura ainda não diz nada sobre o macOS 27. Falta uma rodada em que a linha `fda.pastas protegidas` saia OK.

- Se, com o acesso efetivo, o banco do sistema for lido: a auditoria de permissões continua viável no 27, pelo menos para as permissões guardadas no banco do sistema.
- Se continuar falhando: a D8 fecha como "bloqueado no macOS 27" e o cartão de permissões passa a guiar o usuário ao painel de Privacidade.

Padrão para o trabalho não parar (já na SPEC, RF-12): tratar a leitura como recurso de melhor esforço.

## Premissas da SPEC 6.3

| Premissa | Estado |
|---|---|
| Daemon registrado pelo app herda o Acesso Total ao Disco | Não testável no M0 |
| Arquivo de itens em segundo plano legível com Acesso Total ao Disco | Descartada como caminho principal (conclusão 1) |
| Leitura das permissões de privacidade nas três versões | Pendente (D8) |

## Portar, reescrever, descartar

| Coletor do protótipo | Destino | Motivo |
|---|---|---|
| Postura do sistema | Portar | Funciona sem privilégio |
| Itens de inicialização por `.plist` | Portar | Funciona sem privilégio |
| Estado ativo/desativado por `launchctl` | Portar | Formato confirmado |
| Itens em segundo plano | Portar no helper, via `sfltool` | Confirmado como root |
| Leitor do arquivo de itens em segundo plano | Descartar | Pasta protegida |
| Permissões de privacidade | Em espera | D8 |
| Assinatura de código | Reescrever com a API de segurança | Texto do `codesign` mudou entre versões |
| Swap, memória, CPU, térmico | Reescrever com APIs do sistema | Texto sensível a idioma; térmico ausente |
| Conexões de rede | Portar no helper | Root para cobertura total |
| Perfis de configuração | Portar no helper | Requer root |

## Histórico da sonda
- v1: três testes mal feitos (rótulo inexistente no `launchctl print`, contagem de linhas, `top` só pelo cabeçalho).
- v2: corrige os três; compara idiomas; lista campos do `codesign`.
- v3: detecta o Acesso Total ao Disco por pastas protegidas, não pelo banco de permissões; registra o app de terminal.
