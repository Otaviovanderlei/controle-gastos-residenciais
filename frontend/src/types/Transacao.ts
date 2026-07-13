export const TipoTransacao = {
  Despesa: 1,
  Receita: 2,
} as const;

export type TipoTransacao =
  (typeof TipoTransacao)[keyof typeof TipoTransacao];

export interface Transacao {
  id: number;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  pessoaId: number;
  pessoaNome: string;
}

export interface CriarTransacao {
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  pessoaId: number;
}