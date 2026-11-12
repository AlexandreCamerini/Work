/// Parecer da IA sobre um achado (SPEC 9.5). Aparece como etiqueta; não tem campo de severidade
/// e não altera cor, ordem do placar nem disponibilidade de correção (F11).
public enum AIVerdict: String, Codable, Sendable, CaseIterable {
    case provavelmenteLegitimo = "provavelmente_legitimo"
    case investigar
    case suspeito

    /// Valor fora do esquema vira o mais conservador (SPEC 9.4), como no protótipo.
    public init(lenient rawValue: String) {
        self = AIVerdict(rawValue: rawValue) ?? .investigar
    }
}

public enum AIConfidence: String, Codable, Sendable, CaseIterable {
    case baixa
    case media
    case alta

    /// Valor fora do esquema vira o mais conservador (SPEC 9.4).
    public init(lenient rawValue: String) {
        self = AIConfidence(rawValue: rawValue) ?? .baixa
    }
}

public struct AIOpinion: Codable, Sendable, Hashable {
    public let finding: FindingID
    public let verdict: AIVerdict
    public let confidence: AIConfidence
    public let explanation: String

    public init(finding: FindingID, verdict: AIVerdict, confidence: AIConfidence, explanation: String) {
        self.finding = finding
        self.verdict = verdict
        self.confidence = confidence
        self.explanation = explanation
    }
}
