/// Correção aplicável a um achado. Espelha o catálogo fechado da SPEC 10.1, mais as saídas
/// sem efeito no sistema (abrir app ou painel, guia manual) usadas na tabela da SPEC 8.
///
/// Conjunto fechado de propósito: correção nova exige mudar este tipo (CLAUDE.md, "Nunca" item 4).
public enum Fix: Codable, Sendable, Hashable {
    case disableLaunchItem
    case quarantine
    case terminateProcess
    case removeLoginHook
    case resetPrivacyPermission
    case enableGatekeeper
    case enableFirewall
    case openSettings(SettingsPane)
    case openApp(SystemApp)
    case manualGuide

    /// Como a correção se desfaz (coluna "Desfazer" da SPEC 10.1).
    public var undo: UndoKind {
        switch self {
        case .disableLaunchItem, .quarantine, .removeLoginHook: .helperUndo
        case .resetPrivacyPermission: .grantAgain
        case .enableGatekeeper, .enableFirewall: .turnOffInSettings
        case .terminateProcess, .openSettings, .openApp, .manualGuide: .notApplicable
        }
    }

    /// A correção muda o estado do sistema pelo helper.
    public var requiresHelper: Bool {
        switch self {
        case .disableLaunchItem, .quarantine, .terminateProcess, .removeLoginHook, .enableGatekeeper, .enableFirewall:
            true
        case .resetPrivacyPermission, .openSettings, .openApp, .manualGuide:
            false
        }
    }
}

public enum UndoKind: String, Codable, Sendable {
    /// Desfazer pelo histórico do helper (verbo `undo`).
    case helperUndo
    /// O app volta a pedir a permissão; o usuário concede de novo.
    case grantAgain
    /// O usuário desliga nos Ajustes; o helper não desliga proteção.
    case turnOffInSettings
    /// Ação inócua ou sem estado a restaurar.
    case notApplicable
}

/// Painéis dos Ajustes que o app pode abrir. Só navega.
public enum SettingsPane: String, Codable, Sendable, CaseIterable {
    case privacySecurity
    case fileVault
    case loginItems
    case sharing
    case network
    case profiles
    case storage
    case battery
    case spotlight
    case timeMachine
}

public enum SystemApp: String, Codable, Sendable, CaseIterable {
    case activityMonitor
    case keychainAccess
}
