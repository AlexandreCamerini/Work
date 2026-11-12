import Foundation

/// Identificador de uma verificação (coletor ou fonte de dado), usado para dizer o que não rodou (P5).
public struct CheckID: RawRepresentable, Codable, Sendable, Hashable {
    public let rawValue: String

    public init(rawValue: String) {
        self.rawValue = rawValue
    }

    public init(from decoder: any Decoder) throws {
        rawValue = try decoder.singleValueContainer().decode(String.self)
    }

    public func encode(to encoder: any Encoder) throws {
        var container = encoder.singleValueContainer()
        try container.encode(rawValue)
    }
}

/// Motivo de uma verificação não ter rodado (P5, RF-02, RF-12).
public enum MissingReason: String, Codable, Sendable, CaseIterable {
    case helperUnavailable
    case needsFullDiskAccess
    case unsupportedOnThisOS
    case timedOut
    case failed
}

public struct MissingCheck: Codable, Sendable, Hashable {
    public let check: CheckID
    public let reason: MissingReason

    public init(check: CheckID, reason: MissingReason) {
        self.check = check
        self.reason = reason
    }
}

public enum ScanMode: String, Codable, Sendable {
    case complete
    /// Sem helper ou com coletor recusado (RF-02).
    case partial
}

public struct SystemSummary: Codable, Sendable, Hashable {
    /// Versão do macOS, ex.: "27.3".
    public let osVersion: String
    /// Build, ex.: "26C5035r".
    public let osBuild: String
    public let architecture: Architecture
    public let hasFullDiskAccess: Bool

    public init(osVersion: String, osBuild: String, architecture: Architecture, hasFullDiskAccess: Bool) {
        self.osVersion = osVersion
        self.osBuild = osBuild
        self.architecture = architecture
        self.hasFullDiskAccess = hasFullDiskAccess
    }
}

public enum Architecture: String, Codable, Sendable {
    case arm64
    case x86_64
}

/// Resultado de uma varredura (RF-01, RF-04). Fica em memória e em arquivo local protegido.
public struct ScanSnapshot: Codable, Sendable, Hashable, Identifiable {
    public let id: UUID
    public let startedAt: Date
    public let finishedAt: Date
    public let system: SystemSummary
    public let mode: ScanMode
    public let findings: [Finding]
    public let missingChecks: [MissingCheck]

    public init(
        id: UUID,
        startedAt: Date,
        finishedAt: Date,
        system: SystemSummary,
        mode: ScanMode,
        findings: [Finding],
        missingChecks: [MissingCheck]
    ) {
        self.id = id
        self.startedAt = startedAt
        self.finishedAt = finishedAt
        self.system = system
        self.mode = mode
        self.findings = findings
        self.missingChecks = missingChecks
    }
}
