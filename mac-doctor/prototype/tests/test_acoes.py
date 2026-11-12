import importlib.util, json, os, shutil, socket, subprocess, sys, tempfile, threading, time
spec = importlib.util.spec_from_file_location("md", "mac-doctor.py"); md = importlib.util.module_from_spec(spec); spec.loader.exec_module(md)
raiz = tempfile.mkdtemp(dir="/root"); home = raiz + "/Users/maria"; la = home + "/Library/LaunchAgents"
os.makedirs(la); os.makedirs(home + "/.cache"); md.BASE_ROOT = raiz + "/base"
plist, script = la + "/com.x.upd.plist", home + "/.cache/upd.sh"
open(plist, "w").write("<plist/>"); open(script, "w").write("#!/bin/sh\necho x\n")
ident = {"user": "maria", "uid": 501, "gid": 20, "home": home, "nome": "Maria", "hosts": ["h"]}
cmds = []; orig_run = md.run
md.run = lambda c, timeout=40: (cmds.append(" ".join(c)), "")[1]

# _movivel: recusa link simbólico, sistema, "..", dentro de .app, fora das áreas permitidas
os.symlink("/etc/passwd", home + "/link"); os.makedirs(home + "/X.app/Contents"); open(home + "/X.app/Contents/bin", "w").write("x")
assert md._movivel(plist, home) and md._movivel(script, home) and md._movivel(home + "/X.app", home)
for ruim in [home + "/link", "/usr/bin/env", "/System/x", home + "/../maria/.cache/upd.sh", home + "/X.app/Contents/bin", "/etc/passwd", "", home + "/nao-existe", md.BASE_ROOT + "/x"]:
    assert not md._movivel(ruim, home), ruim
print("ok   _movivel recusa symlink, sistema, '..', interior de .app, caminho fora da área")

achados = [{"id": "A01", "regra": "script_bg", "sev": "critico", "cat": "seguranca", "titulo": "t", "ev": {},
            "local": {"launch": {"plist": plist, "label": "com.x.upd", "estado": "ativo (carregado agora)", "script": script}}},
           {"id": "A02", "regra": "script_bg", "sev": "critico", "cat": "seguranca", "titulo": "fora da pasta", "ev": {},
            "local": {"launch": {"plist": "/etc/evil.plist", "label": "x", "estado": "", "script": ""}}},
           {"id": "A03", "regra": "permissao_sensivel", "sev": "atencao", "cat": "seguranca", "titulo": "t", "ev": {},
            "local": {"tcc": {"cliente": "com.x.upd; rm -rf /", "servicos": ["kTCCServiceListenEvent"]}}},
           {"id": "A04", "regra": "permissao_sensivel", "sev": "atencao", "cat": "seguranca", "titulo": "t", "ev": {},
            "local": {"tcc": {"cliente": "com.x.upd", "servicos": ["kTCCServiceListenEvent", "kTCCServiceScreenCapture"]}}},
           {"id": "A05", "regra": "firewall_off", "sev": "info", "cat": "seguranca", "titulo": "t", "ev": {}, "local": {}}]
T = md.montar_acoes(achados, ident)
assert {"A01.desativar", "A01.quarentena", "A04.revogar", "A04.ajustes", "A05.firewall_on"} <= set(T), sorted(T)
assert not any(k.startswith("A02.") for k in T), "plist fora das pastas de launch não pode gerar ação"
assert "A03.revogar" not in T, "identificador de app com caracteres de shell não pode gerar comando"
assert T["A04.revogar"]["params"]["cmds"] == [["tccutil", "reset", "ListenEvent", "com.x.upd"], ["tccutil", "reset", "ScreenCapture", "com.x.upd"]]
assert T["A01.quarentena"]["params"]["mover"] == [plist, script] and T["A01.desativar"]["params"]["alvo"] == "gui/501/com.x.upd"
print("ok   tabela de ações:", sorted(T))

# desativar
r = md.executar_root(T["A01.desativar"], ident); assert r["ok"], r
assert cmds[-2:] == ["launchctl bootout gui/501/com.x.upd", "launchctl disable gui/501/com.x.upd"] and os.path.exists(plist)
# quarentena -> arquivos saem; desfazer -> voltam
r = md.executar_root(T["A01.quarentena"], ident); assert r["ok"] and "2 arquivo" in r["msg"], r
assert not os.path.exists(plist) and not os.path.exists(script)
q = [os.path.join(dp, f) for dp, _, fs in os.walk(md.BASE_ROOT + "/quarentena") for f in fs]; assert len(q) == 2, q
assert oct(os.stat(os.path.dirname(q[0])).st_mode & 0o777) == "0o700"
h = md.historico(); assert len(h) == 2 and h[0]["tipo"] == "quarentena" and not h[0]["desfeito"]
# repetir a quarentena com arquivos já movidos falha sem efeito colateral
r2 = md.executar_root(T["A01.quarentena"], ident); assert not r2["ok"], r2
cmds.clear(); d = md.desfazer_root(h[0]["id"], ident); assert d["ok"], d
assert os.path.exists(plist) and open(script).read().startswith("#!/bin/sh")
assert cmds == ["launchctl enable gui/501/com.x.upd", "launchctl bootstrap gui/501 " + plist], cmds
assert md.historico()[0]["desfeito"] and not md.desfazer_root(h[0]["id"], ident)["ok"], "desfazer duas vezes deve falhar"
assert not md.desfazer_root("inexistente", ident)["ok"]
# desfazer não sobrescreve arquivo que reapareceu no lugar
r = md.executar_root(T["A01.quarentena"], ident); assert r["ok"]; open(plist, "w").write("NOVO")
d = md.desfazer_root(md.historico()[0]["id"], ident); assert not d["ok"] and open(plist).read() == "NOVO", d
print("ok   desativar / quarentena / desfazer / não sobrescreve")

# encerrar: só mata se o PID ainda for o mesmo programa
md.run = orig_run
alvo = subprocess.Popen(["sleep", "60"]); caminho = orig_run(["ps", "-p", str(alvo.pid), "-o", "comm="]).strip()
ok, msg = md._encerrar(alvo.pid, "/outro/programa"); assert not ok and alvo.poll() is None, msg
ok, msg = md._encerrar(alvo.pid, caminho); alvo.wait(timeout=5); assert ok and alvo.poll() is not None, msg
ok, msg = md._encerrar(alvo.pid, caminho); assert ok and "já não estava" in msg
print("ok   encerrar confere o programa antes de matar")

# protocolo auxiliar <-> interface: só scan / acao da tabela (nível root) / desfazer / historico
a, b = socket.socketpair(); exec_log = []
threading.Thread(target=md.servir_root, args=(a, ident, lambda i: json.loads(json.dumps(RAW)), lambda ac, i: (exec_log.append(ac["id"]), {"ok": True, "msg": "feito"})[1],
                                              lambda i, _: {"ok": True, "msg": "desfeito " + i}, lambda: []), daemon=True).start()
RAW = md._demo()[1]; md._DEMO = True; ponte = md.Ponte(b); prog = []
r = ponte.pedir({"op": "scan"}, prog.append); assert r["ok"] and r["achados"] and r["acoes"], r.keys()
ida = next(k for k, v in r["acoes"].items() if v["nivel"] == "root"); idu = next(k for k, v in r["acoes"].items() if v["nivel"] == "user")
assert ponte.pedir({"op": "acao", "id": ida})["ok"] and exec_log == [ida]
assert not ponte.pedir({"op": "acao", "id": idu})["ok"], "auxiliar root não executa ação de nível usuário"
assert not ponte.pedir({"op": "acao", "id": "A01.inventada"})["ok"] and not ponte.pedir({"op": "acao", "id": {"x": 1}})["ok"]
assert not ponte.pedir({"op": "shell", "cmd": "id"})["ok"] and not ponte.pedir({"op": "acao", "comandos": ["rm -rf /"]})["ok"]
assert exec_log == [ida], exec_log
assert ponte.pedir({"op": "desfazer", "id": "abc"})["msg"] == "desfeito abc"
print("ok   auxiliar recusa ações fora da tabela, de nível usuário e operações desconhecidas")
shutil.rmtree(raiz); print("TESTES DE AÇÕES PASSARAM")
