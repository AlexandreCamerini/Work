#!/bin/bash
# Instalador do mac-doctor __VERSAO__ — arquivo único. Uso:  bash mac-doctor-instalar.sh
# Faz só isto: confere a integridade do pacote embutido e o extrai em ~/mac-doctor.
# Não pede senha, não usa rede, não altera o sistema nem os arquivos de configuração do shell.
set -u
[ "$(id -u)" -eq 0 ] && { echo "Rode SEM sudo: a instalação é na sua pasta pessoal."; exit 1; }
DEST="$HOME/mac-doctor"; SOMA_ESPERADA="__SOMA__"
TMP="$(mktemp -d)" || exit 1; trap 'rm -rf "$TMP"' EXIT
LINHA="$(awk '/^__PACOTE__$/ {print NR + 1; exit}' "$0")"
tail -n +"$LINHA" "$0" | base64 --decode > "$TMP/pacote.tgz" 2>/dev/null || tail -n +"$LINHA" "$0" | base64 -D > "$TMP/pacote.tgz"
SOMA="$( (shasum -a 256 "$TMP/pacote.tgz" 2>/dev/null || sha256sum "$TMP/pacote.tgz") | awk '{print $1}')"
if [ "$SOMA" != "$SOMA_ESPERADA" ]; then echo "O arquivo está corrompido ou incompleto (soma não confere). Baixe de novo."; exit 1; fi
if [ -d "$DEST" ]; then
  echo "Atualizando a instalação em $DEST (os resultados de testes anteriores são mantidos)."
  rm -rf "$DEST/app" "$DEST/mac-doctor" "$DEST/VERSAO"
fi
mkdir -p "$DEST" && tar -xzf "$TMP/pacote.tgz" -C "$TMP" && cp -R "$TMP/mac-doctor/." "$DEST/" || { echo "Falha ao extrair."; exit 1; }
chmod 755 "$DEST/mac-doctor"
echo "mac-doctor $(cat "$DEST/VERSAO") instalado em $DEST"
echo
"$DEST/mac-doctor" ajuda
if ! command -v python3 >/dev/null 2>&1; then echo; echo "Atenção: python3 não encontrado. Rode  xcode-select --install  antes de usar."; fi
exit 0
__PACOTE__
