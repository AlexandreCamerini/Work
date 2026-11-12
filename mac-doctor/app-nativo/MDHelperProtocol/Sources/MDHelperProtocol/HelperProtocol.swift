import Foundation

/// Contrato do helper (SPEC 7.2). Implementado pelo helper (M5) e por um cliente XPC no app.
///
/// Regras de forma (SPEC 7.1, CLAUDE.md "Nunca" item 1):
/// - nenhum verbo recebe comando, caminho ou lista de argumentos;
/// - ações recebem só referências opacas emitidas pelo próprio helper, ou a identidade de processo de 7.1 item 3;
/// - `setGatekeeper` e `setFirewall` só ligam a proteção; desligar é nos Ajustes (SPEC 10.1).
public protocol MDHelperService: Sendable {
    func handshake(app: ProtocolVersion) async throws(HelperError) -> HandshakeInfo
    func scanPrivileged(collectors: Set<PrivilegedCollector>) async throws(HelperError) -> PrivilegedSnapshot
    func disableLaunchItem(_ item: ItemRef) async throws(HelperError) -> ActionRecord
    func quarantineItem(_ item: ItemRef) async throws(HelperError) -> ActionRecord
    func terminateProcess(_ process: ProcessIdentity) async throws(HelperError) -> ActionRecord
    func removeLoginHook() async throws(HelperError) -> ActionRecord
    func setGatekeeper() async throws(HelperError) -> ProtectionState
    func setFirewall() async throws(HelperError) -> ProtectionState
    func undo(_ record: RecordID) async throws(HelperError) -> ActionRecord
    func history() async throws(HelperError) -> [ActionRecord]
    func uninstall() async throws(HelperError) -> UninstallResult
}

/// Mensagem na conexão XPC: um caso por verbo da SPEC 7.2. Conjunto fechado; decodificação de
/// qualquer outra coisa falha e vira `HelperError.malformedRequest`.
public enum HelperRequest: Codable, Sendable, Hashable {
    case handshake(app: ProtocolVersion)
    case scanPrivileged(collectors: Set<PrivilegedCollector>)
    case disableLaunchItem(ItemRef)
    case quarantineItem(ItemRef)
    case terminateProcess(ProcessIdentity)
    case removeLoginHook
    case setGatekeeper
    case setFirewall
    case undo(RecordID)
    case history
    case uninstall
}

public enum HelperResponse: Codable, Sendable, Hashable {
    case handshake(HandshakeInfo)
    case snapshot(PrivilegedSnapshot)
    case record(ActionRecord)
    case protection(ProtectionState)
    case history([ActionRecord])
    case uninstalled(UninstallResult)
    case failure(HelperError)
}

/// Codificação única das mensagens, para app e helper concordarem byte a byte.
public enum HelperWire {
    /// Teto de tamanho de uma requisição. Nenhum verbo legítimo chega perto; acima disso o helper recusa sem decodificar.
    public static let maxRequestBytes = 16 * 1024

    public static func encode<T: Encodable>(_ value: T) throws -> Data {
        let encoder = JSONEncoder()
        encoder.outputFormatting = [.sortedKeys]
        encoder.dateEncodingStrategy = .millisecondsSince1970
        return try encoder.encode(value)
    }

    public static func decodeRequest(_ data: Data) -> Result<HelperRequest, HelperError> {
        guard data.count <= maxRequestBytes else { return .failure(.malformedRequest) }
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .millisecondsSince1970
        guard let request = try? decoder.decode(HelperRequest.self, from: data) else {
            return .failure(.malformedRequest)
        }
        return .success(request)
    }

    public static func decodeResponse(_ data: Data) throws -> HelperResponse {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .millisecondsSince1970
        return try decoder.decode(HelperResponse.self, from: data)
    }
}
