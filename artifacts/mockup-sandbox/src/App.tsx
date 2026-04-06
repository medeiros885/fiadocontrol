import { type ComponentType, useEffect, useRef, useState } from "react";
import {
  AlertCircle, Bell, CheckCircle, ChevronRight,
  DollarSign, Home, MapPin, MessageCircle, Phone,
  Plus, User, UserPlus, Users, X,
} from "lucide-react";

import { modules as discoveredModules } from "./.generated/mockup-components";

/* ─────────────────────────────────────────────────
   Tipos e Utilitários (Mantidos)
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
   Bottom Nav (Mantido)
───────────────────────────────────────────────── */
type Tela = "inicio" | "clientes" | "cobrancas";

function BottomNav({ ativa, onChange }: { ativa: Tela; onChange: (t: Tela) => void }) {
  const itens: { id: Tela; label: string; Icon: typeof Home }[] = [
    { id: "inicio",    label: "Início",   Icon: Home },
    { id: "clientes",  label: "Clientes", Icon: Users },
    { id: "cobrancas", label: "Cobrar",   Icon: Bell },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50 shadow-lg">
      {itens.map(({ id, label, Icon }) => {
        const active = ativa === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`relative flex-1 flex flex-col items-center justify-center h-16 gap-1 transition-colors
              ${active ? "text-blue-700" : "text-gray-500 hover:text-gray-700"}`}
          >
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-blue-700 rounded-b-full" />
            )}
            <Icon size={26} strokeWidth={active ? 2.5 : 2} />
            <span className={`text-xs font-semibold ${active ? "text-blue-700" : "text-gray-500"}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

/* ─────────────────────────────────────────────────
   Modal Cadastro (Mantido)
───────────────────────────────────────────────── */
interface ModalCadastroProps {
  onSalvar: (c: Omit<Cliente, "id" | "saldo" | "diasAtraso" | "vencimento">) => void;
  onFechar: () => void;
}

function ModalCadastro({ onSalvar, onFechar }: ModalCadastroProps) {
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [limiteStr, setLimiteStr] = useState("");
  const [erro, setErro] = useState("");

  const nomeRef = useRef<HTMLInputElement>(null);
  useEffect(() => { nomeRef.current?.focus(); }, []);

  function handleTel(v: string) { setTelefone(mascaraTelefone(v)); }
  function handleLimite(v: string) { setLimiteStr(mascaraMoeda(v)); }

  function salvar() {
    if (!nome.trim()) { setErro("Informe o nome."); return; }
    if (telefone.replace(/\D/g, "").length < 10) { setErro("DDD + Número."); return; }
    if (!limiteStr) { setErro("Informe o limite."); return; }
    const limiteNum = parseFloat(limiteStr.replace(/\./g, "").replace(",", ".")) || 0;
    onSalvar({ nome: nome.trim(), endereco: endereco.trim(), telefone, limite: limiteNum });
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/50" onClick={onFechar}>
      <div className="mt-auto bg-white rounded-t-2xl flex flex-col max-h-[92vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Cadastrar Novo Cliente</h2>
          <button onClick={onFechar} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100"><X size={20} /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-5">
          <CampoForm label="Nome Completo" icon={User}><input ref={nomeRef} type="text" value={nome} onChange={(e) => setNome(e.target.value)} className="w-full border-2 rounded-xl px-4 py-3 text-lg" /></CampoForm>
          <CampoForm label="Endereço" icon={MapPin}><input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} className="w-full border-2 rounded-xl px-4 py-3 text-lg" /></CampoForm>
          <CampoForm label="Telefone WhatsApp" icon={Phone}><input type="tel" value={telefone} onChange={(e) => handleTel(e.target.value)} className="w-full border-2 rounded-xl px-4 py-3 text-lg" /></CampoForm>
          <CampoForm label="Limite de Crédito" icon={DollarSign}><input type="text" value={limiteStr} onChange={(e) => handleLimite(e.target.value)} className="w-full border-2 rounded-xl px-4 py-3 text-lg" /></CampoForm>
        </div>
        <div className="px-5 pb-6 pt-3 border-t"><button onClick={salvar} className="w-full h-14 bg-green-600 text-white rounded-xl text-xl font-bold">Salvar Cliente</button></div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Tela Início (COM O NOVO BOTÃO)
───────────────────────────────────────────────── */
function TelaInicio({ 
  clientes, onChange, onNovoCliente 
}: { clientes: Cliente[]; onChange: (t: Tela) => void; onNovoCliente: () => void }) {
  const emAtraso = clientes.filter((c) => c.diasAtraso > 0);
  const totalReceber = clientes.reduce((a, c) => a + c.saldo, 0);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center gap-2">
        <p className="text-sm font-semibold text-gray-500 uppercase">Total a Receber</p>
        <p className="text-4xl font-bold text-red-600">{moeda(totalReceber)}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center gap-1">
          <Users size={24} className="text-blue-600" />
          <p className="text-xl font-bold">{clientes.length}</p>
          <p className="text-[10px] text-gray-500 uppercase">Clientes</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-100 p-4 flex flex-col items-center gap-1">
          <AlertCircle size={24} className="text-red-600" />
          <p className="text-xl font-bold text-red-600">{emAtraso.length}</p>
          <p className="text-[10px] text-red-500 uppercase font-bold">Atraso</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 p-4 flex flex-col items-center gap-1">
          <CheckCircle size={24} className="text-green-600" />
          <p className="text-xl font-bold text-green-600">{clientes.length - emAtraso.length}</p>
          <p className="text-[10px] text-green-600 uppercase font-bold">Em Dia</p>
        </div>
      </div>

      <p className="text-lg font-bold text-gray-900 mt-2">O que você quer fazer?</p>

      {/* NOVO BOTÃO: CADASTRAR CLIENTE */}
      <button
        onClick={onNovoCliente}
        className="bg-green-600 text-white rounded-xl p-5 flex items-center gap-4 active:opacity-80 transition-opacity shadow-md"
      >
        <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center shrink-0">
          <UserPlus size={26} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-lg font-bold">Cadastrar Cliente</p>
          <p className="text-sm text-green-100">Adicionar novo nome à lista</p>
        </div>
        <ChevronRight size={22} />
      </button>

      <button
        onClick={() => onChange("clientes")}
        className="bg-blue-700 text-white rounded-xl p-5 flex items-center gap-4 active:opacity-80 transition-opacity"
      >
        <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center shrink-0">
          <Users size={26} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-lg font-bold">Ver Clientes</p>
          <p className="text-sm text-blue-200">Lista completa e saldos</p>
        </div>
        <ChevronRight size={22} />
      </button>

      <button
        onClick={() => onChange("cobrancas")}
        className="bg-orange-600 text-white rounded-xl p-5 flex items-center gap-4 active:opacity-80 transition-opacity"
      >
        <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center shrink-0">
          <Bell size={26} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-lg font-bold">Fazer Cobrança</p>
          <p className="text-sm text-orange-100">{emAtraso.length} pendentes</p>
        </div>
        <ChevronRight size={22} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Telas Secundárias (Simplificadas para o exemplo)
───────────────────────────────────────────────── */
function TelaClientes({ clientes, onNovoCliente }: { clientes: Cliente[]; onNovoCliente: () => void }) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <button onClick={onNovoCliente} className="w-full flex items-center justify-center gap-3 bg-blue-700 text-white rounded-xl py-4 font-bold shadow-md">
        <Plus size={24} /> Novo Cadastro
      </button>
      {clientes.map(c => (
        <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm border flex justify-between items-center">
          <div><p className="font-bold">{c.nome}</p><p className="text-xs text-gray-400">{c.telefone}</p></div>
          <p className="font-bold text-blue-700">{moeda(c.saldo)}</p>
        </div>
      ))}
    </div>
  );
}

function TelaCobrancas({ clientes }: { clientes: Cliente[] }) {
  const emAtraso = clientes.filter(c => c.diasAtraso > 0);
  return (
    <div className="p-4 flex flex-col gap-4">
      {emAtraso.length === 0 ? <p className="text-center text-gray-500 mt-10">Tudo em dia!</p> : emAtraso.map(c => <div key={c.id} className="bg-white p-4 rounded-xl border-l-4 border-red-500 font-bold">{c.nome} - {moeda(c.saldo)}</div>)}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   App Principal
───────────────────────────────────────────────── */
function FiadoControl() {
  const [tela, setTela] = useState<Tela>("inicio");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [modalAberto, setModalAberto] = useState(false);

  function adicionarCliente(dados: Omit<Cliente, "id" | "saldo" | "diasAtraso" | "vencimento">) {
    const novo: Cliente = {
      id: Date.now().toString(),
      saldo: 0,
      diasAtraso: 0,
      vencimento: vencimento30Dias(),
      ...dados,
    };
    setClientes((prev) => [novo, ...prev]);
    setModalAberto(false);
    setTela("clientes");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className={`${tela === "cobrancas" ? "bg-orange-600" : "bg-blue-700"} text-white px-5 pt-10 pb-5`}>
        <h1 className="text-3xl font-bold">FiadoControl</h1>
        <p className="text-sm opacity-70">Controle de fiados e cobranças</p>
      </header>
      <main className="flex-1 overflow-y-auto pb-20">
        {tela === "inicio" && <TelaInicio clientes={clientes} onChange={setTela} onNovoCliente={() => setModalAberto(true)} />}
        {tela === "clientes" && <TelaClientes clientes={clientes} onNovoCliente={() => setModalAberto(true)} />}
        {tela === "cobrancas" && <TelaCobrancas clientes={clientes} />}
      </main>
      <BottomNav ativa={tela} onChange={setTela} />
      {modalAberto && <ModalCadastro onSalvar={adicionarCliente} onFechar={() => setModalAberto(false)} />}
    </div>
  );
}

export default function App() {
  return <FiadoControl />;
}
