# M0 — prova em Mac real

Objetivo: saber, com evidência, quais fontes de dados do protótipo funcionam em cada versão do macOS, com e sem privilégio e com e sem Acesso Total ao Disco. Fecha a decisão D8 da `docs/SPEC.md` e valida as premissas da seção 6.3.

Nada aqui altera o sistema. A sonda é somente leitura e o resultado não contém nomes de usuário, caminhos pessoais nem conteúdo de arquivos.

## Caminho A — pelo Claude Code no próprio Mac (recomendado)

No Mac, dentro da pasta do repositório, na branch `claude/vigilant-ride-enw48v`:

```bash
claude
```

e cole este pedido:

```
Leia mac-doctor/CLAUDE.md, mac-doctor/docs/SPEC.md (seções 2, 6.3 e M0) e mac-doctor/m0/README.md.
Execute o M0:
1. Rode `bash mac-doctor/m0/m0-sonda.sh` e depois `sudo bash mac-doctor/m0/m0-sonda.sh` a partir de mac-doctor/m0/.
2. Me peça para conceder Acesso Total ao Disco ao terminal e repita as duas execuções.
3. Rode `python3 mac-doctor/prototype/mac-doctor.py --cli --offline --sem-abrir` com sudo e registre cada erro ou
   coletor que voltou vazio. Não cole no relatório nada que identifique a máquina.
4. Consolide em mac-doctor/docs/M0-matriz.md: uma tabela sonda x condição (usuário/root, com/sem Acesso Total ao
   Disco), a resposta à D8 com a evidência, o estado de cada premissa da SPEC 6.3 e a lista
   portar / reescrever / descartar por coletor do protótipo.
5. Não corrija o protótipo nem comece o app nativo. Faça commit só dos arquivos de resultado e da matriz.
Pare e me pergunte se algum comando pedir algo além de leitura.
```

## Caminho B — à mão

```bash
cd mac-doctor/m0
bash m0-sonda.sh
sudo bash m0-sonda.sh
```

Depois conceda Acesso Total ao Disco ao Terminal (Ajustes > Privacidade e Segurança > Acesso Total ao Disco), feche e reabra o Terminal, e rode os dois comandos de novo. São quatro arquivos `m0-resultado-*.md` por Mac.

Em seguida rode o protótipo:

```bash
python3 ../prototype/mac-doctor.py --demo      # confere que a interface abre
python3 ../prototype/mac-doctor.py             # uso real
```

Faça commit dos quatro arquivos de resultado, ou cole o conteúdo deles na conversa.

## Caminho C — deixar a sessão de nuvem executar

No Mac, na pasta do repositório:

```bash
claude remote-control
```

Com isso a pasta aparece para a sessão de nuvem, que pode pedir acesso e rodar os passos do caminho A. A sessão só enxerga a pasta enquanto esse comando estiver em execução.

## Matriz a cobrir

| Versão | Arquitetura | Disponível hoje |
|---|---|---|
| macOS 27 | Apple Silicon | a confirmar |
| macOS 26 | Apple Silicon ou Intel | a confirmar |
| macOS 15 | Apple Silicon ou Intel | a confirmar (pode ser máquina virtual) |

Um Mac só já responde a maior parte. As outras versões podem vir de máquina virtual ou de um segundo Mac; registre na matriz o que não foi coberto.

## O que o M0 não cobre

- Herança do Acesso Total ao Disco por um daemon registrado pelo app (SPEC 6.3): só dá para testar com um app assinado, no M5. A sonda mede o equivalente mais próximo, que é a leitura como root a partir do Terminal.
- Os endereços dos painéis dos Ajustes: a sonda só lista os comandos para você abrir e marcar.
- Qualquer ação de correção: nenhuma é executada no M0.

## Critério de aceite

- Quatro resultados por Mac testado, no repositório.
- `docs/M0-matriz.md` com a resposta à D8 e a lista portar / reescrever / descartar.
- Lista dos erros do protótipo em uso real.
