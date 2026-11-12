import Foundation
import Testing
@testable import MDModel

private func roundTrip<T: Codable>(_ value: T) throws -> T {
    let encoder = JSONEncoder()
    encoder.outputFormatting = [.sortedKeys]
    return try JSONDecoder().decode(T.self, from: encoder.encode(value))
}

private func json<T: Encodable>(_ value: T) throws -> String {
    let encoder = JSONEncoder()
    encoder.outputFormatting = [.sortedKeys]
    return String(decoding: try encoder.encode(value), as: UTF8.self)
}

private let sampleFinding = Finding(
    id: FindingID(rawValue: "persist_caminho:/Users/Shared/.x/agent.plist"),
    rule: .persistCaminho,
    severity: .critico,
    category: .seguranca,
    title: "Item de inicialização em pasta incomum",
    evidence: Evidence([
        "arquivo": .text("/Users/Shared/.x/agent.plist"),
        "executa": .list(["/Users/Shared/.x/run.sh", "--quiet"]),
        "ativo": .boolean(true),
        "linhas": .integer(42),
    ]),
    status: .ativo,
    fixes: [.disableLaunchItem, .quarantine, .openSettings(.loginItems)]
)

@Suite("Severidade")
struct SeverityTests {
    @Test func ordemDeGravidade() {
        #expect(Severity.info < .atencao)
        #expect(Severity.atencao < .critico)
        #expect(Severity.allCases.sorted() == [.info, .atencao, .critico])
    }

    @Test func valoresCrusDoPrototipo() {
        #expect(Severity.allCases.map(\.rawValue) == ["info", "atencao", "critico"])
        #expect(Category.allCases.map(\.rawValue) == ["seguranca", "desempenho"])
    }

    @Test(arguments: Severity.allCases, Severity.allCases)
    func pisoNuncaRebaixa(proposta: Severity, piso: Severity) {
        let resultado = proposta.raised(toFloor: piso)
        #expect(resultado >= piso)
        #expect(resultado >= proposta)
        #expect(resultado == max(proposta, piso))
    }

    @Test func pisoCasosExplicitos() {
        #expect(Severity.info.raised(toFloor: .critico) == .critico)
        #expect(Severity.critico.raised(toFloor: .info) == .critico)
        #expect(Severity.atencao.raised(toFloor: .atencao) == .atencao)
    }

    @Test func valorDesconhecidoNaoDecodifica() {
        #expect(throws: DecodingError.self) {
            try JSONDecoder().decode(Severity.self, from: Data(#""grave""#.utf8))
        }
    }
}

@Suite("Evidência")
struct EvidenceTests {
    @Test func codificaComoJSONNativo() throws {
        let evidencia = Evidence([
            "a": .text("x"), "b": .integer(3), "c": .boolean(false), "d": .list(["1", "2"]),
        ])
        #expect(try json(evidencia) == #"{"a":"x","b":3,"c":false,"d":["1","2"]}"#)
    }

    @Test func decodificaFormatoDoPrototipo() throws {
        let entrada = #"{"caminho":"/tmp/a","pid":123,"assinado":true,"trechos":["linha 3: curl"]}"#
        let evidencia = try JSONDecoder().decode(Evidence.self, from: Data(entrada.utf8))
        #expect(evidencia["caminho"] == .text("/tmp/a"))
        #expect(evidencia["pid"] == .integer(123))
        #expect(evidencia["assinado"] == .boolean(true))
        #expect(evidencia["trechos"] == .list(["linha 3: curl"]))
    }

    @Test func booleanoNaoViraInteiroNemTexto() throws {
        let evidencia = try roundTrip(Evidence(["x": .boolean(true), "y": .integer(1), "z": .text("true")]))
        #expect(evidencia["x"] == .boolean(true))
        #expect(evidencia["y"] == .integer(1))
        #expect(evidencia["z"] == .text("true"))
    }

    @Test func recusaTiposForaDoEsquema() {
        for entrada in [#"{"x":1.5}"#, #"{"x":null}"#, #"{"x":{"y":1}}"#, #"{"x":[1,2]}"#] {
            #expect(throws: DecodingError.self) {
                try JSONDecoder().decode(Evidence.self, from: Data(entrada.utf8))
            }
        }
    }

    @Test func igualdadeIndependeDaOrdem() {
        #expect(Evidence(["a": .integer(1), "b": .text("2")]) == Evidence(["b": .text("2"), "a": .integer(1)]))
        #expect(Evidence(["a": .integer(1)]) != Evidence(["a": .text("1")]))
    }
}

@Suite("Achado e snapshot")
struct FindingTests {
    @Test func achadoIdaEVolta() throws {
        #expect(try roundTrip(sampleFinding) == sampleFinding)
    }

    @Test func achadoUsaIdentificadoresDoPrototipo() throws {
        let texto = try json(sampleFinding)
        #expect(texto.contains(#""rule":"persist_caminho""#))
        #expect(texto.contains(#""severity":"critico""#))
        #expect(texto.contains(#""category":"seguranca""#))
        #expect(texto.contains(#""id":"persist_caminho:\/Users\/Shared\/.x\/agent.plist""#))
    }

    @Test func igualdadeConsideraTodosOsCampos() {
        let outro = Finding(
            id: sampleFinding.id, rule: sampleFinding.rule, severity: .atencao, category: sampleFinding.category,
            title: sampleFinding.title, evidence: sampleFinding.evidence, status: sampleFinding.status,
            fixes: sampleFinding.fixes
        )
        #expect(outro != sampleFinding)
    }

    @Test func regraDesconhecidaNaoDecodifica() throws {
        let texto = try json(sampleFinding).replacingOccurrences(of: "persist_caminho\"", with: "regra_inventada\"")
        #expect(throws: DecodingError.self) {
            try JSONDecoder().decode(Finding.self, from: Data(texto.utf8))
        }
    }

    @Test func catalogoTemAsRegrasDaSecao8() {
        #expect(RuleID.allCases.count == 41)
        #expect(Set(RuleID.allCases.map(\.rawValue)).count == RuleID.allCases.count)
        #expect(RuleID(rawValue: "indicador_conhecido") == .indicadorConhecido)
    }

    @Test func snapshotIdaEVolta() throws {
        let snapshot = ScanSnapshot(
            id: UUID(),
            startedAt: Date(timeIntervalSince1970: 1_800_000_000),
            finishedAt: Date(timeIntervalSince1970: 1_800_000_012),
            system: SystemSummary(osVersion: "27.3", osBuild: "26C5035r", architecture: .arm64, hasFullDiskAccess: false),
            mode: .partial,
            findings: [sampleFinding],
            missingChecks: [MissingCheck(check: CheckID(rawValue: "permissoes"), reason: .needsFullDiskAccess)]
        )
        #expect(try roundTrip(snapshot) == snapshot)
    }
}

@Suite("Correções e parecer da IA")
struct FixAndOpinionTests {
    @Test func correcaoComPainelIdaEVolta() throws {
        let fixes: [Fix] = [.quarantine, .openSettings(.privacySecurity), .openApp(.keychainAccess), .manualGuide]
        #expect(try roundTrip(fixes) == fixes)
    }

    @Test func desfazerSegueCatalogo10_1() {
        #expect(Fix.disableLaunchItem.undo == .helperUndo)
        #expect(Fix.quarantine.undo == .helperUndo)
        #expect(Fix.removeLoginHook.undo == .helperUndo)
        #expect(Fix.terminateProcess.undo == .notApplicable)
        #expect(Fix.enableGatekeeper.undo == .turnOffInSettings)
        #expect(Fix.enableFirewall.undo == .turnOffInSettings)
        #expect(Fix.resetPrivacyPermission.undo == .grantAgain)
        #expect(Fix.openSettings(.storage).undo == .notApplicable)
    }

    @Test func soCorrecoesQueMudamOSistemaPassamPeloHelper() {
        #expect(Fix.quarantine.requiresHelper)
        #expect(Fix.enableFirewall.requiresHelper)
        #expect(!Fix.openSettings(.fileVault).requiresHelper)
        #expect(!Fix.manualGuide.requiresHelper)
    }

    @Test func parecerForaDoEsquemaViraConservador() {
        #expect(AIVerdict(lenient: "seguro") == .investigar)
        #expect(AIVerdict(lenient: "suspeito") == .suspeito)
        #expect(AIConfidence(lenient: "altíssima") == .baixa)
        #expect(AIConfidence(lenient: "media") == .media)
    }

    @Test func parecerNaoTemSeveridade() throws {
        let parecer = AIOpinion(
            finding: sampleFinding.id, verdict: .provavelmenteLegitimo, confidence: .alta, explanation: "x"
        )
        let texto = try json(parecer)
        #expect(!texto.contains("severity"))
        #expect(try roundTrip(parecer) == parecer)
        // O achado é imutável: o parecer convive com ele sem mudar a severidade da regra.
        #expect(sampleFinding.severity == .critico)
    }
}
