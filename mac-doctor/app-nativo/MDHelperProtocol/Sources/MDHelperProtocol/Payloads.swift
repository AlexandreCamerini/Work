import Foundation
import MDModel

/// Coletores privilegiados (SPEC 7.2). Todos somente leitura.
public enum PrivilegedCollector: String, Codable, Sendable, CaseIterable {
    /// Itens em segundo plano via `sfltool dumpbtm` (M0, conclusão 1).
    case backgroundItems
    case adminScheduledTasks
    case sudoRules
    case configurationProfiles
    case networkConnections
    case unreadableScripts
}

public struct HandshakeInfo: Codable, Sendable, Hashable {
    public let protocolVersion: ProtocolVersion
    /// Versão do pacote do helper, para RF-24 (re-registro só se divergir).
    public let helperVersion: String
    /// Coletores disponíveis nesta versão do macOS (RF-12).
    public let capabilities: Set<PrivilegedCollector>

    public init(protocolVersion: ProtocolVersion, helperVersion: String, capabilities: Set<PrivilegedCollector>) {
        self.protocolVersion = protocolVersion
        self.helperVersion = helperVersion
        self.capabilities = capabilities
    }
}

/// Item coletado pelo helper. A evidência usa as chaves do protótipo; regras ficam no app (`MDRules`).
public struct PrivilegedItem: Codable, Sendable, Hashable, Identifiable {
    public let id: ItemID
    public let collector: PrivilegedCollector
    public let evidence: Evidence

    public init(id: ItemID, collector: PrivilegedCollector, evidence: Evidence) {
        self.id = id
        self.collector = collector
        self.evidence = evidence
    }
}

/// Saída de `scanPrivileged`: itens identificados e o que não pôde ser lido (P5).
public struct PrivilegedSnapshot: Codable, Sendable, Hashable, Identifiable {
    public let id: SnapshotID
    public let takenAt: Date
    public let items: [PrivilegedItem]
    public let missingChecks: [MissingCheck]

    public init(id: SnapshotID, takenAt: Date, items: [PrivilegedItem], missingChecks: [MissingCheck]) {
        self.id = id
        self.takenAt = takenAt
        self.items = items
        self.missingChecks = missingChecks
    }
}

/// Verbos que geram registro.
public enum ActionVerb: String, Codable, Sendable, CaseIterable {
    case disableLaunchItem
    case quarantineItem
    case terminateProcess
    case removeLoginHook
    case enableGatekeeper
    case enableFirewall
    case undo
}

/// Alvo registrado. Caminhos aqui são saída do helper, para exibir no histórico; nunca voltam como entrada.
public enum ActionTarget: Codable, Sendable, Hashable {
    case item(ItemRef, path: String)
    case process(ProcessIdentity)
    case loginHook
    case gatekeeper
    case firewall
    case record(RecordID)
}

public struct QuarantineMove: Codable, Sendable, Hashable {
    public let origin: String
    public let destination: String

    public init(origin: String, destination: String) {
        self.origin = origin
        self.destination = destination
    }
}

public enum ActionOutcome: Codable, Sendable, Hashable {
    case succeeded
    case refused(HelperError)
}

/// Registro de uma ação (7.1, item 6; RF-14).
public struct ActionRecord: Codable, Sendable, Hashable, Identifiable {
    public let id: RecordID
    public let date: Date
    public let verb: ActionVerb
    public let target: ActionTarget
    public let outcome: ActionOutcome
    /// Origem e destino de `quarantineItem`.
    public let quarantine: QuarantineMove?
    /// Valor anterior de `removeLoginHook`.
    public let previousValue: String?
    public let undoable: Bool
    public let undoneBy: RecordID?

    public init(
        id: RecordID,
        date: Date,
        verb: ActionVerb,
        target: ActionTarget,
        outcome: ActionOutcome,
        quarantine: QuarantineMove? = nil,
        previousValue: String? = nil,
        undoable: Bool,
        undoneBy: RecordID? = nil
    ) {
        self.id = id
        self.date = date
        self.verb = verb
        self.target = target
        self.outcome = outcome
        self.quarantine = quarantine
        self.previousValue = previousValue
        self.undoable = undoable
        self.undoneBy = undoneBy
    }
}

/// Estado de uma proteção após `setGatekeeper` / `setFirewall`.
public enum ProtectionState: String, Codable, Sendable {
    case on
    case off
}

public enum UninstallResult: Codable, Sendable, Hashable {
    case removed
    /// A quarentena ficou no lugar; o app pede confirmação antes de removê-la (RF-25).
    case removedKeepingQuarantine
}
