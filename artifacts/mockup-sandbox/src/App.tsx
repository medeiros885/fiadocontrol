import { type ComponentType, useEffect, useRef, useState } from "react";
import {
  AlertCircle, Bell, CheckCircle, ChevronRight,
  DollarSign, Home, MapPin, MessageCircle, Phone,
  Plus, User, UserPlus, Users, X, ShoppingCart, Trash2, HandCoins
} from "lucide-react";

import { modules as discoveredModules } from "./.generated/mockup-components";

/* ─────────────────────────────────────────────────
   Tipos e Utilitários
───────────────────────────────────────────────── */
interface Cliente {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  saldo: number;
  limite: number;
  diasAtraso: number;
  vencimento: string;
}

function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function mascaraTelefone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2)  return d.length ? `(${d}` : "";
  if (d.length <= 7)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7,11)}`;
}

function mascaraMoeda(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function vencimento30Dias(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split("T")[0];
}

const CampoForm = ({
  label, icon: Icon, children,
}: { label: string; icon: any; children: React.ReactNode }) => (
  <div className="flex flex-col gap-2">
    <label className="flex items-center gap-2 text-base font-semibold text-gray-700">
      <Icon size={18} className="text-blue-600 shrink-0" />
      {label}
    </label>
    {children}
  </div>
);

/* ─────────────────────────────────────────────────
   Modal: Lançar Nova Compra ou Receber Pagamento
───────────────────────────────────────────────── */
function ModalMovimentacao({ cliente, tipo, onConfirmar, onFechar }: { 
  cliente: Cliente; 
  tipo: 'compra' | 'pagamento';
  onConfirmar: (valor: number) => void; 
  onFechar: () => void 
}) {
  const [valorStr, setValorStr] = useState("");
  const [erro, setErro] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  function confirmar() {
    const valorNum = parseFloat(valorStr.replace(/\./g, "").replace(",", ".")) || 0;
    if (valorNum <= 0) { setErro("Digite um valor válido."); return; }

    if (tipo === 'compra') {
      const limiteDisponivel = cliente.limite - cliente.saldo;
      if (valorNum > limiteDisponivel) {
        setErro(`Acima do limite livre (${moeda(limiteDisponivel)})`);
        return;
      }
    } else {
      if (valorNum > cliente.saldo) {
        setErro(`Valor maior que a dívida atual (${moeda(cliente.saldo)})`);
        return;
      }
    }

    onConfirmar(valorNum);
  }

  const isPagamento = tipo === 'pagamento';

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/60" onClick={onFechar}>
      <div className="mt-auto bg-white rounded-t-2xl p-6 flex flex-col gap-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{isPagamento ? 'Receber Pagamento' : 'Lançar Compra'}</h2>
            <p className="text-sm text-gray-500">{cliente.nome}</p>
          </div>
          <button onClick={onFechar} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>
        </div>

        <div className={`${isPagamento ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'} p-4 rounded-xl flex justify-between items-center font-bold`}>
           <span className="text-sm">{isPagamento ? 'Dívida Atual:' : 'Limite Livre:'}</span>
           <span>{moeda(isPagamento ? cliente.saldo : cliente.limite - cliente.saldo)}</span>
        </div>

        <div className="relative">
          <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold ${isPagamento ? 'text-green-600' : 'text-blue-600'}`}>R$</span>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            placeholder="0,00"
            value={valorStr}
            onChange={(e) => setValorStr(mascaraMoeda(e.target.value))}
            className={`w-full border-2 rounded-xl pl-14 pr-4 py-4 text-3xl font-bold text-gray-900 focus:outline-none ${isPagamento ? 'border-green-500' : 'border-blue-500'}`}
          />
        </div>

        {erro && <p className="text-red-600 text-sm font-bold flex items-center gap-1"><AlertCircle size={14}/> {erro}</p>}

        <button 
          onClick={confirmar} 
          className={`w-full h-16 rounded-xl text-xl font-bold flex items-center justify-center gap-2 text-white ${isPagamento ? 'bg-green-600' : 'bg-blue-700'}`}
        >
          {isPagamento ? <HandCoins size={24}/> : <ShoppingCart size={24}/>}
          {isPagamento ? 'Confirmar Recebimento' : 'Confirmar Venda'}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Telas e Componentes (Cadastro e Início mantidos)
───────────────────────────────────────────────── */
function ModalCadastro({ onSalvar, onFechar }: { onSalvar: (c: any) => void; onFechar: () => void }) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [limiteStr, setLimiteStr] = useState("");
  const nomeRef = useRef<HTMLInputElement>(null);
  useEffect(() => { nomeRef.current?.focus(); }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/50" onClick={onFechar}>
      <div className="mt-auto bg-white rounded-t-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between mb-6"><h2 className="text-xl font-bold">Novo Cliente</h2><button onClick={onFechar}><X /></button></div>
        <div className="flex flex-col gap-4">
          <CampoForm label="Nome" icon={User}><input ref={nomeRef} className="border-2 rounded-xl p-3" value={nome} onChange={e => setNome(e.target.value)} /></CampoForm>
          <CampoForm label="WhatsApp" icon={Phone}><input className="border-2 rounded-xl p-3" type="tel" value={telefone} onChange={e => setTelefone(mascaraTelefone(e.target.value))} /></CampoForm>
          <CampoForm label="Limite" icon={DollarSign}><input className="border-2 rounded-xl p-3" value={limiteStr} onChange={e => setLimiteStr(mascaraMoeda(e.target.value))} /></CampoForm>
          <button onClick={() => onSalvar({ nome, telefone, limite: parseFloat(limiteStr.replace(/\./g, "").replace(",", ".")) || 0 })} className="bg-blue-700 text-white p-4 rounded-xl font-bold">Salvar</button>
        </div>
      </div>
    </div>
  );
}

function TelaInicio({ clientes, onNovoCliente }: { clientes: Cliente[]; onNovoCliente: () => void }) {
  const totalReceber = clientes.reduce((a, c) => a + c.saldo, 0);
  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-b-4 border-red-500">
        <p className="text-sm font-bold text-gray-400 uppercase">Total a Receber</p>
        <p className="text-4xl font-bold text-red-600">{moeda(totalReceber)}</p>
      </div>
      <button onClick={onNovoCliente} className="bg-green-600 text-white p-5 rounded-xl flex items-center gap-4 font-bold shadow-lg"><UserPlus /> Cadastrar Cliente</button>
    </div>
  );
}

function TelaClientes({ clientes, onNovoCliente, onLancarMov, onApagar }: { 
  clientes: Cliente[]; onNovoCliente: () => void; onLancarMov: (c: Cliente, t: 'compra' | 'pagamento') => void; onApagar: (c: Cliente) => void;
}) {
  return (
    <div className="p-4 flex flex-col gap-3">
      <button onClick={onNovoCliente} className="bg-blue-700 text-white p-4 rounded-xl font-bold flex justify-center gap-2 mb-2"><Plus /> Novo Cadastro</button>
      {clientes.map(c => (
        <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm border-2 border-gray-100 flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div><p className="font-bold text-lg text-gray-900">{c.nome}</p><p className="text-sm text-gray-500">{c.telefone}</p></div>
            <div className="flex flex-col items-end gap-1">
              <button onClick={() => onApagar(c)} className="p-1 text-gray-300"><Trash2 size={18} /></button>
              <p className="text-xl font-black text-red-600">{moeda(c.saldo)}</p>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-blue-600" style={{ width: `${(c.saldo/c.limite)*100}%` }} /></div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button onClick={() => onLancarMov(c, 'compra')} className="bg-blue-50 text-blue-700 p-3 rounded-lg font-bold flex items-center justify-center gap-2 text-xs">
              <Plus size={14}/> COMPRA
            </button>
            <button onClick={() => onLancarMov(c, 'pagamento')} className="bg-green-50 text-green-700 p-3 rounded-lg font-bold flex items-center justify-center gap-2 text-xs">
              <HandCoins size={14}/> PAGOU
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   App Principal
───────────────────────────────────────────────── */
function FiadoControl() {
  const [tela, setTela] = useState<Tela>("inicio");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [modalCadAberto, setModalCadAberto] = useState(false);
  const [movimentacao, setMovimentacao] = useState<{ cliente: Cliente, tipo: 'compra' | 'pagamento' } | null>(null);

  function adicionarCliente(dados: any) {
    setClientes(prev => [{ id: Date.now().toString(), saldo: 0, diasAtraso: 0, vencimento: vencimento30Dias(), ...dados }, ...prev]);
    setModalCadAberto(false);
  }

  function confirmarMovimentacao(valor: number) {
    if (!movimentacao) return;
    const fator = movimentacao.tipo === 'compra' ? 1 : -1;
    setClientes(prev => prev.map(c => c.id === movimentacao.cliente.id ? { ...c, saldo: Math.max(0, c.saldo + (valor * fator)) } : c));
    setMovimentacao(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-700 text-white px-5 pt-10 pb-5"><h1 className="text-3xl font-bold">FiadoControl</h1></header>
      <main className="flex-1 overflow-y-auto pb-24">
        {tela === "inicio" && <TelaInicio clientes={clientes} onNovoCliente={() => setModalCadAberto(true)} />}
        {tela === "clientes" && <TelaClientes clientes={clientes} onNovoCliente={() => setModalCadAberto(true)} onLancarMov={(cliente, tipo) => setMovimentacao({ cliente, tipo })} onApagar={c => confirm(`Apagar ${c.nome}?`) && setClientes(prev => prev.filter(x => x.id !== c.id))} />}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex h-16 shadow-lg">
        <button onClick={() => setTela("inicio")} className={`flex-1 flex flex-col items-center justify-center ${tela === "inicio" ? "text-blue-700" : "text-gray-400"}`}><Home size={24}/></button>
        <button onClick={() => setTela("clientes")} className={`flex-1 flex flex-col items-center justify-center ${tela === "clientes" ? "text-blue-700" : "text-gray-400"}`}><Users size={24}/></button>
      </nav>
      {modalCadAberto && <ModalCadastro onSalvar={adicionarCliente} onFechar={() => setModalCadAberto(false)} />}
      {movimentacao && <ModalMovimentacao cliente={movimentacao.cliente} tipo={movimentacao.tipo} onConfirmar={confirmarMovimentacao} onFechar={() => setMovimentacao(null)} />}
    </div>
  );
}

export default function App() { return <FiadoControl />; }
