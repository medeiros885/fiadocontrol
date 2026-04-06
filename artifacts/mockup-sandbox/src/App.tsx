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

// Máscara: (XX) XXXXX-XXXX
function mascaraTelefone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2)  return d.length ? `(${d}` : "";
  if (d.length <= 7)  return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7,11)}`;
}

// Formata valor durante digitação: 1234 → "12,34"
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

  // Campo reutilizável
  const Campo = ({
    label, icon: Icon, children,
  }: { label: string; icon: typeof User; children: React.ReactNode }) => (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-base font-semibold text-gray-700">
        <Icon size={18} className="text-blue-600 shrink-0" />
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/50" onClick={onFechar}>
      <div
        className="mt-auto bg-white rounded-t-2xl flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do modal */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Cadastrar Novo Cliente</h2>
          <button
            onClick={onFechar}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Formulário com scroll */}
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-5">

          {/* Nome */}
          <Campo label="Nome Completo" icon={User}>
            <input
              ref={nomeRef}
              type="text"
              placeholder="Ex: Maria da Silva"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </Campo>

          {/* Endereço */}
          <Campo label="Endereço" icon={MapPin}>
            <input
              type="text"
              placeholder="Ex: Rua das Flores, 123"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </Campo>

          {/* Telefone */}
          <Campo label="Telefone WhatsApp" icon={Phone}>
            <input
              type="tel"
              inputMode="numeric"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={(e) => handleTel(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none tracking-wider transition-colors"
            />
          </Campo>

          {/* Limite de crédito */}
          <Campo label="Limite de Crédito" icon={DollarSign}>
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
            {limiteStr && (
              <p className="text-sm text-green-700 font-medium pl-1">
                Limite: R$ {limiteStr}
              </p>
            )}
          </Campo>

          {/* Erro */}
          {erro && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
              <AlertCircle size={16} className="shrink-0" />
              {erro}
            </div>
          )}
        </div>

        {/* Botão salvar fixo no fundo */}
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
   Tela: Início / Dashboard
───────────────────────────────────────────────── */
function TelaInicio({
  clientes, onChange,
}: { clientes: Cliente[]; onChange: (t: Tela) => void }) {
  const emAtraso    = clientes.filter((c) => c.diasAtraso > 0);
  const totalReceber = clientes.reduce((a, c) => a + c.saldo, 0);
  const totalAtrasado = emAtraso.reduce((a, c) => a + c.saldo, 0);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Cartão principal */}
      <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center gap-3">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Total a Receber
        </p>
        <p className="text-4xl font-bold text-red-600">{moeda(totalReceber)}</p>
        <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-sm font-semibold">
          <AlertCircle size={16} />
          {moeda(totalAtrasado)} em atraso
        </div>
      </div>

      {/* Cards de resumo */}
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

      {/* Atalhos */}
      <p className="text-lg font-bold text-gray-900 mt-2">O que você quer fazer?</p>

      <button
        onClick={() => onChange("clientes")}
        className="bg-blue-700 text-white rounded-xl p-5 flex items-center gap-4 active:opacity-80 transition-opacity"
      >
        <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center shrink-0">
          <Users size={26} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-lg font-bold">Ver Clientes</p>
          <p className="text-sm text-blue-200">Lista completa de clientes</p>
        </div>
        <ChevronRight size={22} />
      </button>

      <button
        onClick={() => onChange("cobrancas")}
        className="bg-green-700 text-white rounded-xl p-5 flex items-center gap-4 active:opacity-80 transition-opacity"
      >
        <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center shrink-0">
          <Bell size={26} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-lg font-bold">Fazer Cobrança</p>
          <p className="text-sm text-green-200">{emAtraso.length} clientes precisam pagar</p>
        </div>
        <ChevronRight size={22} />
      </button>

      {/* Inadimplentes */}
      {emAtraso.length > 0 && (
        <>
          <p className="text-lg font-bold text-gray-900 mt-2">Atenção — Em Atraso</p>
          {emAtraso.map((c) => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border-2 border-red-100 p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <span className="text-red-700 font-bold text-lg">{c.nome[0]}</span>
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-gray-900">{c.nome}</p>
                <p className="text-sm text-red-500 font-medium">{c.diasAtraso} dias em atraso</p>
              </div>
              <p className="text-base font-bold text-red-600">{moeda(c.saldo)}</p>
            </div>
          ))}
        </>
      )}

      {/* Estado vazio */}
      {clientes.length === 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 flex flex-col items-center gap-3 text-center mt-2">
          <Users size={40} className="text-blue-400" />
          <p className="text-base font-bold text-blue-700">Nenhum cliente cadastrado</p>
          <p className="text-sm text-blue-500">
            Vá até a aba <strong>Clientes</strong> e cadastre seu primeiro cliente.
          </p>
          <button
            onClick={() => onChange("clientes")}
            className="bg-blue-700 text-white rounded-xl px-6 py-3 font-bold text-base"
          >
            Cadastrar Agora
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Tela: Clientes
───────────────────────────────────────────────── */
function TelaClientes({
  clientes, onNovoCliente,
}: { clientes: Cliente[]; onNovoCliente: () => void }) {
  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Botão principal de cadastro */}
      <button
        onClick={onNovoCliente}
        className="w-full flex items-center justify-center gap-3 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white rounded-xl py-4 text-lg font-bold shadow-md transition-colors"
      >
        <Plus size={24} strokeWidth={2.5} />
        Cadastrar Novo Cliente
      </button>

      {/* Lista vazia */}
      {clientes.length === 0 && (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-center gap-3 text-center mt-2">
          <Users size={48} className="text-gray-300" />
          <p className="text-lg font-bold text-gray-400">Nenhum cliente ainda</p>
          <p className="text-sm text-gray-400">
            Toque em "Cadastrar Novo Cliente" para adicionar o primeiro.
          </p>
        </div>
      )}

      {/* Cards dos clientes */}
      {clientes.map((c) => {
        const pct      = c.limite > 0 ? Math.min((c.saldo / c.limite) * 100, 100) : 0;
        const atrasado = c.diasAtraso > 0;
        const barColor = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-orange-400" : "bg-green-500";
        const limiteLivre = c.limite - c.saldo;

        const valorNum = moeda(c.saldo).replace("R$", "").trim();
        const msgWpp   = atrasado ? msgEmAtraso(c.nome, valorNum) : msgNoDia(c.nome, valorNum);

        return (
          <div
            key={c.id}
            className={`bg-white rounded-xl shadow-sm p-4 flex flex-col gap-4 border-2
              ${atrasado ? "border-red-200" : "border-gray-100"}`}
          >
            {/* Linha principal */}
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-2xl font-bold
                ${atrasado ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                {c.nome[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-gray-900 truncate">{c.nome}</p>
                {c.endereco && (
                  <p className="text-xs text-gray-400 truncate">{c.endereco}</p>
                )}
                <div className="flex items-center gap-1 mt-1">
                  {atrasado ? (
                    <>
                      <AlertCircle size={14} className="text-red-500 shrink-0" />
                      <span className="text-sm font-medium text-red-500">{c.diasAtraso} dias em atraso</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={14} className="text-green-600 shrink-0" />
                      <span className="text-sm font-medium text-green-600">Em dia</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Deve</p>
                <p className={`text-lg font-bold ${atrasado ? "text-red-600" : "text-gray-900"}`}>
                  {moeda(c.saldo)}
                </p>
              </div>
            </div>

            {/* Limite disponível */}
            <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Limite Total</p>
                <p className="text-base font-bold text-gray-700">{moeda(c.limite)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Disponível</p>
                <p className={`text-base font-bold ${limiteLivre <= 0 ? "text-red-600" : "text-green-600"}`}>
                  {moeda(Math.max(limiteLivre, 0))}
                </p>
              </div>
            </div>

            {/* Barra de crédito */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Crédito utilizado</span>
                <span className={`font-semibold ${pct >= 90 ? "text-red-500" : pct >= 70 ? "text-orange-500" : "text-green-600"}`}>
                  {pct.toFixed(0)}%
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-2.5 rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* Botão WhatsApp */}
            <a
              href={whatsLink(c.telefone, msgWpp)}
              target="_blank"
              rel="noreferrer"
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-white font-bold text-base transition-opacity active:opacity-80
                ${atrasado ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
            >
              <MessageCircle size={20} />
              {atrasado ? "Cobrar no WhatsApp" : "Avisar no WhatsApp"}
            </a>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Tela: Cobranças
───────────────────────────────────────────────── */
function TelaCobrancas({ clientes }: { clientes: Cliente[] }) {
  const emAtraso = clientes.filter((c) => c.diasAtraso > 0);

  if (emAtraso.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8 text-center mt-12">
        <CheckCircle size={64} className="text-green-500" />
        <p className="text-2xl font-bold text-gray-900">Tudo em dia!</p>
        <p className="text-base text-gray-500">Nenhum cliente está devendo no momento.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {emAtraso.map((c) => {
        const urgencia  = c.diasAtraso >= 30 ? "alta" : c.diasAtraso >= 10 ? "media" : "baixa";
        const badge     = urgencia === "alta" ? "URGENTE" : urgencia === "media" ? "ATENÇÃO" : "EM ATRASO";
        const badgeClass = urgencia === "alta" ? "bg-red-100 text-red-700"
          : urgencia === "media" ? "bg-orange-100 text-orange-700"
          : "bg-purple-100 text-purple-700";
        const borderClass = urgencia === "alta" ? "border-red-300"
          : urgencia === "media" ? "border-orange-300"
          : "border-purple-200";

        const valorNum = moeda(c.saldo).replace("R$", "").trim();
        const msg = msgEmAtraso(c.nome, valorNum);

        return (
          <div key={c.id} className={`bg-white rounded-xl shadow-sm border-2 ${borderClass} p-4 flex flex-col gap-4`}>
            <div className={`flex items-center gap-2 ${badgeClass} px-3 py-2 rounded-lg self-start`}>
              <AlertCircle size={15} />
              <span className="text-sm font-bold uppercase tracking-wide">
                {badge} — {c.diasAtraso} dias em atraso
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shrink-0 ${badgeClass}`}>
                {c.nome[0].toUpperCase()}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{c.nome}</p>
                <p className="text-sm text-gray-400">Venceu em {dataFmt(c.vencimento)}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Valor em Aberto</p>
              <p className="text-4xl font-bold text-red-600 mt-1">{moeda(c.saldo)}</p>
            </div>

            <a
              href={whatsLink(c.telefone, msg)}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-xl py-5 text-xl font-bold transition-colors"
            >
              <MessageCircle size={26} />
              Cobrar no WhatsApp
            </a>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   App principal — FiadoControl
───────────────────────────────────────────────── */
function FiadoControl() {
  const [tela, setTela]         = useState<Tela>("inicio");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [modalAberto, setModalAberto] = useState(false);

  function adicionarCliente(dados: Omit<Cliente, "id" | "saldo" | "diasAtraso" | "vencimento">) {
    const novo: Cliente = {
      id:         Date.now().toString(),
      saldo:      0,
      diasAtraso: 0,
      vencimento: vencimento30Dias(),
      ...dados,
    };
    setClientes((prev) => [novo, ...prev]);
    setModalAberto(false);
    setTela("clientes");
  }

  const emAtraso = clientes.filter((c) => c.diasAtraso > 0);

  const headerBg: Record<Tela, string>    = { inicio: "bg-blue-700", clientes: "bg-blue-700", cobrancas: "bg-red-700" };
  const headerTitle: Record<Tela, string> = { inicio: "FiadoControl", clientes: "Clientes", cobrancas: "Cobranças" };
  const headerSub: Record<Tela, string>   = {
    inicio:    "Controle de crédito e cobranças",
    clientes:  `${clientes.length} cadastrado${clientes.length !== 1 ? "s" : ""} · ${emAtraso.length} em atraso`,
    cobrancas: `${emAtraso.length} cliente${emAtraso.length !== 1 ? "s" : ""} precisam pagar`,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className={`${headerBg[tela]} text-white px-5 pt-10 pb-5`}>
        <h1 className="text-3xl font-bold">{headerTitle[tela]}</h1>
        <p className="text-sm text-white/70 mt-1">{headerSub[tela]}</p>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 overflow-y-auto pb-20">
        {tela === "inicio"    && <TelaInicio    clientes={clientes} onChange={setTela} />}
        {tela === "clientes"  && <TelaClientes  clientes={clientes} onNovoCliente={() => setModalAberto(true)} />}
        {tela === "cobrancas" && <TelaCobrancas clientes={clientes} />}
      </main>

      <BottomNav ativa={tela} onChange={setTela} />

      {/* Modal de cadastro */}
      {modalAberto && (
        <ModalCadastro
          onSalvar={adicionarCliente}
          onFechar={() => setModalAberto(false)}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   Preview renderer (canvas do workspace)
───────────────────────────────────────────────── */
type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;

function _resolveComponent(mod: Record<string, unknown>, name: string): ComponentType | undefined {
  const fns = Object.values(mod).filter((v) => typeof v === "function") as ComponentType[];
  return (mod.default as ComponentType) || (mod.Preview as ComponentType) || (mod[name] as ComponentType) || fns[fns.length - 1];
}

function PreviewRenderer({ componentPath, modules }: { componentPath: string; modules: ModuleMap }) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setComponent(null); setError(null);
    async function load() {
      const key = `./components/mockups/${componentPath}.tsx`;
      const loader = modules[key];
      if (!loader) { setError(`No component found at ${componentPath}.tsx`); return; }
      try {
        const mod = await loader();
        if (cancelled) return;
        const name = componentPath.split("/").pop()!;
        const comp = _resolveComponent(mod, name);
        if (!comp) { setError(`No exported React component found in ${componentPath}.tsx`); return; }
        setComponent(() => comp);
      } catch (e) {
        if (cancelled) return;
        setError(`Failed to load preview.\n${e instanceof Error ? e.message : String(e)}`);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [componentPath, modules]);

  if (error)      return <pre style={{ color: "red", padding: "2rem", fontFamily: "system-ui" }}>{error}</pre>;
  if (!Component) return null;
  return <Component />;
}

function getBasePath() { return import.meta.env.BASE_URL.replace(/\/$/, ""); }
function getPreviewPath(): string | null {
  const basePath = getBasePath();
  const { pathname } = window.location;
  const local = basePath && pathname.startsWith(basePath) ? pathname.slice(basePath.length) || "/" : pathname;
  const match = local.match(/^\/preview\/(.+)$/);
  return match ? match[1] : null;
}

export default function App() {
  const previewPath = getPreviewPath();
  if (previewPath) return <PreviewRenderer componentPath={previewPath} modules={discoveredModules} />;
  return <FiadoControl />;
}
