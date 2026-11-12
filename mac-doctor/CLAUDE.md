# mac-doctor — instruções para agentes

Leia `docs/SPEC.md` antes de qualquer mudança. Ele é a fonte de verdade de escopo, contratos e marcos.

## Contexto em cinco linhas
- App nativo de macOS (Swift 6, SwiftUI + AppKit) que diagnostica segurança e desempenho e oferece correções reversíveis.
- Dois processos: app sem privilégio e helper root sob demanda (`SMAppService` + XPC com requisito de assinatura).
- Regras locais decidem severidade e ações. A IA (chave do usuário) só explica e prioriza.
- `prototype/mac-doctor.py` é o oráculo de comportamento das regras, não um modelo de arquitetura.
- Idioma do produto e dos textos: pt-BR.

## Como trabalhar
- Um marco por vez (SPEC seção 15). Cite no PR os requisitos (RF/RNF) que a mudança cobre.
- Lógica vai em pacote Swift local testável com `swift test`; o alvo do app fica fino.
- Compilar, assinar e notarizar exige Mac com Xcode. Em sessão de nuvem Linux só dá para trabalhar em documentos e no protótipo.
- Comando do sistema só onde não houver API pública: caminho absoluto, argumentos fixos, tempo limite.

## Nunca, sem aprovação explícita do dono
1. Verbo no helper que aceite comando, caminho livre ou argumentos arbitrários.
2. Afrouxar o requisito de assinatura do XPC ou validar o chamador por PID.
3. Rede no helper.
4. Ação que apague arquivo ou não tenha desfazer, fora do catálogo da SPEC 10.1.
5. Severidade, contagem ou texto de achado dependendo da licença.
6. IA alterando severidade, criando achado ou acionando correção.
7. Envio de dado de varredura, caminho, nome de processo ou script a qualquer servidor.
8. `@unchecked Sendable` (ou equivalente) para silenciar erro de concorrência.
9. Edição manual de `project.pbxproj`.
10. Segredo de assinatura, chave de API ou chave privada de licença no repositório.
11. Desativar ou pular teste para o build passar.

## Pare e pergunte quando
- Uma decisão em aberto (SPEC seção 2) bloquear o trabalho.
- O macOS se comportar diferente de uma premissa da SPEC 6.3.
- Um requisito só puder ser cumprido violando a lista acima.

## Pronto significa
Compila sem avisos novos, testes do pacote passam, requisitos citados, e qualquer mudança no helper ou no protocolo passou por revisão de segurança.
