/// Valor de um campo de evidência. Codifica como valor JSON nativo, no mesmo formato do protótipo.
///
/// Sem número decimal: a regra formata decimais como texto, para não depender de idioma (M0, conclusão 2)
/// nem perder igualdade num ciclo de codificação.
public enum EvidenceValue: Sendable, Hashable {
    case text(String)
    case integer(Int)
    case boolean(Bool)
    case list([String])
}

extension EvidenceValue: Codable {
    public init(from decoder: any Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Bool.self) {
            self = .boolean(value)
        } else if let value = try? container.decode(Int.self) {
            self = .integer(value)
        } else if let value = try? container.decode(String.self) {
            self = .text(value)
        } else if let value = try? container.decode([String].self) {
            self = .list(value)
        } else {
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Evidência aceita só texto, inteiro, booleano ou lista de texto."
            )
        }
    }

    public func encode(to encoder: any Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .text(let value): try container.encode(value)
        case .integer(let value): try container.encode(value)
        case .boolean(let value): try container.encode(value)
        case .list(let value): try container.encode(value)
        }
    }
}

/// Evidência estruturada de um achado (RF-05, RF-09). As chaves seguem o protótipo.
/// A ordem de exibição é decisão da interface, não do modelo.
public struct Evidence: Codable, Sendable, Hashable {
    public var fields: [String: EvidenceValue]

    public init(_ fields: [String: EvidenceValue] = [:]) {
        self.fields = fields
    }

    public subscript(key: String) -> EvidenceValue? {
        fields[key]
    }

    public init(from decoder: any Decoder) throws {
        fields = try decoder.singleValueContainer().decode([String: EvidenceValue].self)
    }

    public func encode(to encoder: any Encoder) throws {
        var container = encoder.singleValueContainer()
        try container.encode(fields)
    }
}
