/// Severidade de um achado (RF-05). Valores crus iguais aos do protótipo, para os testes dourados (SPEC 14.2).
///
/// A ordem de `Comparable` é de gravidade: `.info < .atencao < .critico`.
public enum Severity: String, Codable, Sendable, CaseIterable, Comparable {
    case info
    case atencao
    case critico

    private var rank: Int {
        switch self {
        case .info: 0
        case .atencao: 1
        case .critico: 2
        }
    }

    public static func < (lhs: Severity, rhs: Severity) -> Bool {
        lhs.rank < rhs.rank
    }

    /// Piso de severidade (F11, SPEC 9.5): qualquer valor proposto fora da regra
    /// nunca fica abaixo do piso. Valores acima do piso são mantidos.
    public func raised(toFloor floor: Severity) -> Severity {
        Swift.max(self, floor)
    }
}

/// Categoria do achado (RF-05). Valores crus iguais aos do protótipo.
public enum Category: String, Codable, Sendable, CaseIterable {
    case seguranca
    case desempenho
}
