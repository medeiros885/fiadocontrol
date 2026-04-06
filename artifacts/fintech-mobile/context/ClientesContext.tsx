import React, { createContext, useContext, useState } from "react";

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

interface ClientesContextType {
  clientes: Cliente[];
  adicionarCliente: (dados: Omit<Cliente, "id" | "saldoDevedor" | "diasAtraso" | "vencimento">) => void;
}

const ClientesContext = createContext<ClientesContextType>({
  clientes: [],
  adicionarCliente: () => {},
});

export function ClientesProvider({ children }: { children: React.ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  function adicionarCliente(dados: Omit<Cliente, "id" | "saldoDevedor" | "diasAtraso" | "vencimento">) {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    const vencimento = d.toISOString().split("T")[0];
    const novo: Cliente = {
      id: Date.now().toString(),
      saldoDevedor: 0,
      diasAtraso: 0,
      vencimento,
      ...dados,
    };
    setClientes((prev) => [novo, ...prev]);
  }

  return (
    <ClientesContext.Provider value={{ clientes, adicionarCliente }}>
      {children}
    </ClientesContext.Provider>
  );
}

export function useClientes() {
  return useContext(ClientesContext);
}
