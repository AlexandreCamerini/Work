/// Identificador estável de achado (RF-05). A regra deriva o valor do alvo (ex.: regra + caminho),
/// para que o mesmo item gere o mesmo id entre varreduras.
public struct FindingID: RawRepresentable, Codable, Sendable, Hashable {
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

/// Situação do item apontado pelo achado (RF-05, RF-07, RF-09).
public enum FindingStatus: String, Codable, Sendable, CaseIterable {
    case ativo
    case desativado
    /// Aponta para arquivo inexistente: achado próprio, nunca alerta de risco ativo (RF-07).
    case orfao
    /// O achado não se refere a um item com estado (ex.: SIP desligado).
    case naoSeAplica
}

/// Achado produzido por uma regra local (RF-05).
///
/// Severidade é `let`: só a regra a define (F11). O parecer da IA é outro tipo (`AIOpinion`)
/// e não tem como alterar este valor.
public struct Finding: Codable, Sendable, Hashable, Identifiable {
    public let id: FindingID
    public let rule: RuleID
    public let severity: Severity
    public let category: Category
    public let title: String
    public let evidence: Evidence
    public let status: FindingStatus
    public let fixes: [Fix]
    /// Possível stalkerware ou monitoramento: correções só depois do fluxo de segurança (RF-16, SPEC 10.3).
    public let requiresSafetyFlow: Bool

    public init(
        id: FindingID,
        rule: RuleID,
        severity: Severity,
        category: Category,
        title: String,
        evidence: Evidence,
        status: FindingStatus,
        fixes: [Fix],
        requiresSafetyFlow: Bool = false
    ) {
        self.id = id
        self.rule = rule
        self.severity = severity
        self.category = category
        self.title = title
        self.evidence = evidence
        self.status = status
        self.fixes = fixes
        self.requiresSafetyFlow = requiresSafetyFlow
    }
}
