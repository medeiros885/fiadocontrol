export interface Cliente {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  saldoDevedor: number;
  limiteCredito: number;
  diasAtraso: number;
  vencimento: string;
}

export const clientes: Cliente[] = [];

export const resumoFinanceiro = {
  totalAReceber: 0,
  totalEmAtraso: 0,
  clientesAtivos: 0,
  clientesEmAtraso: 0,
};
