import Foundation

/// Versão do protocolo (SPEC 7.1, item 7). Mesma `major` é condição de conexão;
/// o helper precisa ter `minor` igual ou maior que a do app.
public struct ProtocolVersion: Codable, Sendable, Hashable, Comparable, CustomStringConvertible {
    public let major: Int
    public let minor: Int

    public init(major: Int, minor: Int) {
        self.major = major
        self.minor = minor
    }

    public static let current = ProtocolVersion(major: 1, minor: 0)

    /// O helper com esta versão atende um app com a versão `app`.
    public func canServe(app: ProtocolVersion) -> Bool {
        major == app.major && minor >= app.minor
    }

    public static func < (lhs: ProtocolVersion, rhs: ProtocolVersion) -> Bool {
        (lhs.major, lhs.minor) < (rhs.major, rhs.minor)
    }

    public var description: String { "\(major).\(minor)" }
}

/// Snapshot privilegiado emitido pelo helper. Ações citam o snapshot para o helper recusar alvo velho (7.1, item 2).
public struct SnapshotID: Codable, Sendable, Hashable {
    public let rawValue: UUID

    public init(_ rawValue: UUID) {
        self.rawValue = rawValue
    }
}

/// Item opaco que o próprio helper coletou num snapshot (7.1, item 1). Não carrega caminho.
public struct ItemID: Codable, Sendable, Hashable {
    public let rawValue: UUID

    public init(_ rawValue: UUID) {
        self.rawValue = rawValue
    }
}

/// Referência de alvo de ação: item + snapshot em que foi coletado.
public struct ItemRef: Codable, Sendable, Hashable {
    public let snapshot: SnapshotID
    public let item: ItemID

    public init(snapshot: SnapshotID, item: ItemID) {
        self.snapshot = snapshot
        self.item = item
    }
}

/// Entrada do registro de ações do helper (7.1, item 6).
public struct RecordID: Codable, Sendable, Hashable {
    public let rawValue: UUID

    public init(_ rawValue: UUID) {
        self.rawValue = rawValue
    }
}

/// Identidade de processo para `terminateProcess` (7.1, item 3): PID, executável e hora de início
/// têm de bater com o processo vivo. O caminho é só critério de conferência, nunca operando:
/// o helper não abre, move nem executa nada a partir dele.
public struct ProcessIdentity: Codable, Sendable, Hashable {
    public let pid: Int32
    public let executablePath: String
    /// Hora de início em microssegundos desde 1970, como `proc_bsdinfo` (exato, sem arredondamento de `Date`).
    public let startTimeMicroseconds: UInt64

    public init(pid: Int32, executablePath: String, startTimeMicroseconds: UInt64) {
        self.pid = pid
        self.executablePath = executablePath
        self.startTimeMicroseconds = startTimeMicroseconds
    }
}
