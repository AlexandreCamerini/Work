import type { Pergunta } from '../types'

/**
 * Perguntas em escala Likert. Formuladas de forma direcional (concordar = posição
 * mais associada a um lado do espectro) apenas para permitir a comparação numérica;
 * a UI nunca rotula isso como "esquerda/direita".
 */
export const perguntas: Pergunta[] = [
  { id: 'econ-1', eixoId: 'economia', texto: 'O Estado deveria reduzir impostos sobre empresas para estimular a geração de empregos.' },
  { id: 'econ-2', eixoId: 'economia', texto: 'Estatais estratégicas devem permanecer sob controle público, mesmo com prejuízo de eficiência.' },
  { id: 'econ-3', eixoId: 'economia', texto: 'Programas de transferência de renda devem ser ampliados como política permanente.' },

  { id: 'saude-1', eixoId: 'saude', texto: 'O investimento federal no SUS deve crescer mesmo que exija aumento de outros impostos.' },
  { id: 'saude-2', eixoId: 'saude', texto: 'Planos de saúde privados devem ter mais liberdade regulatória para reduzir custos.' },
  { id: 'saude-3', eixoId: 'saude', texto: 'A gestão de hospitais públicos deveria poder ser terceirizada para organizações privadas.' },

  { id: 'edu-1', eixoId: 'educacao', texto: 'Universidades públicas deveriam ter mais autonomia para cobrar de quem pode pagar.' },
  { id: 'edu-2', eixoId: 'educacao', texto: 'O ensino técnico e profissionalizante deve receber prioridade de investimento sobre o ensino superior.' },
  { id: 'edu-3', eixoId: 'educacao', texto: 'O currículo escolar nacional deve ser definido centralmente pelo governo federal.' },

  { id: 'seg-1', eixoId: 'seguranca', texto: 'O porte de armas para cidadãos sem antecedentes deveria ser facilitado.' },
  { id: 'seg-2', eixoId: 'seguranca', texto: 'A posse de pequenas quantidades de drogas para uso pessoal deveria ser descriminalizada.' },
  { id: 'seg-3', eixoId: 'seguranca', texto: 'O investimento em policiamento ostensivo deve crescer mesmo reduzindo verba de outras áreas.' },

  { id: 'amb-1', eixoId: 'meio-ambiente', texto: 'O licenciamento ambiental para novos empreendimentos deveria ser simplificado.' },
  { id: 'amb-2', eixoId: 'meio-ambiente', texto: 'Metas de redução de desmatamento devem ter força de lei com sanções severas.' },
  { id: 'amb-3', eixoId: 'meio-ambiente', texto: 'A exploração de combustíveis fósseis deve ser expandida para gerar receita ao Estado.' },

  { id: 'dir-1', eixoId: 'direitos', texto: 'Políticas de cotas raciais e sociais devem continuar existindo no serviço público e universidades.' },
  { id: 'dir-2', eixoId: 'direitos', texto: 'A união civil e adoção por casais do mesmo sexo deve ter os mesmos direitos que a união heterossexual.' },
  { id: 'dir-3', eixoId: 'direitos', texto: 'Movimentos sociais organizados devem ter papel formal na formulação de políticas públicas.' },
]
