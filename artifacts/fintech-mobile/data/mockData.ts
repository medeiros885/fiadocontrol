export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  saldoDevedor: number;
  limiteCredito: number;
  diasAtraso: number;
  vencimento: string;
}

export const clientes: Cliente[] = [
  {
    id: "1",
    nome: "Maria Silva",
    telefone: "5511999887766",
    saldoDevedor: 1250.0,
    limiteCredito: 5000.0,
    diasAtraso: 0,
    vencimento: "2026-04-20",
  },
  {
    id: "2",
    nome: "João Pereira",
    telefone: "5511988776655",
    saldoDevedor: 3800.0,
    limiteCredito: 4000.0,
    diasAtraso: 15,
    vencimento: "2026-03-22",
  },
  {
    id: "3",
    nome: "Ana Souza",
    telefone: "5511977665544",
    saldoDevedor: 750.0,
    limiteCredito: 2000.0,
    diasAtraso: 0,
    vencimento: "2026-04-25",
  },
  {
    id: "4",
    nome: "Carlos Lima",
    telefone: "5511966554433",
    saldoDevedor: 2100.0,
    limiteCredito: 3000.0,
    diasAtraso: 7,
    vencimento: "2026-03-30",
  },
  {
    id: "5",
    nome: "Fernanda Costa",
    telefone: "5511955443322",
    saldoDevedor: 4500.0,
    limiteCredito: 6000.0,
    diasAtraso: 32,
    vencimento: "2026-03-05",
  },
  {
    id: "6",
    nome: "Roberto Alves",
    telefone: "5511944332211",
    saldoDevedor: 320.0,
    limiteCredito: 1500.0,
    diasAtraso: 0,
    vencimento: "2026-05-01",
  },
  {
    id: "7",
    nome: "Patricia Rocha",
    telefone: "5511933221100",
    saldoDevedor: 1900.0,
    limiteCredito: 2500.0,
    diasAtraso: 3,
    vencimento: "2026-04-03",
  },
];

export const resumoFinanceiro = {
  totalAReceber: clientes.reduce((acc, c) => acc + c.saldoDevedor, 0),
  totalEmAtraso: clientes
    .filter((c) => c.diasAtraso > 0)
    .reduce((acc, c) => acc + c.saldoDevedor, 0),
  clientesAtivos: clientes.length,
  clientesEmAtraso: clientes.filter((c) => c.diasAtraso > 0).length,
};
