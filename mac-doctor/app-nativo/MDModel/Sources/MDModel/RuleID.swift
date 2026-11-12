/// Identificador de regra do catálogo da v1 (SPEC 8). Valores crus iguais aos do protótipo.
///
/// Conjunto fechado: a camada de IA usa este tipo para recusar regras que não existem (RF-20).
public enum RuleID: String, Codable, Sendable, CaseIterable {
    // Postura do sistema
    case sipOff = "sip_off"
    case gatekeeperOff = "gatekeeper_off"
    case filevaultOff = "filevault_off"
    case firewallOff = "firewall_off"

    // Persistência e scripts
    case persistCaminho = "persist_caminho"
    case persistSemAssinatura = "persist_sem_assinatura"
    case persistOrfao = "persist_orfao"
    case scriptBg = "script_bg"
    case loginHook = "login_hook"
    case cron
    case perfilShell = "perfil_shell"
    case legado
    case sshChaves = "ssh_chaves"
    case sudoers

    // Permissões, perfis e rede
    case permissaoSensivel = "permissao_sensivel"
    case perfilMDM = "perfil_mdm"
    case acessoRemotoAtivo = "acesso_remoto_ativo"
    case proxy
    case certRaiz = "cert_raiz"

    // Processos e apps
    case procCaminho = "proc_caminho"
    case procSemAssinatura = "proc_sem_assinatura"
    case procDev = "proc_dev"
    case appSemAssinatura = "app_sem_assinatura"
    case indicadorConhecido = "indicador_conhecido"

    // Desempenho
    case memPressao = "mem_pressao"
    case swapAlto = "swap_alto"
    case kernelTask = "kernel_task"
    case termico
    case cpuAlto = "cpu_alto"
    case cargaAlta = "carga_alta"
    case discoCheio = "disco_cheio"
    case smartFalha = "smart_falha"
    case panic
    case spotlight
    case timemachine
    case uptime
    case poucaRAM = "pouca_ram"
    case poucaEnergia = "pouca_energia"
    case bateria
    case travamentos
    case muitosAgentes = "muitos_agentes"
}
