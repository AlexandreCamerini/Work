import Foundation
import MDModel
import Testing
@testable import MDHelperProtocol

private let ref = ItemRef(snapshot: SnapshotID(UUID()), item: ItemID(UUID()))
private let processo = ProcessIdentity(pid: 4242, executablePath: "/Users/Shared/x/agent", startTimeMicroseconds: 1_800_000_000_123_456)
private let registro = RecordID(UUID())

/// Uma requisição de cada verbo. O `switch` é exaustivo: verbo novo quebra a compilação deste teste
/// até alguém incluí-lo aqui e passar pela auditoria de forma abaixo.
private let todasAsRequisicoes: [HelperRequest] = {
    let amostras: [HelperRequest] = [
        .handshake(app: .current), .scanPrivileged(collectors: Set(PrivilegedCollector.allCases)),
        .disableLaunchItem(ref), .quarantineItem(ref), .terminateProcess(processo), .removeLoginHook,
        .setGatekeeper, .setFirewall, .undo(registro), .history, .uninstall,
    ]
    for amostra in amostras {
        switch amostra {
        case .handshake, .scanPrivileged, .disableLaunchItem, .quarantineItem, .terminateProcess,
             .removeLoginHook, .setGatekeeper, .setFirewall, .undo, .history, .uninstall:
            break
        }
    }
    return amostras
}()

/// Caminhos (em pontos) de todos os valores `String` dentro de um valor, via reflexão.
private func camposDeTexto(_ valor: Any, prefixo: String = "") -> [String] {
    if valor is String || valor is Substring || valor is URL { return [prefixo] }
    let espelho = Mirror(reflecting: valor)
    return espelho.children.enumerated().flatMap { indice, filho in
        camposDeTexto(filho.value, prefixo: prefixo + "." + (filho.label ?? "\(indice)"))
    }
}

@Suite("Forma dos verbos (SPEC 7.1, Nunca item 1)")
struct VerbShapeTests {
    @Test func umCasoPorVerboDa7_2() {
        #expect(todasAsRequisicoes.count == 11)
    }

    @Test func nenhumaRequisicaoCarregaTextoLivre() {
        for requisicao in todasAsRequisicoes {
            let campos = camposDeTexto(requisicao)
            // Único texto aceito: o executável na identidade de processo, que só é comparado (7.1, item 3).
            if case .terminateProcess = requisicao {
                #expect(campos == [".terminateProcess.executablePath"])
            } else {
                #expect(campos.isEmpty, "\(requisicao) carrega texto: \(campos)")
            }
        }
    }

    @Test func protecaoSoLiga() throws {
        let gatekeeper = String(decoding: try HelperWire.encode(HelperRequest.setGatekeeper), as: UTF8.self)
        #expect(!gatekeeper.contains("enabled"))
        #expect(!gatekeeper.contains("false"))
    }
}

@Suite("Codificação")
struct WireTests {
    @Test(arguments: todasAsRequisicoes)
    func requisicaoIdaEVolta(_ requisicao: HelperRequest) throws {
        let dados = try HelperWire.encode(requisicao)
        #expect(HelperWire.decodeRequest(dados) == .success(requisicao))
    }

    @Test func respostasIdaEVolta() throws {
        let snapshot = PrivilegedSnapshot(
            id: ref.snapshot,
            takenAt: Date(timeIntervalSince1970: 1_800_000_000.25),
            items: [PrivilegedItem(id: ref.item, collector: .backgroundItems, evidence: Evidence(["tipo": .text("agent")]))],
            missingChecks: [MissingCheck(check: CheckID(rawValue: "sudoers"), reason: .failed)]
        )
        let acao = ActionRecord(
            id: registro, date: Date(timeIntervalSince1970: 1_800_000_001), verb: .quarantineItem,
            target: .item(ref, path: "/Users/Shared/x/agent.plist"), outcome: .succeeded,
            quarantine: QuarantineMove(origin: "/Users/Shared/x/agent.plist", destination: "/Library/Application Support/q/1"),
            undoable: true
        )
        let recusa = ActionRecord(
            id: RecordID(UUID()), date: Date(timeIntervalSince1970: 1_800_000_002), verb: .terminateProcess,
            target: .process(processo), outcome: .refused(.processMismatch), undoable: false
        )
        let respostas: [HelperResponse] = [
            .handshake(HandshakeInfo(protocolVersion: .current, helperVersion: "1.0.0", capabilities: [.backgroundItems])),
            .snapshot(snapshot), .record(acao), .record(recusa), .protection(.on), .history([acao, recusa]),
            .uninstalled(.removedKeepingQuarantine),
            .failure(.incompatibleProtocol(helper: ProtocolVersion(major: 2, minor: 0), app: .current)),
            .failure(.collectorUnavailable(.unreadableScripts)), .failure(.systemFailure(code: 1)),
        ]
        for resposta in respostas {
            #expect(try HelperWire.decodeResponse(HelperWire.encode(resposta)) == resposta)
        }
    }

    @Test func verboDesconhecidoViraMalformado() {
        for entrada in [#"{"runCommand":{"_0":"rm -rf /"}}"#, #"{"quarantinePath":{"path":"/etc"}}"#, "nada", "{}"] {
            #expect(HelperWire.decodeRequest(Data(entrada.utf8)) == .failure(.malformedRequest))
        }
    }

    @Test func campoExtraNaoMudaOVerbo() throws {
        // Um caminho enfiado ao lado do id é ignorado: o alvo continua sendo só a referência opaca.
        let dados = try HelperWire.encode(HelperRequest.quarantineItem(ref))
        var objeto = try #require(JSONSerialization.jsonObject(with: dados) as? [String: [String: Any]])
        objeto["quarantineItem"]?["path"] = "/etc/sudoers"
        let adulterado = try JSONSerialization.data(withJSONObject: objeto)
        #expect(HelperWire.decodeRequest(adulterado) == .success(.quarantineItem(ref)))
    }

    @Test func requisicaoGrandeDemaisERecusada() {
        let grande = Data(repeating: 0x20, count: HelperWire.maxRequestBytes + 1)
        #expect(HelperWire.decodeRequest(grande) == .failure(.malformedRequest))
    }
}

@Suite("Versão do protocolo")
struct VersionTests {
    @Test func compatibilidade() {
        let helper = ProtocolVersion(major: 1, minor: 2)
        #expect(helper.canServe(app: ProtocolVersion(major: 1, minor: 0)))
        #expect(helper.canServe(app: ProtocolVersion(major: 1, minor: 2)))
        #expect(!helper.canServe(app: ProtocolVersion(major: 1, minor: 3)))
        #expect(!helper.canServe(app: ProtocolVersion(major: 2, minor: 0)))
        #expect(!ProtocolVersion(major: 2, minor: 0).canServe(app: ProtocolVersion(major: 1, minor: 0)))
    }

    @Test func ordem() {
        #expect(ProtocolVersion(major: 1, minor: 9) < ProtocolVersion(major: 2, minor: 0))
        #expect(ProtocolVersion.current.description == "1.0")
    }
}

@Suite("Identidade de processo")
struct ProcessIdentityTests {
    @Test func horaDeInicioSemPerdaDePrecisao() throws {
        let dados = try HelperWire.encode(HelperRequest.terminateProcess(processo))
        guard case .success(.terminateProcess(let volta)) = HelperWire.decodeRequest(dados) else {
            Issue.record("não decodificou")
            return
        }
        #expect(volta.startTimeMicroseconds == 1_800_000_000_123_456)
        #expect(volta == processo)
    }

    @Test func qualquerCampoDiferenteEOutroProcesso() {
        #expect(processo != ProcessIdentity(pid: 4242, executablePath: "/Users/Shared/x/agent", startTimeMicroseconds: 1))
        #expect(processo != ProcessIdentity(pid: 1, executablePath: "/Users/Shared/x/agent", startTimeMicroseconds: 1_800_000_000_123_456))
        #expect(processo != ProcessIdentity(pid: 4242, executablePath: "/tmp/agent", startTimeMicroseconds: 1_800_000_000_123_456))
    }
}
