#!/bin/bash
# Gera dist/mac-doctor-instalar.sh: instalador de arquivo único (script + pacote embutido em base64).
set -eu
AQUI="$(cd "$(dirname "$0")" && pwd)"; RAIZ="$(dirname "$AQUI")"; TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
mkdir -p "$TMP/mac-doctor/app" "$RAIZ/dist"
cp "$RAIZ/prototype/mac-doctor.py" "$RAIZ/m0/m0-sonda.sh" "$TMP/mac-doctor/app/"
cp "$AQUI/mac-doctor-launcher.sh" "$TMP/mac-doctor/mac-doctor"
chmod 755 "$TMP/mac-doctor/mac-doctor" "$TMP/mac-doctor/app/m0-sonda.sh"
VERSAO="$(sed -n 's/^VERSION = "\(.*\)"/\1/p' "$RAIZ/prototype/mac-doctor.py")"
echo "$VERSAO" > "$TMP/mac-doctor/VERSAO"
tar -C "$TMP" -czf "$TMP/pacote.tgz" mac-doctor
SOMA="$( (shasum -a 256 "$TMP/pacote.tgz" 2>/dev/null || sha256sum "$TMP/pacote.tgz") | awk '{print $1}')"
SAIDA="$RAIZ/dist/mac-doctor-instalar.sh"
sed -e "s/__VERSAO__/$VERSAO/" -e "s/__SOMA__/$SOMA/" "$AQUI/instalador-cabecalho.sh" > "$SAIDA"
base64 < "$TMP/pacote.tgz" >> "$SAIDA"
chmod 755 "$SAIDA"
echo "gerado: $SAIDA ($(wc -c < "$SAIDA" | tr -d ' ') bytes, mac-doctor $VERSAO, sha256 do pacote $SOMA)"
