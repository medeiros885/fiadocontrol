import { type ComponentType, useEffect, useRef, useState } from "react";
import {
  AlertCircle, Bell, CheckCircle, ChevronRight,
  DollarSign, Home, MapPin, MessageCircle, Phone,
  Plus, User, Users, X,
} from "lucide-react";

import { modules as discoveredModules } from "./.generated/mockup-components";

/* ─────────────────────────────────────────────────
   Tipos
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

/* ─────────────────────────────────────────────────
   Utilitários
───────────────────────────────────────────────── */
function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function dataFmt(d: string) {
  return new Date(d + "T12:00:00").toLocaleDateString("pt-BR");
}

function whatsLink(tel: string, msg: string) {
  return `https://wa.me/${tel.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
}

function msgNoDia(nome: string, valor: string) {
  return `Olá, ${nome}! Tudo bem? Passando aqui rapidinho para avisar que hoje é o dia do fechamento da sua conta aqui no comércio, no valor de R$ ${valor}. Você prefere passar aqui hoje para acertar ou quer que eu te mande a minha chave PIX? Um abraço!`;
}

function msgEmAtraso(nome: string, valor: string) {
  return `Olá, ${nome}, tudo bem? Dei uma olhada aqui no sistema e vi que ficou uma pendência de R$ ${valor}. Aconteceu algum imprevisto? Me avise se você vem acertar hoje ou se prefere que eu envie o PIX para facilitar. Fico no aguardo!`;
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

/* ─────────────────────────────────────────────────
   Componentes Auxiliares (Fora dos principais para evitar bug do teclado)
───────────────────────────────────────────────── */
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
   Bottom Nav
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
   Modal: Cadastrar Novo Cliente
───────────────────────────────────────────────── */
interface ModalCadastroProps {
  onSalvar: (c: Omit<Cliente, "id" | "saldo" | "diasAtraso" | "vencimento">) => void;
  onFechar: () => void;
}

function ModalCadastro({ onSalvar, onFechar }: ModalCadastroProps) {
  const [nome,      setNome]      = useState("");
  const [endereco,  setEndereco]  = useState("");
  const [telefone,  setTelefone]  = useState("");
  const [limiteStr, setLimiteStr] = useState("");
  const [erro,      setErro]      = useState("");

  const nomeRef = useRef<HTMLInputElement>(null);
  useEffect(() => { nomeRef.current?.focus(); }, []);

  function handleTel(v: string) { setTelefone(mascaraTelefone(v)); }
  function handleLimite(v: string) { setLimiteStr(mascaraMoeda(v)); }

  function salvar() {
    if (!nome.trim()) { setErro("Por favor, informe o nome do cliente."); return; }
    if (telefone.replace(/\D/g, "").length < 10) { setErro("Informe o telefone com DDD (mín. 10 dígitos)."); return; }
    if (!limiteStr) { setErro("Informe o limite de crédito."); return; }

    const limiteNum = parseFloat(limiteStr.replace(/\./g, "").replace(",", ".")) || 0;
    if (limiteNum <= 0) { setErro("O limite de crédito deve ser maior que zero."); return; }

    onSalvar({ nome: nome.trim(), endereco: endereco.trim(), telefone, limite: limiteNum });
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/50" onClick={onFechar}>
      <div
        className="mt-auto bg-white rounded-t-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Cadastrar Novo Cliente</h2>
          <button
            onClick={onFechar}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-5">
          <CampoForm label="Nome Completo" icon={User}>
            <input
              ref={nomeRef}
              type="text"
              placeholder="Ex: Maria da Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </CampoForm>

          <CampoForm label="Endereço" icon={MapPin}>
            <input
              type="text"
              placeholder="Ex: Rua das Flores, 123"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </CampoForm>

          <CampoForm label="Telefone WhatsApp" icon={Phone}>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={(e) => handleTel(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none tracking-wider transition-colors"
            />
          </CampoForm>

          <CampoForm label="Limite de Crédito" icon={DollarSign}>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-green-600 select-none">
                R$
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="0,00"
                value={limiteStr}
                onChange={(e) => handleLimite(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl pl-14 pr-4 py-3 text-xl font-bold text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
              />
            </div>
          </CampoForm>

          {erro && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
              <AlertCircle size={16} className="shrink-0" />
              {erro}
            </div>
          )}
        </div>

        <div className="px-5 pb-6 pt-3 border-t border-gray-100">
          <button
            onClick={salvar}
            className="w-full h-14 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-xl text-xl font-bold flex items-center justify-center gap-3 transition-colors shadow-lg"
          >
            <CheckCircle size={24} />
            Salvar Cliente
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Telas (Inicio, Clientes, Cobranças permanecem iguais)
───────────────────────────────────────────────── */
function TelaInicio({ clientes, onChange }: { clientes: Cliente[]; onChange: (t: Tela) => void }) {
  const emAtraso = clientes.filter((c) => c.diasAtraso > 0);
  const totalReceber = clientes.reduce((a, c) => a + c.saldo, 0);
  const totalAtrasado = emAtraso.reduce((a, c) => a + c.saldo, 0);
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center gap-3">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total a Receber</p>
        <p className="text-4xl font-bold text-red-600">{moeda(totalReceber)}</p>
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-semibold">
          <AlertCircle size={16} /> {moeda(totalAtrasado)} em atraso
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center gap-2">
          <Users size={28} className="text-blue-600" />
          <p className="text-2xl font-bold text-gray-900">{clientes.length}</p>
          <p className="text-xs text-gray-500 text-center">Clientes</p>
        </div>
        <div className="bg-red-50 rounded-xl border-2 border-red-200 p-4 flex flex-col items-center gap-2">
          <AlertCircle size={28} className="text-red-600" />
          <p className="text-2xl font-bold text-red-600">{emAtraso.length}</p>
          <p className="text-xs text-red-500 text-center font-medium">Em Atraso</p>
        </div>
        <div className="bg-green-50 rounded-xl border-2 border-green-200 p-4 flex flex-col items-center gap-2">
          <CheckCircle size={28} className="text-green-600" />
          <p className="text-2xl font-bold text-green-600">{clientes.length - emAtraso.length}</p>
          <p className="text-xs text-green-600 text-center font-medium">Em Dia</p>
        </div>
      </div>
      <p className="text-lg font-bold text-gray-900 mt-2">O que você quer fazer?</p>
      <button onClick={() => onChange("clientes")} className="bg-blue-700 text-white rounded-xl p-5 flex items-center gap-4 active:opacity-80 transition-opacity">
        <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center shrink-0"><Users size={26} /></div>
        <div className="flex-1 text-left"><p className="text-lg font-bold">Ver Clientes</p><p className="text-sm text-blue-200">Lista completa</p></div>
        <ChevronRight size={22} />
      </button>
      <button onClick={() => onChange("cobrancas")} className="bg-green-700 text-white rounded-xl p-5 flex items-center gap-4 active:opacity-80 transition-opacity">
        <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center shrink-0"><Bell size={26} /></div>
        <div className="flex-1 text-left"><p className="text-lg font-bold">Fazer Cobrança</p><p className="text-sm text-green-200">{emAtraso.length} pendentes</p></div>
        <ChevronRight size={22} />
      </button>
    </div>
  );
}

function TelaClientes({ clientes, onNovoCliente }: { clientes: Cliente[]; onNovoCliente: () => void }) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <button onClick={onNovoCliente} className="w-full flex items-center justify-center gap-3 bg-blue-700 text-white rounded-xl py-4 text-lg font-bold shadow-md">
        <Plus size={24} strokeWidth={2.5} /> Cadastrar Novo Cliente
      </button>
      {clientes.map((c) => (
        <div key={c.id} className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-4 border-2 border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold">{c.nome[0].toUpperCase()}</div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-gray-900 truncate">{c.nome}</p>
              <p className="text-sm text-gray-400">{c.telefone}</p>
            </div>
            <div className="text-right"><p className="text-lg font-bold text-gray-900">{moeda(c.saldo)}</p></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TelaCobrancas({ clientes }: { clientes: Cliente[] }) {
  const emAtraso = clientes.filter((c) => c.diasAtraso > 0);
  return (
    <div className="flex flex-col gap-4 p-4">
      {emAtraso.length === 0 ? (
        <div className="text-center p-10"><p>Tudo em dia!</p></div>
      ) : (
        emAtraso.map((c) => <div key={c.id} className="p-4 bg-white rounded-xl shadow">{c.nome}</div>)
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   App principal
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

  const headerBg: Record<Tela, string> = { inicio: "bg-blue-700", clientes: "bg-blue-700", cobrancas: "bg-red-700" };
  const headerTitle: Record<Tela, string> = { inicio: "FiadoControl", clientes: "Clientes", cobrancas: "Cobranças" };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className={`${headerBg[tela]} text-white px-5 pt-10 pb-5`}>
        <h1 className="text-3xl font-bold">{headerTitle[tela]}</h1>
      </header>
      <main className="flex-1 overflow-y-auto pb-20">
        {tela === "inicio" && <TelaInicio clientes={clientes} onChange={setTela} />}
        {tela === "clientes" && <TelaClientes clientes={clientes} onNovoCliente={() => setModalAberto(true)} />}
        {tela === "cobrancas" && <TelaCobrancas clientes={clientes} />}
      </main>
      <BottomNav ativa={tela} onChange={setTela} />
      {modalAberto && <ModalCadastro onSalvar={adicionarCliente} onFechar={() => setModalAberto(false)} />}
    </div>
  );
}

export default function App() {
  const previewPath = (import.meta as any).env?.BASE_URL ? window.location.pathname.replace(import.meta.env.BASE_URL, "") : window.location.pathname;
  if (previewPath.includes("/preview/")) return <div>Preview Mode</div>;
  return <FiadoControl />;
}
