import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  AlertCircle, Bell, CheckCircle, ChevronRight,
  DollarSign, Home, MapPin, MessageCircle, Phone,
  Plus, User, UserPlus, Users, X, ShoppingCart, 
  Trash2, HandCoins, Search, Edit3, Save, ArrowLeft,
  Calendar, Clock, AlertTriangle
} from "lucide-react";

/* ─────────────────────────────────────────────────
   1. UTILITÁRIOS, FORMATAÇÃO E DATAS
───────────────────────────────────────────────── */
const fmtMoeda = (v: number) => 
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtDataBr = (isoDate: string) => {
  if (!isoDate) return "";
  const [ano, mes, dia] = isoDate.split("-");
  return `${dia}/${mes}/${ano}`;
};

const maskTelefone = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

const maskMoeda = (v: string) => {
  const d = v.replace(/\D/g, "");
  if (!d) return "";
  return (parseInt(d) / 100).toLocaleString("pt-BR", { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

// Função para calcular o status do prazo (atrasado, hoje ou futuro)
const calcularStatusPrazo = (vencimento: string) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataVenc = new Date(vencimento);
  dataVenc.setHours(0, 0, 0, 0);

  const diffTime = dataVenc.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: `Atrasado ${Math.abs(diffDays)}d`, color: "text-red-600 bg-red-50", icon: AlertTriangle };
  if (diffDays === 0) return { label: "Vence Hoje", color: "text-orange-600 bg-orange-50", icon: Clock };
  return { label: `Vence em ${diffDays}d`, color: "text-blue-600 bg-blue-50", icon: Calendar };
};

/* ─────────────────────────────────────────────────
   2. COMPONENTES DE INTERFACE (UI)
───────────────────────────────────────────────── */
const CampoForm = ({ label, icon: Icon, children }: any) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-sm font-bold text-gray-600 flex items-center gap-2">
      <Icon size={16} className="text-blue-600" /> {label}
    </label>
    {children}
  </div>
);

/* ─────────────────────────────────────────────────
   3. MODAL BASE
───────────────────────────────────────────────── */
function ModalBase({ titulo, fechar, children }: any) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex flex-col" onClick={fechar}>
      <div 
        className="mt-auto bg-gray-50 rounded-t-[32px] p-6 pb-10 flex flex-col gap-6 shadow-2xl overflow-y-auto max-h-[95vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-gray-800 tracking-tighter">{titulo}</h2>
          <button onClick={fechar} className="p-2 bg-gray-200 rounded-full text-gray-500"><X /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   4. TELA: INÍCIO (DASHBOARD)
───────────────────────────────────────────────── */
function TelaDashboard({ clientes, setTela, abrirCadastro }: any) {
  const total = useMemo(() => clientes.reduce((acc: any, c: any) => acc + c.saldo, 0), [clientes]);
  const atrasados = clientes.filter((c: any) => {
    if (c.saldo <= 0) return false;
    const diff = new Date(c.vencimento).getTime() - new Date().setHours(0,0,0,0);
    return diff < 0;
  }).length;

  return (
    <div className="p-5 flex flex-col gap-6">
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col items-center gap-2 relative overflow-hidden">
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total a Receber</p>
        <p className="text-5xl font-black text-red-600">{fmtMoeda(total)}</p>
        {atrasados > 0 && (
          <div className="bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-2 mt-3 animate-pulse">
            <AlertTriangle size={14}/> {atrasados} PRAZOS VENCIDOS
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button onClick={abrirCadastro} className="bg-green-600 text-white p-5 rounded-2xl font-black flex items-center gap-4 shadow-lg active:scale-95 transition-all">
          <div className="bg-white/20 p-2 rounded-xl"><UserPlus size={24}/></div>
          <p className="text-lg">Cadastrar Novo Cliente</p>
          <ChevronRight className="ml-auto opacity-50" />
        </button>

        <button onClick={() => setTela("clientes")} className="bg-blue-700 text-white p-5 rounded-2xl font-black flex items-center gap-4 shadow-lg active:scale-95 transition-all">
          <div className="bg-white/20 p-2 rounded-xl"><Users size={24}/></div>
          <p className="text-lg">Gerenciar Clientes</p>
          <ChevronRight className="ml-auto opacity-50" />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   5. TELA: LISTA DE CLIENTES
───────────────────────────────────────────────── */
function TelaLista({ clientes, onLancar, onApagar, onEditar, abrirCadastro }: any) {
  const [busca, setBusca] = useState("");
  const filtrados = clientes.filter((c: any) => c.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="p-5 flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
        <input 
          className="w-full bg-white border-2 border-gray-100 rounded-2xl pl-12 pr-4 py-4 font-bold shadow-sm focus:border-blue-500 outline-none"
          placeholder="Pesquisar cliente..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      {filtrados.map((c: any) => {
        const pct = (c.saldo / c.limite) * 100;
        const status = calcularStatusPrazo(c.vencimento);
        const StatusIcon = status.icon;

        return (
          <div key={c.id} className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div onClick={() => onEditar(c)}>
                <p className="text-xl font-black text-gray-800">{c.nome}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase flex items-center gap-1 ${status.color}`}>
                    <StatusIcon size={12}/> {status.label}
                  </span>
                </div>
              </div>
              <div className="text-right">
                 <button onClick={() => onApagar(c)} className="text-gray-200 mb-1"><Trash2 size={18}/></button>
                 <p className="text-2xl font-black text-red-600 leading-none">{fmtMoeda(c.saldo)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-black text-gray-400 uppercase">
              <div className="flex flex-col">
                <span>Data Compra</span>
                <span className="text-gray-600">{fmtDataBr(c.dataCompra)}</span>
              </div>
              <div className="flex flex-col text-right">
                <span>Vencimento</span>
                <span className="text-gray-600">{fmtDataBr(c.vencimento)}</span>
              </div>
            </div>

            <div className="h-2 bg-gray-50 rounded-full overflow-hidden border">
              <div className={`h-full ${pct > 90 ? 'bg-red-600' : 'bg-blue-600'}`} style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => onLancar(c, 'compra')} className="bg-blue-50 text-blue-700 py-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2">
                <Plus size={14}/> Venda
              </button>
              <button onClick={() => onLancar(c, 'pagamento')} className="bg-green-50 text-green-700 py-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2">
                <HandCoins size={14}/> Pagou
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   6. APP PRINCIPAL
───────────────────────────────────────────────── */
export default function App() {
  const [tela, setTela] = useState("inicio");
  const [clientes, setClientes] = useState<any[]>(() => {
    const salvo = localStorage.getItem("fiado_v3");
    return salvo ? JSON.parse(salvo) : [];
  });

  const [modalCad, setModalCad] = useState<any>(null);
  const [mov, setMov] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem("fiado_v3", JSON.stringify(clientes));
  }, [clientes]);

  const salvarCliente = (dados: any) => {
    if (modalCad?.id) {
      setClientes(clientes.map(c => c.id === modalCad.id ? { ...c, ...dados } : c));
    } else {
      setClientes([{ id: Date.now().toString(), saldo: 0, ...dados }, ...clientes]);
    }
    setModalCad(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24 font-sans">
      <header className="bg-blue-700 text-white p-6 pt-14 pb-8 flex flex-col gap-1 shadow-xl">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-black tracking-tighter">FiadoControl</h1>
          {tela !== "inicio" && <button onClick={() => setTela("inicio")} className="p-2 bg-white/10 rounded-xl"><ArrowLeft/></button>}
        </div>
        <p className="text-blue-200 font-bold text-xs uppercase">Controle de Crédito</p>
      </header>

      <main className="flex-1">
        {tela === "inicio" && <TelaDashboard clientes={clientes} setTela={setTela} abrirCadastro={() => setModalCad({})} />}
        {tela === "clientes" && <TelaLista clientes={clientes} abrirCadastro={() => setModalCad({})} onLancar={(c: any, t: any) => setMov({c, t})} onApagar={(c: any) => confirm(`Remover ${c.nome}?`) && setClientes(clientes.filter(x => x.id !== c.id))} onEditar={setModalCad} />}
      </main>

      <nav className="fixed bottom-6 left-6 right-6 bg-white border border-gray-100 h-18 rounded-[24px] flex shadow-2xl z-50 items-center overflow-hidden">
        <button onClick={() => setTela("inicio")} className={`flex-1 flex flex-col items-center p-4 ${tela === "inicio" ? "text-blue-700" : "text-gray-300"}`}><Home /></button>
        <button onClick={() => setTela("clientes")} className={`flex-1 flex flex-col items-center p-4 ${tela === "clientes" ? "text-blue-700" : "text-gray-300"}`}><Users /></button>
      </nav>

      {modalCad && (
        <ModalBase titulo={modalCad.id ? "Editar Cliente" : "Novo Cadastro"} fechar={() => setModalCad(null)}>
          <FormCadastro inicial={modalCad} aoSalvar={salvarCliente} />
        </ModalBase>
      )}

      {mov && (
        <ModalBase titulo={mov.t === 'compra' ? "Nova Venda" : "Receber Pagamento"} fechar={() => setMov(null)}>
           <div className="flex flex-col gap-6">
              <p className="text-center font-bold text-gray-400">Cliente: {mov.c.nome}</p>
              <input 
                autoFocus 
                type="text" 
                inputMode="numeric"
                placeholder="R$ 0,00"
                className="text-5xl font-black text-center w-full text-blue-700 outline-none"
                onChange={e => e.target.value = maskMoeda(e.target.value)}
              />
              <button 
                onClick={() => {
                  const input = document.querySelector('input[inputMode="numeric"]') as HTMLInputElement;
                  const val = parseFloat(input.value.replace(/\./g, "").replace(",", ".")) || 0;
                  const fator = mov.t === 'compra' ? 1 : -1;
                  setClientes(clientes.map(c => c.id === mov.c.id ? { ...c, saldo: Math.max(0, c.saldo + (val * fator)) } : c));
                  setMov(null);
                }}
                className={`w-full py-5 rounded-2xl font-black text-xl text-white shadow-lg ${mov.t === 'compra' ? 'bg-blue-600' : 'bg-green-600'}`}
              >
                Confirmar Operação
              </button>
           </div>
        </ModalBase>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   7. FORMULÁRIO DE CADASTRO COM CALENDÁRIO
───────────────────────────────────────────────── */
function FormCadastro({ inicial, aoSalvar }: any) {
  const dataHoje = new Date().toISOString().split("T")[0];
  const [nome, setNome] = useState(inicial.nome || "");
  const [tel, setTel] = useState(inicial.telefone || "");
  const [lim, setLim] = useState(inicial.limite ? maskMoeda(inicial.limite.toString()) : "");

  // CAMPOS DE DATA (Adicionados como você pediu)
  const [dataCompra, setDataCompra] = useState(inicial.dataCompra || dataHoje);
  const [vencimento, setVencimento] = useState(inicial.vencimento || dataHoje);

  return (
    <div className="flex flex-col gap-5">
      <CampoForm label="Nome Completo" icon={User}>
        <input className="bg-white border-2 border-gray-100 rounded-2xl p-4 font-bold outline-none focus:border-blue-500" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Maria Silva" />
      </CampoForm>

      {/* SEÇÃO DE DATAS: COMPRA E VENCIMENTO */}
      <div className="grid grid-cols-2 gap-3">
        <CampoForm label="Data da Compra" icon={Calendar}>
          <input 
            type="date" 
            className="bg-white border-2 border-gray-100 rounded-2xl p-4 font-bold outline-none" 
            value={dataCompra} 
            onChange={e => setDataCompra(e.target.value)} 
          />
        </CampoForm>
        <CampoForm label="Data para Pagar" icon={Clock}>
          <input 
            type="date" 
            className="bg-white border-2 border-gray-100 rounded-2xl p-4 font-bold outline-none" 
            value={vencimento} 
            onChange={e => setVencimento(e.target.value)} 
          />
        </CampoForm>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <CampoForm label="WhatsApp" icon={Phone}>
          <input className="bg-white border-2 border-gray-100 rounded-2xl p-4 font-bold outline-none" type="tel" value={tel} onChange={e => setTel(maskTelefone(e.target.value))} placeholder="(00) 00000-0000" />
        </CampoForm>
        <CampoForm label="Limite" icon={DollarSign}>
          <input className="bg-white border-2 border-gray-100 rounded-2xl p-4 font-bold outline-none" value={lim} onChange={e => setLim(maskMoeda(e.target.value))} placeholder="0,00" />
        </CampoForm>
      </div>

      <button 
        onClick={() => aoSalvar({ 
          nome, 
          telefone: tel, 
          limite: parseFloat(lim.replace(/\./g, "").replace(",", ".")) || 0,
          dataCompra,
          vencimento
        })}
        className="bg-blue-700 text-white py-5 rounded-2xl font-black text-xl shadow-xl mt-4 flex items-center justify-center gap-2 active:scale-95 transition-all"
      >
        <Save size={24}/> {inicial.id ? "Salvar Alterações" : "Concluir Cadastro"}
      </button>
    </div>
  );
}
