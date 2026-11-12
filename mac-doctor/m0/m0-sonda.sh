#!/bin/bash
# m0-sonda.sh — M0 do mac-doctor: testa, em modo SOMENTE LEITURA, quais fontes de dados funcionam neste macOS.
# Não altera nada, não usa rede e não grava dados pessoais: o resultado traz só OK/FALHA, códigos de retorno,
# contagens e a classe do erro. Rode quatro vezes para cobrir a matriz (veja m0/README.md):
#   bash m0-sonda.sh          e   sudo bash m0-sonda.sh        (sem Acesso Total ao Disco no Terminal)
#   bash m0-sonda.sh          e   sudo bash m0-sonda.sh        (com Acesso Total ao Disco no Terminal)
# Compatível com o bash 3.2 do macOS.

[ "$(uname -s)" = "Darwin" ] || { echo "Este script é só para macOS."; exit 1; }

REAL_USER="${SUDO_USER:-$USER}"
REAL_UID="$(id -u "$REAL_USER")"
REAL_HOME="$(dscl . -read "/Users/$REAL_USER" NFSHomeDirectory 2>/dev/null | awk '{print $2}')"
[ -d "$REAL_HOME" ] || REAL_HOME="$HOME"
NIVEL="usuario"; [ "$(id -u)" -eq 0 ] && NIVEL="root"
VER="$(sw_vers -productVersion)"; ARQ="$(uname -m)"
TCC_USER="$REAL_HOME/Library/Application Support/com.apple.TCC/TCC.db"
TCC_SYS="/Library/Application Support/com.apple.TCC/TCC.db"

# limite de tempo sem depender de 'timeout' (não existe no macOS)
T() { local s="$1"; shift; if command -v perl >/dev/null 2>&1; then perl -e 'alarm shift; exec @ARGV' "$s" "$@"; else "$@"; fi; }

# Acesso Total ao Disco do processo responsável: ler o TCC.db do usuário só funciona com ele
if sqlite3 -readonly "$TCC_USER" "select count(*) from access" >/dev/null 2>&1; then FDA="com-fda"; else FDA="sem-fda"; fi

OUT="m0-resultado-macos${VER}-${ARQ}-${NIVEL}-${FDA}.md"
{
  echo "# M0 — macOS $VER ($ARQ) · nível: $NIVEL · Acesso Total ao Disco: $FDA"
  echo
  echo "Gerado em $(date '+%Y-%m-%d %H:%M') · build $(sw_vers -buildVersion) · chip: $(sysctl -n machdep.cpu.brand_string 2>/dev/null)"
  echo
  echo "| Sonda | Resultado | Detalhe |"
  echo "|---|---|---|"
} > "$OUT"

linha() { printf '| %s | %s | %s |\n' "$1" "$2" "$3" >> "$OUT"; printf '%-34s %-6s %s\n' "$1" "$2" "$3"; }
classe_erro() { printf '%s' "$1" | grep -Eio 'authorization denied|operation not permitted|permission denied|not privileged|must be run as root|requires root|command not found|no such file|unable to open database|not authorized|timed out|alarm clock' | head -1; }

# sonda ID "regex que indica saída utilizável" comando...
sonda() {
  local id="$1" re="$2"; shift 2
  local out rc st det err
  out="$(T 45 "$@" 2>&1)"; rc=$?
  if printf '%s' "$out" | grep -Eq "$re"; then st="OK"; else st="FALHA"; fi
  det="rc=$rc, $(printf '%s' "$out" | wc -l | tr -d ' ') linhas"
  err="$(classe_erro "$out")"; [ -n "$err" ] && det="$det, erro: $err"
  linha "$id" "$st" "$det"
}

echo "Sondando macOS $VER ($ARQ) como $NIVEL, $FDA ..."

# --- postura
sonda "postura.sip"            'status: (enabled|disabled)'        csrutil status
sonda "postura.gatekeeper"     'assessments (enabled|disabled)'    spctl --status
sonda "postura.filevault"      'FileVault is (On|Off)'             fdesetup status
sonda "postura.firewall"       '(enabled|disabled)'                /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# --- inicialização automática
for d in "$REAL_HOME/Library/LaunchAgents" /Library/LaunchAgents /Library/LaunchDaemons; do
  n=0; ok=0
  for p in "$d"/*.plist; do [ -f "$p" ] || continue; n=$((n+1)); plutil -lint "$p" >/dev/null 2>&1 && ok=$((ok+1)); done
  nome="$(echo "$d" | sed "s|$REAL_HOME|~|")"
  linha "launchd.plists $nome" "$([ "$n" -eq "$ok" ] && echo OK || echo FALHA)" "$n arquivos, $ok legíveis"
done
out="$(launchctl print-disabled "gui/$REAL_UID" 2>&1)"
fmt="$(printf '%s' "$out" | grep -Eo '=> (disabled|enabled|true|false)' | awk '{print $2}' | sort -u | tr '\n' ' ')"
linha "launchd.print-disabled gui"    "$([ -n "$fmt" ] && echo OK || echo FALHA)" "valores vistos: ${fmt:-nenhum} $(classe_erro "$out")"
out="$(launchctl print-disabled system 2>&1)"
fmt="$(printf '%s' "$out" | grep -Eo '=> (disabled|enabled|true|false)' | awk '{print $2}' | sort -u | tr '\n' ' ')"
linha "launchd.print-disabled system" "$([ -n "$fmt" ] && echo OK || echo FALHA)" "valores vistos: ${fmt:-nenhum} $(classe_erro "$out")"
sonda "launchd.print system/servico" 'state = |program = '          launchctl print system/com.apple.cfprefsd.daemon

# --- itens em segundo plano (BTM)
if [ "$NIVEL" = "root" ]; then
  out="$(T 45 sfltool dumpbtm 2>&1)"; rc=$?
  reg="$(printf '%s' "$out" | grep -Ec '^[[:space:]]*#[0-9]+:[[:space:]]*$')"
  campos=""; for c in "Name:" "Developer Name:" "Type:" "Disposition:" "URL:" "Executable Path:" "Records for UID"; do
    printf '%s' "$out" | grep -q "$c" && campos="$campos [$c]"; done
  linha "btm.sfltool dumpbtm" "$([ "$reg" -gt 0 ] && echo OK || echo FALHA)" "rc=$rc, $reg registros, campos:$campos $(classe_erro "$out")"
else
  linha "btm.sfltool dumpbtm" "N/A" "só testado como root (sem sudo pode abrir diálogo de senha)"
fi
btm="$(ls /private/var/db/com.apple.backgroundtaskmanagement/BackgroundItems-v*.btm 2>&1 | head -1)"
if [ -f "$btm" ]; then
  linha "btm.arquivo" "$(head -c 8 "$btm" >/dev/null 2>&1 && echo OK || echo FALHA)" "$(basename "$btm"), cabeçalho: $(head -c 8 "$btm" 2>/dev/null | tr -cd '[:print:]')"
else
  linha "btm.arquivo" "FALHA" "não listado: $(classe_erro "$btm")"
fi

# --- permissões de privacidade (TCC)
for par in "usuario:$TCC_USER" "sistema:$TCC_SYS"; do
  rot="${par%%:*}"; db="${par#*:}"
  out="$(sqlite3 -readonly "$db" "select count(*) from access" 2>&1)"; rc=$?
  cols="$(sqlite3 -readonly "$db" "select group_concat(name) from pragma_table_info('access')" 2>/dev/null)"
  if [ "$rc" -eq 0 ]; then linha "tcc.leitura $rot" "OK" "$out linhas; colunas: $cols"
  else linha "tcc.leitura $rot" "FALHA" "rc=$rc, erro: $(classe_erro "$out")"; fi
done
sonda "tcc.tccutil existe"     'reset|Usage|usage'                 tccutil
sonda "spotlight.mdfind bundle" 'Safari'                           mdfind "kMDItemCFBundleIdentifier == 'com.apple.Safari'"

# --- assinatura de código
sonda "codesign.binario Apple" 'Authority=Software Signing'        codesign -dv --verbose=2 /bin/ls
sonda "codesign.app"           'Authority=|TeamIdentifier='        codesign -dv --verbose=2 /System/Applications/Calculator.app

# --- processos e rede
sonda "proc.ps caminhos"       '^ *[0-9]+ +[^ ]+ +/'               ps -axo pid=,user=,comm=
out="$(lsof -i -P -n 2>&1)"
linha "rede.lsof" "$([ "$(printf '%s' "$out" | grep -c 'LISTEN\|ESTABLISHED')" -gt 0 ] && echo OK || echo FALHA)" \
  "$(printf '%s' "$out" | awk 'NR>1{print $3}' | sort -u | wc -l | tr -d ' ') usuários distintos visíveis, $(printf '%s' "$out" | grep -c LISTEN) em escuta"
sonda "rede.scutil proxy"      'ExceptionsList|HTTPEnable|<dictionary>' scutil --proxy
sonda "rede.trust-settings"    'Cert |No Trust Settings|Number of trusted' security dump-trust-settings
sonda "perfis.status"          'MDM enrollment'                    profiles status -type enrollment
if [ "$NIVEL" = "root" ]; then sonda "perfis.list" 'profileIdentifier|no configuration profiles|There are no' profiles list
else linha "perfis.list" "N/A" "requer root"; fi
sonda "cron.usuario"           'no crontab|^[^#]'                  crontab -l

# --- desempenho
sonda "perf.top cpu"           '%CPU'                              top -l 2 -s 1 -n 5 -o cpu -stats cpu,mem,pid,command
sonda "perf.memory_pressure"   'free percentage: [0-9]+%'          memory_pressure
sonda "perf.swap"              'used = [0-9.]+[MG]'                sysctl -n vm.swapusage
sonda "perf.boottime"          'sec = [0-9]+'                      sysctl -n kern.boottime
sonda "perf.termico"           'CPU_Speed_Limit'                   pmset -g therm
sonda "perf.pouca energia"     'lowpowermode|powermode'            pmset -g
sonda "perf.bateria"           'Condition:|Cycle Count'            system_profiler SPPowerDataType
sonda "perf.smart"             'SMART Status'                      diskutil info /
sonda "perf.time machine"      'Running ='                         tmutil status
n="$(ls /Library/Logs/DiagnosticReports 2>/dev/null | wc -l | tr -d ' ')"
linha "perf.relatorios de falha" "$([ -d /Library/Logs/DiagnosticReports ] && echo OK || echo FALHA)" "$n arquivos visíveis"

# --- ambiente
sonda "amb.python3"            'Python 3'                          python3 --version
sonda "amb.xcode-select"       '/'                                 xcode-select -p
sonda "amb.swift"              'Swift version'                     swift --version

{
  echo
  echo "## Teste manual (não automatizado)"
  echo
  echo "Marque o que abriu o painel certo dos Ajustes neste macOS:"
  for u in \
    "x-apple.systempreferences:com.apple.preference.security?FileVault" \
    "x-apple.systempreferences:com.apple.preference.security?Privacy" \
    "x-apple.systempreferences:com.apple.Sharing-Settings.extension" \
    "x-apple.systempreferences:com.apple.Network-Settings.extension" \
    "x-apple.systempreferences:com.apple.Profiles-Settings.extension" \
    "x-apple.systempreferences:com.apple.LoginItems-Settings.extension" \
    "x-apple.systempreferences:com.apple.settings.Storage" \
    "x-apple.systempreferences:com.apple.Battery-Settings.extension"; do
    echo "- [ ] \`open \"$u\"\`"
  done
} >> "$OUT"

[ "$NIVEL" = "root" ] && chown "$REAL_UID" "$OUT" 2>/dev/null
echo
echo "Resultado salvo em: $OUT"
echo "FALHAS: $(grep -c '| FALHA |' "$OUT")  ·  OK: $(grep -c '| OK |' "$OUT")"
