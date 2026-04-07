import React, { useState, useEffect, useMemo } from "react";
import {
  AlertCircle, Bell, CheckCircle, ChevronRight,
  DollarSign, Home, MapPin, MessageCircle, Phone,
  Plus, User, UserPlus, Users, X, 
  Trash2, Search, Calendar, Clock, Pencil
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

const obterDataLocalISO = () => {
  const d = new Date();
  const z = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - z).toISOString().split("T")[0];
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

const calcularStatusPrazo = (c: any) => {
  const hojeStr = obterDataLocalISO();

  if (c.saldo <= 0) return { label: "Em Dia", color: "text-green-600 bg-green-50", icon: CheckCircle, tipo: 'em_dia' };

  if (c.vencimento < hojeStr) return { label: `Atrasado`, color: "text-red-600 bg-red-50", icon: AlertCircle, tipo: 'atrasado' };
  if (c.vencimento === hojeStr) return { label: "Vence Hoje", color: "text-orange-600 bg-orange-50", icon: Clock, tipo: 'hoje' };
  return { label: `No Prazo`, color: "text-blue-600 bg-blue-50", icon: Calendar, tipo: 'no_prazo' };
};

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
  if (status.tipo === 'no_prazo') {
      return `Oi ${nomeC}! Passando para informar que sua conta no valor de ${valorC} tem vencimento para o dia ${dataC}. Qualquer dúvida estamos à disposição. Tenha um ótimo dia!`;
  }
  return `${saudacao} ${nomeC}! Passando apenas para agradecer a sua parceria e por manter o seu saldo em dia! Conte sempre conosco!`;
};

/* ─────────────────────────────────────────────────
   2. MODAIS
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

function ModalCadastro({ inicial, aoSalvar, aoFechar }: any) {
  const hoje = obterDataLocalISO();
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
          <h2 className="text-2xl font-bold">{inicial?.id ? "Editar Cadastro" : "Cadastrar Novo Cliente"}</h2>
          <button onClick={aoFechar} className="p-2 bg-gray-100 rounded-full text-gray-400"><X /></button>
        </div>
        <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-gray-400 uppercase">Nome Completo</label><input className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 font-bold" value={nome} onChange={e => setNome(e.target.value)} /></div>
        <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-gray-400 uppercase">Endereço</label><input className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 font-bold" value={end} onChange={e => setEnd(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-gray-400 uppercase">Compra</label><input type="date" className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 font-bold text-sm" value={dtCompra} onChange={e => setDtCompra(e.target.value)} /></div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-gray-400 uppercase">Vencimento</label><input type="date" className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 font-bold text-sm" value={dtVenc} onChange={e => setDtVenc(e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-gray-400 uppercase">WhatsApp</label><input className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 font-bold" value={tel} onChange={e => setTel(maskTelefone(e.target.value))} /></div>
          <div className="flex flex-col gap-1.5"><label className="text-xs font-bold text-gray-400 uppercase">Limite R$</label><input className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 font-bold" value={lim} onChange={e => setLim(maskMoeda(e.target.value))} /></div>
        </div>
        <button onClick={() => aoSalvar({ nome, endereco: end, telefone: tel, limite: parseFloat(lim.replace(/\./g, "").replace(",", ".")) || 0, dataCompra: dtCompra, vencimento: dtVenc })} className="w-full bg-green-600 text-white py-5 rounded-2xl font-bold text-xl shadow-lg mt-2 active:scale-95">Salvar</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────
   4. TELAS
───────────────────────────────────────────────── */
function TelaInicio({ clientes, setTela, abrirCad, setFiltroCobranca }: any) {
  const hojeStr = obterDataLocalISO();
  const totalReceber = useMemo(() => clientes.reduce((acc: any, c: any) => acc + c.saldo, 0), [clientes]);

  const noPrazo = clientes.filter(c => c.saldo > 0 && c.vencimento >= hojeStr);
  const emAtraso = clientes.filter(c => c.saldo > 0 && c.vencimento < hojeStr);
  const emDia = clientes.filter(c => c.saldo <= 0);

  return (
    <div className="p-4 flex flex-col gap-6 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-sm p-8 flex flex-col items-center gap-2 border border-gray-100">
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total a Receber</p>
        <p className="text-5xl font-black text-red-600">{fmtMoeda(totalReceber)}</p>
        <div className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 mt-2">
          <AlertCircle size={14}/> {fmtMoeda(emAtraso.reduce((acc, c) => acc + c.saldo, 0))} em atraso
        </div>
      </div>

      {/* DASHBOARD EM UMA LINHA SÓ */}
      <div className="grid grid-cols-3 gap-2">
        <div onClick={() => { setFiltroCobranca('no_prazo'); setTela("cobrancas"); }} className="bg-white rounded-2xl p-3 py-5 flex flex-col items-center gap-1 shadow-sm border border-gray-50 active:scale-95 cursor-pointer">
          <Clock size={20} className="text-blue-600" />
          <p className="text-lg font-black mt-1">{noPrazo.length}</p>
          <p className="text-[9px] text-gray-400 font-bold uppercase text-center">No Prazo</p>
        </div>
        <div onClick={() => { setFiltroCobranca('atrasado'); setTela("cobrancas"); }} className="bg-red-50 rounded-2xl p-3 py-5 flex flex-col items-center gap-1 border border-red-100 active:scale-95 cursor-pointer">
          <AlertCircle size={20} className="text-red-600" />
          <p className="text-lg font-black text-red-600 mt-1">{emAtraso.length}</p>
          <p className="text-[9px] text-red-400 font-bold uppercase text-center">Em Atraso</p>
        </div>
        <div onClick={() => { setFiltroCobranca('em_dia'); setTela("cobrancas"); }} className="bg-green-50 rounded-2xl p-3 py-5 flex flex-col items-center gap-1 border border-green-100 active:scale-95 cursor-pointer">
          <CheckCircle size={20} className="text-green-600" />
          <p className="text-lg font-black text-green-600 mt-1">{emDia.length}</p>
          <p className="text-[9px] text-green-600 font-bold uppercase text-center">Em Dia</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-1">
        <button onClick={abrirCad} className="bg-green-600 text-white p-5 rounded-2xl flex items-center gap-4 font-bold shadow-lg active:scale-95">
          <div className="bg-white/20 p-2 rounded-xl"><UserPlus size={24}/></div>
          <p className="text-lg">Cadastrar Novo Cliente</p>
          <ChevronRight className="ml-auto opacity-50" />
        </button>
        <button onClick={() => setTela("clientes")} className="bg-blue-700 text-white p-5 rounded-2xl flex items-center gap-4 font-bold shadow-lg active:scale-95">
          <div className="bg-white/20 p-2 rounded-xl"><Users size={24}/></div>
          <p className="text-lg">Ver Lista de Clientes</p>
          <ChevronRight className="ml-auto opacity-50" />
        </button>
      </div>
    </div>
  );
}

function TelaClientes({ clientes, onLancar, onEditar, onApagar, abrirCad }: any) {
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
        const status = calcularStatusPrazo(c);
        const limiteLivre = c.limite - c.saldo;

        return (
          <div key={c.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                    <p className="text-xl font-black text-gray-800">{c.nome}</p>
                    <div className="flex gap-2">
                        <button onClick={() => onEditar(c)} className="text-blue-500 bg-blue-50 p-2 rounded-lg active:scale-90"><Pencil size={18}/></button>
                        <button onClick={() => onApagar(c)} className="text-red-400 bg-red-50 p-2 rounded-lg active:scale-90"><Trash2 size={18}/></button>
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase flex items-center gap-1 ${status.color}`}>
                    <status.icon size={12}/> {status.label}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-end border-t border-gray-50 pt-2">
                <p className={`text-[10px] font-bold uppercase ${limiteLivre < 0 ? 'text-red-500' : 'text-gray-400'}`}>Livre: {fmtMoeda(limiteLivre)}</p>
                <p className="text-2xl font-black text-red-600 leading-none">{fmtMoeda(c.saldo)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <button onClick={() => onLancar(c, 'compra')} className="bg-blue-50 text-blue-700 py-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 active:scale-95">Venda (+)</button>
              <button onClick={() => onLancar(c, 'pagamento')} className="bg-green-50 text-green-700 py-3 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 active:scale-95">Pagou ($)</button>
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
  const [filtroCobranca, setFiltroCobranca] = useState('todos');
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
      setClientes([{ id: Date.now().toString(), saldo: 0, teveCompra: false, ...dados }, ...clientes]);
    }
    setModalCad(null);
  };

  const handleApagar = (cliente: any) => {
      const msg = cliente.saldo > 0 ? `Atenção! ${cliente.nome} deve ${fmtMoeda(cliente.saldo)}. Excluir?` : `Excluir ${cliente.nome}?`;
      if(confirm(msg)) setClientes(clientes.filter(c => c.id !== cliente.id));
  };

  const handleMov = (valor: number) => {
    const isCompra = mov.t === 'compra';
    const f = isCompra ? 1 : -1;
    setClientes(clientes.map(c => 
      c.id === mov.c.id 
        ? { ...c, saldo: Math.max(0, c.saldo + (valor * f)), teveCompra: isCompra ? true : c.teveCompra } 
        : c
    ));
    setMov(null);
  };

  const titulos:any = { atrasado: "Clientes em Atraso", em_dia: "Clientes em Dia", no_prazo: "Clientes no Prazo", todos: "Todos os Clientes" };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-24 font-sans text-gray-900">
      <header className="bg-blue-700 text-white p-6 pt-12 pb-8 shadow-xl">
        <h1 className="text-4xl font-black tracking-tighter text-center">FiadoControl</h1>
      </header>

      <main className="flex-1 overflow-y-auto">
        {tela === "inicio" && <TelaInicio clientes={clientes} setTela={setTela} abrirCad={() => setModalCad({})} setFiltroCobranca={setFiltroCobranca} />}
        {tela === "clientes" && <TelaClientes clientes={clientes} abrirCad={() => setModalCad({})} onLancar={(c:any, t:any) => setMov({c, t})} onEditar={setModalCad} onApagar={handleApagar} />}
        {tela === "cobrancas" && (
          <div className="p-4 flex flex-col gap-4">
             <p className="text-xl font-black text-gray-800 mb-2 border-b pb-2">{titulos[filtroCobranca]}</p>
             {clientes.map(c => {
                 const status = calcularStatusPrazo(c);
                 if (filtroCobranca !== 'todos' && status.tipo !== filtroCobranca && !(filtroCobranca === 'no_prazo' && status.tipo === 'hoje')) return null;

                 const msgZap = gerarMensagemWhatsapp(c, status);
                 const isBom = status.tipo === 'em_dia';

                 return (
                    <div key={c.id} className={`bg-white p-6 rounded-[32px] border-l-8 shadow-sm flex flex-col gap-4 relative ${isBom ? 'border-green-500' : 'border-orange-500'}`}>
                        <div className="absolute top-3 right-5 items-center gap-1 flex">
                            <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase flex items-center gap-1 ${status.color}`}>
                                <status.icon size={12}/> {status.label}
                            </span>
                        </div>
                        <div className="flex justify-between items-end font-black mt-2">
                            <div><p className="text-[10px] text-gray-400 font-bold uppercase">Cliente</p><p className="text-xl">{c.nome}</p></div>
                            <p className="text-2xl text-red-600 leading-none">{fmtMoeda(c.saldo)}</p>
                        </div>
                        <a href={`https://wa.me/55${c.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(msgZap)}`} target="_blank" rel="noreferrer" className={`text-white p-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 shadow-md ${isBom ? 'bg-green-600' : 'bg-orange-600'}`}>
                            <MessageCircle size={24}/> {isBom ? 'Enviar Mensagem' : 'Cobrar WhatsApp'}
                        </a>
                    </div>
                 )
             })}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex h-20 shadow-2xl z-50 items-center px-4">
        <button onClick={() => setTela("inicio")} className={`flex-1 flex flex-col items-center gap-1 ${tela === "inicio" ? "text-blue-700" : "text-gray-300"}`}><Home size={28}/><span className="text-[10px] font-bold">Início</span></button>
        <button onClick={() => setTela("clientes")} className={`flex-1 flex flex-col items-center gap-1 ${tela === "clientes" ? "text-blue-700" : "text-gray-300"}`}><Users size={28}/><span className="text-[10px] font-bold">Lista</span></button>
        <button onClick={() => { setFiltroCobranca('todos'); setTela("cobrancas"); }} className={`flex-1 flex flex-col items-center gap-1 ${tela === "cobrancas" ? "text-blue-700" : "text-gray-300"}`}><Bell size={28}/><span className="text-[10px] font-bold">Cobrar</span></button>
      </nav>

      {modalCad && <ModalCadastro inicial={modalCad} aoSalvar={handleSalvar} aoFechar={() => setModalCad(null)} />}
      {mov && <ModalMovimentacao cliente={mov.c} tipo={mov.t} onConfirmar={handleMov} onFechar={() => setMov(null)} />}
    </div>
  );
}
