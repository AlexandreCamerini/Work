#!/bin/bash
# Leva o mac-doctor para um repositório próprio, com main e um PR por marco.
#
# O que faz:
#   1. Cria o repositório privado AlexandreCamerini/mac-doctor (com gh) ou espera você criar.
#   2. Copia só a pasta mac-doctor/ do repositório Work, com o histórico.
#   3. main = estado aprovado até o M0 + plano comercial e pesquisa em docs/plano/.
#   4. Branch m1-contratos = commit do M1, pronto para virar PR.
#   5. Clona o repositório novo em ~/Projetos/mac-doctor.
#
# O que NÃO faz: não apaga nem altera o repositório Work, nem ~/mac-doctor-repo,
# nem ~/mac-doctor (onde está o protótipo instalado). Recusa sobrescrever repositório não vazio.
#
# Uso: bash regularizar-repo.sh

set -euo pipefail
export GIT_TERMINAL_PROMPT=0

DONO="${DONO:-AlexandreCamerini}"
NOVO="${NOVO:-mac-doctor}"
ORIGEM="${ORIGEM:-https://github.com/AlexandreCamerini/Work.git}"
URL_NOVO="${URL_NOVO:-https://github.com/$DONO/$NOVO.git}"
DESTINO="${DESTINO:-$HOME/Projetos/mac-doctor}"
BRANCH_ORIGEM="claude/vigilant-ride-enw48v"
COMMIT_M0="288ad84"
COMMIT_M1="43609b3"
SEM_GH="${SEM_GH:-0}"

ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
info() { printf '\n\033[1m%s\033[0m\n' "$1"; }
erro() { printf '\n\033[31mERRO:\033[0m %s\n' "$1" >&2; exit 1; }

tem_gh() { [ "$SEM_GH" != 1 ] && command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; }

info "1/6 Verificações"
[ "$(id -u)" -ne 0 ] || [ "${PERMITIR_ROOT:-0}" = 1 ] || erro "não rode com sudo."
command -v git >/dev/null || erro "git não encontrado."
[ ! -e "$DESTINO" ] || erro "$DESTINO já existe. Mova ou renomeie e rode de novo (nada foi feito)."
if tem_gh; then ok "gh autenticado"; else ok "gh ausente ou não autenticado: criação manual do repositório"; fi

info "2/6 Repositório $DONO/$NOVO"
if refs=$(git ls-remote "$URL_NOVO" 2>/dev/null); then
  [ -z "$refs" ] || erro "$URL_NOVO já tem conteúdo. Não sobrescrevo. Nada foi feito."
  ok "já existe e está vazio"
elif tem_gh; then
  gh repo create "$DONO/$NOVO" --private --description "Diagnóstico de segurança e desempenho para macOS" >/dev/null
  ok "criado (privado)"
else
  echo "  Crie agora, no navegador: https://github.com/new"
  echo "  Nome: $NOVO | Privado | SEM README, SEM .gitignore, SEM licença"
  read -r -p "  Aperte Enter quando tiver criado... " _
  git ls-remote "$URL_NOVO" >/dev/null 2>&1 || erro "não consegui acessar $URL_NOVO. Confira o nome e o login do git."
  [ -z "$(git ls-remote "$URL_NOVO")" ] || erro "o repositório não está vazio."
  ok "acessível e vazio"
fi

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

info "3/6 Copiando o histórico do mac-doctor"
git clone --quiet --single-branch --branch "$BRANCH_ORIGEM" "$ORIGEM" "$TMP/w"
cd "$TMP/w"
git cat-file -e "$COMMIT_M0^{commit}" 2>/dev/null || erro "commit $COMMIT_M0 não encontrado."
git cat-file -e "$COMMIT_M1^{commit}" 2>/dev/null || erro "commit $COMMIT_M1 não encontrado."
mkdir -p "$TMP/plano/pesquisa"
git show "$COMMIT_M0:reports/Plano comercial do mac doctor.md" > "$TMP/plano/plano-comercial.md"
for f in mercado_concorrentes requisitos_apple stack_nativa_pagamentos arquitetura_ia_privacidade riscos_juridicos_confianca; do
  git show "$COMMIT_M0:research_notes/Plano comercial do mac doctor/$f.md" > "$TMP/plano/pesquisa/$f.md"
done
git branch -q tmp-main "$COMMIT_M0"
git branch -q tmp-m1 "$COMMIT_M1"
FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch -f --prune-empty --subdirectory-filter mac-doctor -- tmp-main tmp-m1 >/dev/null 2>&1
ok "$(git rev-list --count tmp-main) commits no main, $(git rev-list --count tmp-main..tmp-m1) no M1"

info "4/6 Montando main e m1-contratos"
git checkout -q tmp-main
mkdir -p docs/plano
cp -R "$TMP/plano/." docs/plano/
git add docs/plano
git -c user.name="$(git log -1 --format=%an)" -c user.email="$(git log -1 --format=%ae)" \
  commit -q -m "Traz plano comercial e pesquisa para docs/plano" \
  -m "Origem: reports/ e research_notes/ do repositório Work, commit $COMMIT_M0."
git rebase -q tmp-main tmp-m1
ok "main: $(git log -1 --format='%h %s' tmp-main)"
ok "m1-contratos: $(git log -1 --format='%h %s' tmp-m1)"

info "5/6 Enviando"
git push -q "$URL_NOVO" tmp-main:refs/heads/main
git push -q "$URL_NOVO" tmp-m1:refs/heads/m1-contratos
ok "main e m1-contratos enviados"

info "6/6 Clonando em $DESTINO"
mkdir -p "$(dirname "$DESTINO")"
git clone --quiet --branch main "$URL_NOVO" "$DESTINO"
ok "pronto"

if tem_gh; then
  gh pr create --repo "$DONO/$NOVO" --base main --head m1-contratos --draft \
    --title "M1 — decisões e contratos" \
    --body "ADRs F8–F11 e D9; pacotes MDModel e MDHelperProtocol. Revisão pendente pelo Claude." >/dev/null \
    && ok "PR do M1 aberto (rascunho)"
fi

cat <<FIM

Concluído. Nada no repositório Work nem em ~/mac-doctor-repo foi alterado.

Próximos passos:
  1. Volte ao Claude e responda: "regularizado".
  2. Para as sessões do Claude rodarem no seu Mac, a partir de agora use esta pasta:
       cd "$DESTINO" && claude remote-control
FIM
