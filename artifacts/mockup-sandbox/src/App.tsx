import { type ComponentType, useEffect, useState } from "react";
import { Home, Users, Bell, AlertCircle, CheckCircle, ChevronRight, MessageCircle } from "lucide-react";

import { modules as discoveredModules } from "./.generated/mockup-components";

/* ──────────────────────────────────────────────────
   Tipos de dados mockados
────────────────────────────────────────────────── */
interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  saldo: number;
  limite: number;
  diasAtraso: number;
  vencimento: string;
}

const CLIENTES: Cliente[] = [
  { id: "1", nome: "Maria Silva",     telefone: "5511999887766", saldo: 1250, limite: 5000, diasAtraso: 0,  vencimento: "2026-04-20" },
  { id: "2", nome: "João Pereira",    telefone: "5511988776655", saldo: 3800, limite: 4000, diasAtraso: 15, vencimento: "2026-03-22" },
  { id: "3", nome: "Ana Souza",       telefone: "5511977665544", saldo: 750,  limite: 2000, diasAtraso: 0,  vencimento: "2026-04-25" },
  { id: "4", nome: "Carlos Lima",     telefone: "5511966554433", saldo: 2100, limite: 3000, diasAtraso: 7,  vencimento: "2026-03-30" },
  { id: "5", nome: "Fernanda Costa",  telefone: "5511955443322", saldo: 4500, limite: 6000, diasAtraso: 32, vencimento: "2026-03-05" },
  { id: "6", nome: "Roberto Alves",   telefone: "5511944332211", saldo: 320,  limite: 1500, diasAtraso: 0,  vencimento: "2026-05-01" },
  { id: "7", nome: "Patricia Rocha",  telefone: "5511933221100", saldo: 1900, limite: 2500, diasAtraso: 3,  vencimento: "2026-04-03" },
];

const emAtraso = CLIENTES.filter((c) => c.diasAtraso > 0);
const totalReceber = CLIENTES.reduce((a, c) => a + c.saldo, 0);
const totalAtrasado = emAtraso.reduce((a, c) => a + c.saldo, 0);

function moeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function dataFmt(d: string) {
  return new Date(d).toLocaleDateString("pt-BR");
}
function whatsLink(tel: string, msg: string) {
  return `https://wa.me/${tel.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
}

/* ──────────────────────────────────────────────────
   Bottom Nav
────────────────────────────────────────────────── */
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
            className={`flex-1 flex flex-col items-center justify-center h-16 gap-1 transition-colors
              ${active ? "text-blue-700" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Icon size={26} strokeWidth={active ? 2.5 : 2} />
            <span className={`text-xs font-semibold ${active ? "text-blue-700" : "text-gray-500"}`}>
              {label}
            </span>
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-700 rounded-b-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

/* ──────────────────────────────────────────────────
   Tela: Início / Dashboard
────────────────────────────────────────────────── */
function TelaInicio({ onChange }: { onChange: (t: Tela) => void }) {
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
          <p className="text-2xl font-bold text-gray-900">{CLIENTES.length}</p>
          <p className="text-xs text-gray-500 text-center">Clientes</p>
        </div>
        <div className="bg-red-50 rounded-xl border-2 border-red-200 p-4 flex flex-col items-center gap-2">
          <AlertCircle size={28} className="text-red-600" />
          <p className="text-2xl font-bold text-red-600">{emAtraso.length}</p>
          <p className="text-xs text-red-500 text-center font-medium">Em Atraso</p>
        </div>
        <div className="bg-green-50 rounded-xl border-2 border-green-200 p-4 flex flex-col items-center gap-2">
          <CheckCircle size={28} className="text-green-600" />
          <p className="text-2xl font-bold text-green-600">{CLIENTES.length - emAtraso.length}</p>
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

      {/* Mini lista de inadimplentes */}
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
    </div>
  );
}

/* ──────────────────────────────────────────────────
   Tela: Clientes
────────────────────────────────────────────────── */
function TelaClientes() {
  return (
    <div className="flex flex-col gap-3 p-4">
      {CLIENTES.map((c) => {
        const pct = Math.min((c.saldo / c.limite) * 100, 100);
        const atrasado = c.diasAtraso > 0;
        const barColor = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-orange-400" : "bg-green-500";

        return (
          <div
            key={c.id}
            className={`bg-white rounded-xl shadow-sm p-4 flex flex-col gap-4
              border-2 ${atrasado ? "border-red-200" : "border-gray-100"}`}
          >
            {/* Linha principal */}
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-2xl font-bold
                ${atrasado ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                {c.nome[0]}
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900">{c.nome}</p>
                <div className="flex items-center gap-1 mt-1">
                  {atrasado ? (
                    <>
                      <AlertCircle size={15} className="text-red-500" />
                      <span className="text-sm font-medium text-red-500">{c.diasAtraso} dias em atraso</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={15} className="text-green-600" />
                      <span className="text-sm font-medium text-green-600">Em dia</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Deve</p>
                <p className={`text-lg font-bold ${atrasado ? "text-red-600" : "text-gray-900"}`}>
                  {moeda(c.saldo)}
                </p>
              </div>
            </div>

            {/* Barra de crédito */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Limite: {moeda(c.limite)}</span>
                <span className={`font-semibold ${pct >= 90 ? "text-red-500" : pct >= 70 ? "text-orange-500" : "text-green-600"}`}>
                  {pct.toFixed(0)}% usado
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-2 rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ──────────────────────────────────────────────────
   Tela: Cobranças
────────────────────────────────────────────────── */
function TelaCobrancas() {
  if (emAtraso.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8 text-center">
        <CheckCircle size={64} className="text-green-500" />
        <p className="text-2xl font-bold text-gray-900">Tudo em dia!</p>
        <p className="text-base text-gray-500">Nenhum cliente está devendo no momento.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {emAtraso.map((c) => {
        const urgencia = c.diasAtraso >= 30 ? "alta" : c.diasAtraso >= 10 ? "media" : "baixa";
        const badge = urgencia === "alta" ? "URGENTE" : urgencia === "media" ? "ATENÇÃO" : "EM ATRASO";
        const badgeClass =
          urgencia === "alta"
            ? "bg-red-100 text-red-700"
            : urgencia === "media"
            ? "bg-orange-100 text-orange-700"
            : "bg-purple-100 text-purple-700";
        const borderClass =
          urgencia === "alta" ? "border-red-300" : urgencia === "media" ? "border-orange-300" : "border-purple-200";

        const msg = `Olá ${c.nome}! Informamos que sua dívida de ${moeda(c.saldo)} está em aberto há ${c.diasAtraso} dias (vencimento em ${dataFmt(c.vencimento)}). Entre em contato para regularizar. Obrigado!`;

        return (
          <div key={c.id} className={`bg-white rounded-xl shadow-sm border-2 ${borderClass} p-4 flex flex-col gap-4`}>
            {/* Badge */}
            <div className={`flex items-center gap-2 ${badgeClass} px-3 py-2 rounded-lg self-start`}>
              <AlertCircle size={15} />
              <span className="text-sm font-bold uppercase tracking-wide">{badge} — {c.diasAtraso} dias em atraso</span>
            </div>

            {/* Info */}
            <div className="flex items-center gap-3">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shrink-0 ${badgeClass}`}>
                {c.nome[0]}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{c.nome}</p>
                <p className="text-sm text-gray-400">Venceu em {dataFmt(c.vencimento)}</p>
              </div>
            </div>

            {/* Valor */}
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Valor em Aberto</p>
              <p className="text-4xl font-bold text-red-600 mt-1">{moeda(c.saldo)}</p>
            </div>

            {/* Botão WhatsApp — largura total */}
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

/* ──────────────────────────────────────────────────
   App principal — FiadoControl
────────────────────────────────────────────────── */
function FiadoControl() {
  const [tela, setTela] = useState<Tela>("inicio");

  const headerBg: Record<Tela, string> = {
    inicio:    "bg-blue-700",
    clientes:  "bg-blue-700",
    cobrancas: "bg-red-700",
  };
  const headerSub: Record<Tela, string> = {
    inicio:    "Controle de crédito e cobranças",
    clientes:  `${CLIENTES.length} cadastrados · ${emAtraso.length} em atraso`,
    cobrancas: `${emAtraso.length} clientes precisam pagar`,
  };
  const headerTitle: Record<Tela, string> = {
    inicio:    "FiadoControl",
    clientes:  "Clientes",
    cobrancas: "Cobranças",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className={`${headerBg[tela]} text-white px-5 pt-10 pb-5`}>
        <h1 className="text-3xl font-bold">{headerTitle[tela]}</h1>
        <p className="text-sm text-white/70 mt-1">{headerSub[tela]}</p>
      </header>

      {/* Conteúdo com scroll */}
      <main className="flex-1 overflow-y-auto pb-20">
        {tela === "inicio"    && <TelaInicio onChange={setTela} />}
        {tela === "clientes"  && <TelaClientes />}
        {tela === "cobrancas" && <TelaCobrancas />}
      </main>

      {/* Menu fixo no rodapé */}
      <BottomNav ativa={tela} onChange={setTela} />
    </div>
  );
}

/* ──────────────────────────────────────────────────
   Preview renderer (mantido para o canvas do workspace)
────────────────────────────────────────────────── */
type ModuleMap = Record<string, () => Promise<Record<string, unknown>>>;

function _resolveComponent(mod: Record<string, unknown>, name: string): ComponentType | undefined {
  const fns = Object.values(mod).filter((v) => typeof v === "function") as ComponentType[];
  return (mod.default as ComponentType) || (mod.Preview as ComponentType) || (mod[name] as ComponentType) || fns[fns.length - 1];
}

function PreviewRenderer({ componentPath, modules }: { componentPath: string; modules: ModuleMap }) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setComponent(null);
    setError(null);

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

  if (error) return <pre style={{ color: "red", padding: "2rem", fontFamily: "system-ui" }}>{error}</pre>;
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
  if (previewPath) {
    return <PreviewRenderer componentPath={previewPath} modules={discoveredModules} />;
  }
  return <FiadoControl />;
}
