/**
 * Mapa das ilustrações das cenas (guia em pipeline/ux/F-ilustracoes.md).
 * Este módulo chega por import() dinâmico (./carregar.ts) quando a eleição abre: não entra no
 * JS inicial. Procura por id da cena, depois pelo grupo, depois pelo tema; senão, a genérica.
 */
import type { ComponentType } from 'react'
import { CaminhaoPipa, Clima, EnchenteSul, EncostaSerra, FaltaAgua, FumacaQueimada, GaragemAlagada, RuaAlagada, SecaNordeste } from './agua-clima'
import { DinheiroPublico, Energia, ImpostoRenda, Juros, Renda } from './dinheiro'
import { Escola, EscolaBagunca, PagarFaculdade } from './escola'
import { Generica, Internet } from './outros'
import { EspecialistaLonge, FilaEspecialista, FilaSus, PlanoVoltouSus, SaudeInterior } from './saude'
import { CelularRoubado, CelularSinal, CorreriaPraia, Faccao, MedidaProtetiva, OperacaoPolicial, RouboCarro, ViaExpressaFechada } from './seguranca'
import { CustoContratar, FaltaTecnico, Jornada, LicencaEmpresa, PrimoDesempregado, ServidorRecomposicao, TrabalhoApp } from './trabalho'
import { BarcaLeste, EstradaInterior, PassagemCara, TransitoCarro, TremParado, ValeTransporte } from './transporte'

/** Por id de cena (variantes que mudam muito a cena). */
export const porId: Record<string, ComponentType> = {
  'barca-leste': BarcaLeste,
  'estrada-interior': EstradaInterior,
  'transito-carro': TransitoCarro,
  'vale-transporte': ValeTransporte,
  'saude-interior': SaudeInterior,
  'plano-voltou-sus': PlanoVoltouSus,
  'especialista-longe': EspecialistaLonge,
  'falta-tecnico': FaltaTecnico,
  'via-expressa-fechada': ViaExpressaFechada,
  'roubo-carro': RouboCarro,
  'celular-sinal': CelularSinal,
  'correria-praia': CorreriaPraia,
  'encosta-serra': EncostaSerra,
  'garagem-alagada': GaragemAlagada,
  'caminhao-pipa': CaminhaoPipa,
  'enchente-sul': EnchenteSul,
  'fumaca-queimada': FumacaQueimada,
  'seca-nordeste': SecaNordeste,
  'servidor-recomposicao': ServidorRecomposicao,
  'licenca-empresa': LicencaEmpresa,
  'custo-contratar': CustoContratar,
  'trabalho-app': TrabalhoApp,
  'imposto-renda': ImpostoRenda,
  'pagar-faculdade': PagarFaculdade,
}

/** Por grupo (a cena padrão e as variantes parecidas). */
export const porGrupo: Record<string, ComponentType> = {
  // governador RJ
  'trem-parado': TremParado,
  'passagem-cara': PassagemCara,
  'fila-especialista': FilaEspecialista,
  'escola-bagunca': EscolaBagunca,
  'operacao-policial': OperacaoPolicial,
  'celular-roubado': CelularRoubado,
  'medida-protetiva': MedidaProtetiva,
  'rua-alagada': RuaAlagada,
  'falta-agua': FaltaAgua,
  'primo-desempregado': PrimoDesempregado,
  orla: CorreriaPraia,
  'dinheiro-publico': DinheiroPublico,
  // presidente
  jornada: Jornada,
  renda: Renda,
  juros: Juros,
  'fila-sus': FilaSus,
  faccao: Faccao,
  celular: CelularRoubado,
  escola: Escola,
  energia: Energia,
  clima: Clima,
  internet: Internet,
  contas: DinheiroPublico,
  mulheres: MedidaProtetiva,
}

/** Por tema, para cenas novas que ainda não têm desenho próprio. */
export const porTema: Record<string, ComponentType> = {
  transporte: PassagemCara,
  saude: FilaEspecialista,
  educacao: EscolaBagunca,
  seguranca: CelularRoubado,
  trabalho: PrimoDesempregado,
  'agua-chuva': RuaAlagada,
  mulheres: MedidaProtetiva,
  contas: DinheiroPublico,
  economia: Renda,
  energia: Energia,
  clima: Clima,
  internet: Internet,
}

export function ilustracaoDe(pergunta: { id: string; grupo: string; tema?: string }): ComponentType {
  return porId[pergunta.id] ?? porGrupo[pergunta.grupo] ?? (pergunta.tema ? porTema[pergunta.tema] : undefined) ?? Generica
}

export { Generica }
