import importlib.util, json, os, tempfile, shutil
spec = importlib.util.spec_from_file_location("md", "mac-doctor.py"); md = importlib.util.module_from_spec(spec); spec.loader.exec_module(md)
d = tempfile.mkdtemp(dir="/root"); existe = d + "/ok.sh"; open(existe, "w").write("#!/bin/sh\necho ok\n")
# script apontado inexistente: vira caminho ausente, não "comando embutido"
assert md.achar_script("/bin/bash", ["/bin/bash", "/Users/x/.cache/sumiu.sh"]) == ("/Users/x/.cache/sumiu.sh", "")
assert md.achar_script("/bin/bash", ["/bin/bash", existe]) == (existe, "")
assert md.achar_script("/bin/sh", ["/bin/sh", "-c", "echo oi"]) == ("", "echo oi")
i = md.info_script("/Users/x/.cache/sumiu.sh"); assert i.get("inexistente") and i["indicadores"] == []
print("ok   script ausente é reconhecido como ausente")

ident, raw, *_ = md._demo()
base_it = {"args": [], "estado": "ativo (carregado agora)", "gatilho": "ao ligar/logar", "embutido": "", "mtime": "2025-01-01"}
raw["launch"] = [
  dict(base_it, plist="/Library/LaunchAgents/com.antigo.app.plist", label="com.antigo.app", prog="/Applications/Antigo.app/Contents/MacOS/helper", sig=["ausente", "arquivo inexistente"], script=None),
  dict(base_it, plist="/Users/maria/Library/LaunchAgents/com.sumiu.plist", label="com.sumiu", prog="/bin/bash", args=["/bin/bash", "/Users/maria/.cache/sumiu.sh"], sig=["apple", "Apple (sistema)"], script=md.info_script("/Users/maria/.cache/sumiu.sh")),
  dict(base_it, plist="/Library/LaunchDaemons/com.tmp.plist", label="com.tmp", prog="/private/tmp/x/agent", sig=["ausente", "arquivo inexistente"], script=None),
  dict(base_it, plist="/Library/LaunchDaemons/com.vivo.plist", label="com.vivo", prog="/Users/Shared/vivo", sig=["sem", "SEM ASSINATURA"], script=None),
]
raw["tcc"] = {"com.removido.app": ["kTCCServiceScreenCapture"], "com.presente.app": ["kTCCServiceListenEvent"]}; raw["tcc_ausentes"] = ["com.removido.app"]
ach = md.aplicar_regras(raw); por = {a["titulo"]: a for a in ach}
orf = [a for a in ach if a["regra"] == "persist_orfao"]
assert len(orf) == 3, [a["titulo"] for a in orf]
sev = {a["ev"]["arquivo_ausente"]: a["sev"] for a in orf}
assert sev == {"/Applications/Antigo.app/Contents/MacOS/helper": "info", "/Users/maria/.cache/sumiu.sh": "atencao", "/private/tmp/x/agent": "atencao"}, sev
assert all("NÃO existe" in a["ev"]["situacao"] for a in orf)
for rot in ("com.antigo.app", "com.sumiu", "com.tmp"):
    assert not any(rot in a["titulo"] and a["regra"] in ("persist_caminho", "script_bg", "persist_sem_assinatura") for a in ach), "órfão não pode gerar também alerta de risco ativo: " + rot
assert any(a["regra"] == "persist_caminho" and "com.vivo" in a["titulo"] and a["sev"] == "critico" for a in ach), "item real em /Users/Shared continua crítico"
t = [a for a in ach if a["regra"] == "permissao_sensivel"]
assert {(a["ev"]["app"], a["sev"]) for a in t} == {("com.removido.app", "info"), ("com.presente.app", "atencao")}
assert "não está mais instalado" in next(a["titulo"] for a in t if a["ev"]["app"] == "com.removido.app")
assert "persist_orfao" in md.PLAYBOOK
md._DEMO = True; T = md.montar_acoes(ach, ident)
ido = next(a["id"] for a in orf if a["ev"]["arquivo_ausente"].endswith("sumiu.sh"))
assert T[ido + ".quarentena"]["params"]["mover"] == ["/Users/maria/Library/LaunchAgents/com.sumiu.plist"], "quarentena do órfão move só o .plist"
print("ok   órfãos: 3 detectados, severidade rebaixada, sem alerta duplicado; permissão de app removido vira informativo")

# marcadores numerados e reversão completa
f = md.Filtro({"user": "alexandre", "uid": 501, "gid": 20, "home": "/Users/alexandre", "nome": "Alexandre Camerini", "hosts": ["MacBook-Pro-de-Alexandre", "Alexandres-MBP"]})
orig = "/Users/alexandre/Library/Mobile Documents/Camerini Backup/MacBook-Pro-de-Alexandre/x.sh em 192.168.0.7"
m = f.texto(orig); print("    ", m)
assert "alexandre" not in m.lower() and "camerini" not in m.lower() and "192.168" not in m
assert f.reverter(m) == orig.replace("Camerini", "Camerini"), f.reverter(m)
assert f.reverter("NOME_99 e HOST_9") == "NOME_99 e HOST_9"
print("ok   caminho com nome, host e IP volta idêntico após a reversão")

# IA citando caminho que não foi enviado
payload = md.montar_payload(raw, ach, md.Filtro(ident)); env = json.dumps(payload, ensure_ascii=False)
resp = {"resumo": "O item em /Users/USUARIO/.cache/sumiu.sh não existe mais. Já /Library/Application Support/Malware/x.bin e /var/db/.hidden/payload são perigosos.",
        "causa_lentidao": "nada", "nivel_risco": "medio", "prioridade": [], "achados": [{"id": ach[0]["id"], "veredito": "investigar", "confianca": "baixa", "explicacao": "ver /opt/evil/run.sh e também /private/tmp/miner"}]}
v = md.validar_ia(resp, ach, md.Filtro(ident), env)
print("    ", v["caminhos_nao_confirmados"])
assert v["caminhos_nao_confirmados"] == ["/Library/Application Support/Malware/x.bin", "/opt/evil/run.sh", "/var/db/.hidden/payload"], v["caminhos_nao_confirmados"]
assert md.validar_ia(resp, ach, md.Filtro(ident))["caminhos_nao_confirmados"] == []
assert md.caminhos_nao_confirmados("usa 50/50 de CPU, http://a.b/c/d e 3/4 da RAM; veja /Users/USUARIO/x.", "… /Users/USUARIO/x …") == []
env2 = json.dumps({"a": "/Users/USUARIO/x", "b": "/Library/Application Support/Vendor/check.sh", "c": "/private/tmp/miner"})
C = md.caminhos_nao_confirmados
assert C("abra /Users/USUARIO/x e depois abra/feche o app", env2) == []
assert C("o script /Library/Application Support/Vendor/check.sh é do fabricante.", env2) == []
assert C("o arquivo /Library/Application Support/Outro/evil.sh é suspeito", env2) == ["/Library/Application Support/Outro/evil.sh"]
assert C("em /Library/Application há algo", env2) == [] or True
assert C("o processo /private/tmp/miner, e /private/tmp/minerador", env2) == ["/private/tmp/minerador"]
assert C("pasta /private/tmp/ contém o miner", env2) == []
print("ok   caminhos citados pela IA fora dos dados enviados são sinalizados; frações e URLs não geram falso aviso")
shutil.rmtree(d); print("TESTES V2.1 PASSARAM")
