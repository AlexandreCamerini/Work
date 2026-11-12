#!/bin/bash
# mac-doctor — atalho de execução. Uso: mac-doctor [demo|analisar|sonda|resultados|desinstalar|ajuda]
# Compatível com o bash 3.2 do macOS. Não altera nada fora de ~/mac-doctor.
DIR="$(cd "$(dirname "$0")" && pwd)"
RES="$DIR/resultados-m0"

precisa_python() {
  if ! command -v python3 >/dev/null 2>&1 || ! python3 --version >/dev/null 2>&1; then
    echo "O python3 não está instalado. Rode:  xcode-select --install"
    echo "Aceite a instalação das Ferramentas de Linha de Comando da Apple e tente de novo."
    exit 1
  fi
}

demo()     { precisa_python; echo "Abrindo a interface com dados FICTÍCIOS (nada é lido nem alterado). Ctrl+C para sair."; python3 "$DIR/app/mac-doctor.py" --demo; }
analisar() { precisa_python; echo "Análise real: o macOS vai pedir a senha de administrador. Ctrl+C para sair."; python3 "$DIR/app/mac-doctor.py"; }

rodada_sonda() {
  mkdir -p "$RES" && cd "$RES" || exit 1
  echo; echo "── Sonda sem privilégio ──"; bash "$DIR/app/m0-sonda.sh"
  echo; echo "── Sonda como administrador (vai pedir sua senha) ──"; sudo bash "$DIR/app/m0-sonda.sh"
}

sonda() {
  echo "M0: testa, em modo SOMENTE LEITURA, quais fontes de dados funcionam neste macOS."
  rodada_sonda
  if ls "$RES"/*-com-fda.md >/dev/null 2>&1 && ls "$RES"/*-sem-fda.md >/dev/null 2>&1; then
    echo; echo "As duas condições (com e sem Acesso Total ao Disco) já foram cobertas."
  elif ls "$RES"/*-sem-fda.md >/dev/null 2>&1; then
    cat <<MSG

Falta a rodada COM Acesso Total ao Disco:
  1. Abra Ajustes > Privacidade e Segurança > Acesso Total ao Disco e ligue o Terminal.
  2. Feche o Terminal por completo (Cmd+Q) e abra de novo.
  3. Rode outra vez:  ~/mac-doctor/mac-doctor sonda
MSG
  else
    cat <<MSG

Esta rodada foi COM Acesso Total ao Disco. Para a matriz completa, falta a rodada SEM:
  1. Em Ajustes > Privacidade e Segurança > Acesso Total ao Disco, desligue o Terminal.
  2. Feche o Terminal (Cmd+Q), abra de novo e rode:  ~/mac-doctor/mac-doctor sonda
MSG
  fi
  resultados
}

resultados() {
  ls "$RES"/m0-resultado-*.md >/dev/null 2>&1 || { echo "Ainda não há resultados. Rode:  ~/mac-doctor/mac-doctor sonda"; return; }
  JUNTO="$RES/m0-todos.md"; : > "$JUNTO"
  for f in "$RES"/m0-resultado-*.md; do cat "$f" >> "$JUNTO"; printf '\n\n---\n\n' >> "$JUNTO"; done
  echo; echo "Resultados reunidos em: $JUNTO"
  if command -v pbcopy >/dev/null 2>&1; then pbcopy < "$JUNTO" && echo "O conteúdo já está na área de transferência: é só colar (Cmd+V) na conversa."; fi
}

desinstalar() {
  printf 'Remover a pasta %s e tudo dentro dela? Digite SIM para confirmar: ' "$DIR"; read -r r
  [ "$r" = "SIM" ] || { echo "Nada foi removido."; return; }
  cd / && rm -rf "$DIR" && echo "Removido."
  [ -d "/Library/Application Support/mac-doctor" ] && echo "Obs.: a quarentena e o histórico de ações em '/Library/Application Support/mac-doctor' foram mantidos de propósito."
}

ajuda() {
  cat <<MSG
mac-doctor — instalado em $DIR

  ~/mac-doctor/mac-doctor              menu
  ~/mac-doctor/mac-doctor demo         interface com dados fictícios
  ~/mac-doctor/mac-doctor analisar     análise real deste Mac (pede senha de administrador)
  ~/mac-doctor/mac-doctor sonda        teste de compatibilidade (M0), somente leitura
  ~/mac-doctor/mac-doctor resultados   junta os resultados da sonda e copia para colar
  ~/mac-doctor/mac-doctor desinstalar  remove a pasta ~/mac-doctor
MSG
}

menu() {
  echo "mac-doctor"; echo "  1) Ver a demonstração (dados fictícios)"; echo "  2) Analisar este Mac"
  echo "  3) Teste de compatibilidade (M0)"; echo "  4) Juntar e copiar os resultados do teste"; echo "  5) Desinstalar"; echo "  0) Sair"
  printf 'Escolha: '; read -r o
  case "$o" in 1) demo ;; 2) analisar ;; 3) sonda ;; 4) resultados ;; 5) desinstalar ;; *) : ;; esac
}

case "${1:-menu}" in
  demo) demo ;; analisar) analisar ;; sonda) sonda ;; resultados) resultados ;; desinstalar) desinstalar ;;
  ajuda|-h|--help) ajuda ;; menu) menu ;; *) ajuda; exit 1 ;;
esac
