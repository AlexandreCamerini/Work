/// Erro tipado do helper. Sem texto livre: a interface traduz cada caso para pt-BR.
public enum HelperError: Error, Codable, Sendable, Hashable {
    /// Versões incompatíveis recusam a conexão (7.1, item 7).
    case incompatibleProtocol(helper: ProtocolVersion, app: ProtocolVersion)
    /// Requisição que não decodifica para um verbo conhecido.
    case malformedRequest
    case unknownSnapshot
    /// O snapshot existe mas não é o atual (7.1, item 2).
    case staleSnapshot
    case unknownItem
    case unknownRecord
    case targetMissing
    case targetIsSymlink
    /// Fora das áreas da SPEC 7.3.
    case targetOutsideAllowedArea
    /// Tamanho, data, dono ou inode mudaram desde o snapshot.
    case targetChangedSinceSnapshot
    /// PID, executável ou hora de início não batem (7.1, item 3).
    case processMismatch
    case processNotFound
    case notUndoable
    case alreadyUndone
    /// Desfazer encontraria arquivo no lugar original (RF-15).
    case originOccupied
    case collectorUnavailable(PrivilegedCollector)
    /// Falha do sistema ao executar; `code` é o errno ou `OSStatus`.
    case systemFailure(code: Int32)
}
