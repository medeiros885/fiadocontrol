import React, { useState, useEffect, useMemo } from "react";
import {
  AlertCircle, Bell, CheckCircle, ChevronRight,
  DollarSign, Home, MapPin, MessageCircle, Phone,
  Plus, User, UserPlus, Users, X, 
  Trash2, Search, Calendar, Clock
} from "lucide-react";

/* ─────────────────────────────────────────────────
   1. UTILITÁRIOS E FORMATAÇÃO
───────────────────────────────────────────────── */
const fmtMoeda = (v: number) => 
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtDataBr = (isoDate: string) => {
  if (!isoDate) return "---";
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

const calcularStatusPrazo = (vencimento: string) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataVenc = new Date(vencimento);
  dataVenc.setHours(0, 0, 0, 0);
  const diffTime = dataVenc.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: `Atrasado ${Math.abs(diffDays)}d`, color: "text-red-600 bg-red-50", icon: AlertCircle, tipo: 'atrasado' };
  if (diffDays === 0) return { label: "Vence Hoje", color: "text-orange-600 bg-orange-50", icon: Clock, tipo: 'hoje' };
  return { label: `Vence em ${diffDays}d`, color: "text-blue-600 bg-blue-50", icon: Calendar, tipo: 'dia' };
};

// 💌 MENSAGENS PERSONALIZADAS (SEM O NOME DO APP)
const gerarMensagemWhatsapp = (cliente: any, status: any) => {
  const saudacao = "Olá";
  const nomeC = `*${cliente.nome}*`;
  const valorC = `*${fmtMoeda(cliente.saldo)}*`;
  const dataC = `*${fmtDataBr(cliente.vencimento)}*`;

  if (status.tipo === 'atrasado') {
    return `${saudacao} ${nomeC}, tudo bem? Passando para fazer um lembrete amigável sobre o seu saldo em aberto. O valor atual é de ${valorC} e o vencimento foi em ${dataC}. Aguardamos o seu retorno para combinarmos o pagamento! Obrigado pela parceria.`;
  }

  if (status.tipo === 'hoje') {
    return `Oi ${nomeC}! Lembrete rápido: a sua conta no valor de ${valorC} vence hoje (${dataC}). Qualquer dúvida é só nos chamar aqui. Tenha um ótimo dia!`;
  }

  return `${saudacao} ${nomeC}! Passando apenas para agradecer a sua parceria e por manter o seu saldo em dia! Conte sempre conosco!`;
};

/* ─────────────────────────────────────────────────
   2. COMPONENTES DE UI
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
   3. MODAIS
───────────────────────────────────────────────── */
function ModalMovimentacao({ cliente, tipo, onConfirmar, onFechar }: any) {
  const isPagamento = tipo === 'pagamento';
  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex flex-col justify-end" onClick={onFechar}>
      <div className="bg-white rounded-t-[32px] p-8 flex flex-col gap-6 animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black">{isPagamento ? "Receber Pagamento" : "Lançar Compra"}</h2>
          <button onClick={onFechar} className="p-2 bg-gray-100 rounded-full"><X/></button>
        </div>
        <p className="font-bold text-gray-400 uppercase text-xs">Cliente: {cliente.nome}</p>
        <input autoFocus type="text" inputMode="numeric" className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-6 text-4xl font-black text-center outline-none" placeholder="0,00" onChange={e => e.target.value = maskMoeda(e.target.value)} />
        <button 
          onClick={(e) => {
            const val = parseFloat((e.currentTarget.parentElement?.querySelector('input') as any).value.replace(/\./g, "").replace(",", ".")) || 0;
            onConfirmar(val);
          }}
          className={`w-full py-5 rounded-2xl font-black text-xl text-white shadow-lg ${isPagamento ? 'bg-green-600' : 'bg-blue-700'}`}
        >
          Confirmar {isPagamento ? "Pagamento" : "Venda"}
        </button>
      </div>
    </div>
  );
}

function ModalCadastro({ inicial, aoSalvar, aoFechar, aoApagar }: any) {
  const hoje = new Date().toISOString().split("T")[0];
  const [nome, setNome] = useState(inicial?.nome || "");
  const [end, setEnd] = useState(inicial?.endereco || "");
  const [tel, setTel] = useState(inicial?.telefone || "");
  const [lim, setLim] = useState(inicial?.limite ? (inicial.limite).toLocaleString('pt-BR', {minimumFractionDigits: 2}) : "");
  const [dtCompra, setDtCompra] = useState(inicial?.dataCompra || hoje);
  const [dtVenc, setDtVenc] = useState(inicial?.vencimento || hoje);

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex flex-col justify-end" onClick={aoFechar}>
      <div className="bg-white rounded-t-[32px] p-6 flex flex-col gap-5 max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold">{inicial?.id ? "Editar Cliente" : "Cadastrar Novo Cliente"}</h2>
          <button onClick={aoFechar} className="p-2 bg-gray-100 rounded-full text-gray-400"><X /></button>
        </div>
        <CampoForm label="Nome Completo" icon={User}><input className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 font-bold" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Maria da Silva" /></CampoForm>
        <CampoForm label="Endereço" icon={MapPin}><input className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 font-bold" value={end} onChange={e => setEnd(e.target.value)} placeholder="Ex: Rua das Flores, 123" /></CampoForm>
        <div className="grid grid-cols-2 gap-3">
          <CampoForm label="Data Compra" icon={Calendar}><input type="date" className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 font-bold" value={dtCompra} onChange={e => setDtCompra(e.target.value)} /></CampoForm>
          <CampoForm label="Data Vencimento" icon={Clock}><input type="date" className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 font-bold" value={dtVenc} onChange={e => setDtVenc(e.target.value)} /></CampoForm>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <CampoForm label="Telefone WhatsApp" icon={Phone}><input className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 font-bold" value={tel} onChange={e => setTel(maskTelefone(e.target.value))} placeholder="(00) 00000-0000" /></CampoForm>
          <CampoForm label="Limite" icon={DollarSign}><input className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 font-bold" value={lim} onChange={e => setLim(maskMoeda(e.target.value))} placeholder="0,00" /></CampoForm>
        </div>
        <div className="flex gap-3 mt-2">
            {inicial?.id && (
                <button onClick={aoApagar} className="p-5 bg-red-50 text-red-600 rounded-2xl"><Trash2/></button>
            )}
            <button onClick={() => aoSalvar({ nome, endereco: end, telefone: tel, limite: parseFloat(lim.replace(/\./g, "").replace(",", ".")) || 0, dataCompra: dtCompra, vencimento: dtVenc })} className="flex-1 bg-green-600 text-white py-5 rounded-2xl font-bold text-xl shadow-lg">Salvar Cliente</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   4. TELAS
───────────────────────────────────────────────── */
function TelaInicio({ clientes, setTela, abrirCad }: any) {
  const total = useMemo(() => clientes.reduce((acc: any, c: any) => acc + c.saldo, 0), [clientes]);
  const emAtraso = clientes.filter((c: any) => {
    if (c.saldo <= 0) return false;
    return new Date(c.vencimento).getTime() < new Date().setHours(0,0,0,0);
  });
  const totalAtrasado = emAtraso.reduce((acc: any, c: any) => acc + c.saldo, 0);

  return (
    <div className="p-4 flex flex-col gap-6 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-sm p-8 flex flex-col items-center gap-2 border border-gray-100">
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total a Receber</p>
        <p className="text-5xl font-black text-red-600">{fmtMoeda(total)}</p>
        <div className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 mt-2">
          <AlertCircle size={14}/> {fmtMoeda(totalAtrasado)} em atraso
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-4 flex flex-col items-center gap-1 shadow-sm border border-gray-50">
          <Users size={24} className="text-blue-600" />
          <p className="text-xl font-bold">{clientes.length}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase">Clientes</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 flex flex-col items-center gap-1 border border-red-100">
          <AlertCircle size={24} className="text-red-600" />
          <p className="text-xl font-bold text-red-600">{emAtraso.length}</p>
          <p className="text-[10px] text-red-400 font-bold uppercase">Em Atraso</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 flex flex-col items-center gap-1 border border-green-100">
          <CheckCircle size={24} className="text-green-600" />
          <p className="text-xl font-bold text-green-600">{clientes.length - emAtraso.length}</p>
          <p className="text-[10px] text-green-600 font-bold uppercase">Em Dia</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-2">
        <p className="text-lg font-bold text-gray-800">O que você quer fazer?</p>
        <button onClick={abrirCad} className="bg-green-600 text-white p-5 rounded-2xl flex items-center gap-4 font-bold shadow-lg active:scale-95 transition-all">
          <div className="bg-white/20 p-2 rounded-xl"><UserPlus size={24}/></div>
          <p className="text-lg">Cadastrar Novo Cliente</p>
          <ChevronRight className="ml-auto opacity-50" />
        </button>
        <button onClick={() => setTela("clientes")} className="bg-blue-700 text-white p-5 rounded-2xl flex items-center gap-4 font-bold shadow-lg active:scale-95 transition-all">
          <div className="bg-white/20 p-2 rounded-xl"><Users size={24}/></div>
          <p className="text-lg">Ver Clientes</p>
          <ChevronRight className="ml-auto opacity-50" />
        </button>
        <button onClick={() => setTela("cobrancas")} className="bg-orange-600 text-white p-5 rounded-2xl flex items-center gap-4 font-bold shadow-lg active:scale-95 transition-all">
          <div className="bg-white/20 p-2 rounded-xl"><Bell size={24}/></div>
          <p className="text-lg">Fazer Cobrança</p>
          <ChevronRight className="ml-auto opacity-50" />
        </button>
      </div>
    </div>
  );
}

function TelaClientes({ clientes, onLancar, onEditar, abrirCad }: any) {
  const [busca, setBusca] = useState("");
  const filtrados = clientes.filter((c: any) => c.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="relative mb-2">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
        <input className="w-full bg-white border-2 border-gray-100 rounded-2xl pl-12 pr-4 py-4 font-bold outline-none" placeholder="Buscar cliente..." value={busca} onChange={e => setBusca(e.target.value)} />
      </div>

      <button onClick={abrirCad} className="bg-blue-700 text-white p-4 rounded-xl font-bold flex justify-center gap-2 shadow-md"><Plus /> Novo Cadastro</button>

      {filtrados.map((c: any) => {
        const prazo = calcularStatusPrazo(c.vencimento);
        const IconP = prazo.icon;
        const limiteLivre = c.limite - c.saldo;

        return (
          <div key={c.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div onClick={() => onEditar(c)} className="flex-1">
                <p className="text-xl font-black text-gray-800">{c.nome}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase flex items-center gap-1 ${prazo.color}`}>
                    <IconP size={12}/> {prazo.label}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                 <p className="text-2xl font-black text-red-600 leading-none">{fmtMoeda(c.saldo)}</p>
                 <p className={`text-[10px] font-bold mt-1 uppercase ${limiteLivre < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                   Livre: {fmtMoeda(limiteLivre)}
                 </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => onLancar(c, 'compra')} className="bg-blue-50 text-blue-700 py-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 active:scale-95 transition-all">Venda (+)</button>
              <button onClick={() => onLancar(c, 'pagamento')} className="bg-green-50 text-green-700 py-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 active:scale-95 transition-all">Pagou ($)</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   5. APP PRINCIPAL
───────────────────────────────────────────────── */
export default function App() {
  const [tela, setTela] = useState("inicio");
  const [clientes, setClientes] = useState<any[]>(() => {
    const salvo = localStorage.getItem("fiadocontrol_vFinal_Layout2");
    return salvo ? JSON.parse(salvo) : [];
  });
  const [modalCad, setModalCad] = useState<any>(null);
  const [mov, setMov] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem("fiadocontrol_vFinal_Layout2", JSON.stringify(clientes));
  }, [clientes]);

  const handleSalvar = (dados: any) => {
    if (modalCad?.id) {
      setClientes(clientes.map(c => c.id === modalCad.id ? { ...c, ...dados } : c));
    } else {
      setClientes([{ id: Date.now().toString(), saldo: 0, ...dados }, ...clientes]);
    }
    setModalCad(null);
  };

  const handleApagar = (id: string, nome: string) => {
      if(confirm(`Tem certeza que deseja apagar o cadastro de ${nome}?`)) {
          setClientes(clientes.filter(c => c.id !== id));
          setModalCad(null);
      }
  }

  const handleMov = (valor: number) => {
    const f = mov.t === 'compra' ? 1 : -1;
    setClientes(clientes.map(c => c.id === mov.c.id ? { ...c, saldo: Math.max(0, c.saldo + (valor * f)) } : c));
    setMov(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24 font-sans text-gray-900">
      <header className="bg-blue-700 text-white p-6 pt-12 pb-8 shadow-xl">
        <h1 className="text-4xl font-black tracking-tighter">FiadoControl</h1>
        <p className="text-blue-200 font-bold text-xs uppercase tracking-widest mt-1">Controle de Crédito</p>
      </header>

      <main className="flex-1 overflow-y-auto">
        {tela === "inicio" && <TelaInicio clientes={clientes} setTela={setTela} abrirCad={() => setModalCad({})} />}
        {tela === "clientes" && <TelaClientes clientes={clientes} abrirCad={() => setModalCad({})} onLancar={(c:any, t:any) => setMov({c, t})} onEditar={setModalCad} />}
        {tela === "cobrancas" && (
          <div className="p-4 flex flex-col gap-4">
             <p className="text-xl font-black text-orange-600 mb-2">Cobranças Ativas</p>
             {clientes.filter(c => c.saldo > 0).map(c => {
                 const prazo = calcularStatusPrazo(c.vencimento);
                 const IconP = prazo.icon;
                 const msgZap = gerarMensagemWhatsapp(c, prazo);

                 return (
                    <div key={c.id} className="bg-white p-6 rounded-[32px] border-l-8 border-orange-500 shadow-sm flex flex-col gap-4 relative">
                        <div className="absolute top-3 right-5 items-center gap-1 flex">
                            <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase flex items-center gap-1 ${prazo.color}`}>
                                <IconP size={12}/> {prazo.label}
                            </span>
                        </div>

                        <div className="flex justify-between items-end font-black mt-2">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Cliente</p>
                                <p className="text-xl">{c.nome}</p>
                            </div>
                            <p className="text-2xl text-red-600 leading-none">{fmtMoeda(c.saldo)}</p>
                        </div>

                        <a href={`https://wa.me/55${c.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(msgZap)}`} target="_blank" rel="noreferrer" className="bg-green-600 text-white p-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md">
                            <MessageCircle size={24}/> Cobrar WhatsApp
                        </a>
                    </div>
                 )
             })}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex h-20 shadow-2xl z-50 items-center px-4">
        <button onClick={() => setTela("inicio")} className={`flex-1 flex flex-col items-center gap-1 ${tela === "inicio" ? "text-blue-700" : "text-gray-300"}`}><Home size={28}/><span className="text-[10px] font-bold">Início</span></button>
        <button onClick={() => setTela("clientes")} className={`flex-1 flex flex-col items-center gap-1 ${tela === "clientes" ? "text-blue-700" : "text-gray-300"}`}><Users size={28}/><span className="text-[10px] font-bold">Clientes</span></button>
        <button onClick={() => setTela("cobrancas")} className={`flex-1 flex flex-col items-center gap-1 ${tela === "cobrancas" ? "text-blue-700" : "text-gray-300"}`}><Bell size={28}/><span className="text-[10px] font-bold">Cobrar</span></button>
      </nav>

      {modalCad && <ModalCadastro inicial={modalCad} aoSalvar={handleSalvar} aoFechar={() => setModalCad(null)} aoApagar={() => handleApagar(modalCad.id, modalCad.nome)} />}
      {mov && <ModalMovimentacao cliente={mov.c} tipo={mov.t} onConfirmar={handleMov} onFechar={() => setMov(null)} />}
    </div>
  );
}
