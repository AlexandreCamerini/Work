# ADR 0005 — D9: onde mora o binário privilegiado

Status: **padrão assumido, decisão aberta** · fecha no fim do M9, com o auditor · 12 nov 2026

## Contexto
`SMAppService.daemon` registra um daemon cujo executável fica dentro do pacote do app (`Contents/Library/LaunchDaemons` e `Contents/MacOS`). A alternativa antiga é copiar o binário para `/Library/PrivilegedHelperTools`. Há conflito de fontes depois das falhas de instaladores com nomes ".localized". Não bloqueia o M1: o contrato XPC não depende de onde o binário mora.

## Opções
| Opção | Ganho | Custo | Onde quebra |
|---|---|---|---|
| A. Dentro do app, `SMAppService` (padrão) | API atual da Apple; atualização do app atualiza o helper; desinstalar é remover o app e o registro (RF-25); aprovação em Itens de Início | Binário root dentro de pasta que o usuário pode gravar quando o app está fora de `/Applications` | App copiado para pasta gravável pelo usuário: troca do binário entre a verificação e a execução, se o sistema não revalidar a assinatura |
| B. Copiado para `/Library/PrivilegedHelperTools` | Pasta só do root | Caminho do `SMJobBless`, descontinuado; atualização e desinstalação viram responsabilidade nossa | Binário velho fica para trás após desinstalação manual; mais código privilegiado |

## Decisão provisória
Opção A. O helper é registrado com `SMAppService.daemon` e mora dentro do app.

Controles exigidos já no M5 para a opção A:
- O app recusa registrar o helper se não estiver em `/Applications`.
- O `handshake` confere a versão do helper (RF-24); a conexão XPC exige requisito de assinatura nos dois sentidos (ADR 0002).

## Pergunta explícita ao auditor (M9)
Com o app em `/Applications`, o binário root dentro do pacote é substituível por um processo do usuário entre a aprovação e a execução, nas versões 15, 26 e 27? Se sim, migrar para a opção B ou exigir instalação por administrador.
