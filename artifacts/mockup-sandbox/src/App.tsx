import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  AlertCircle, Bell, CheckCircle, ChevronRight,
  DollarSign, Home, MapPin, MessageCircle, Phone,
  Plus, User, UserPlus, Users, X, ShoppingCart, 
  Trash2, HandCoins, Search, Edit3, Save, ArrowLeft
} from "lucide-react";

/* ─────────────────────────────────────────────────
   1. UTILITÁRIOS E FORMATAÇÃO
───────────────────────────────────────────────── */
const fmtMoeda = (v: number) => 
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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

const getMsgCobranca = (nome: string, valor: number) => {
  return `Olá ${nome}, tudo bem? Passando para lembrar do seu saldo em aberto aqui na loja no valor de ${fmtMoeda(valor)}. Quando puder, passa aqui ou pede a chave PIX! Abraço.`;
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

const BotaoAcao = ({ label, icon: Icon, onClick, color = "blue" }: any) => {
  const colors: any = {
    blue: "bg-blue-600 active:bg-blue-800",
    green: "bg-green-600 active:bg-green-800",
    orange: "bg-orange-500 active:bg-orange-700",
    red: "bg-red-600 active:bg-red-800",
  };
  return (
    <button 
      onClick={onClick}
      className={`${colors[color]} text-white p-4 rounded-2xl flex items-center gap-4 shadow-md transition-all active:scale-95`}
    >
      <div className="bg-white/20 p-2 rounded-xl"><Icon size={24}/></div>
      <div className="text-left">
        <p className="font-bold text-lg leading-tight">{label}</p>
      </div>
      <ChevronRight className="ml-auto opacity-50" size={20} />
    </button>
  );
};

/* ─────────────────────────────────────────────────
   3. MODAIS
───────────────────────────────────────────────── */
function ModalBase({ titulo, fechar, children }: any) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex flex-col animate-in fade-in duration-200" onClick={fechar}>
      <div 
        className="mt-auto bg-gray-50 rounded-t-[32px] p-6 pb-10 flex flex-col gap-6 shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-gray-800">{titulo}</h2>
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
  const devedores = clientes.filter((c: any) => c.saldo > 0).length;

  return (
    <div className="p-5 flex flex-col gap-6 animate-in slide-in-from-right-4">
      {/* Card de Saldo */}
      <div className="bg-white rounded-[24px] p-8 shadow-sm border border-gray-100 flex flex-col items-center gap-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5"><DollarSign size={80}/></div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total a Receber</p>
        <p className="text-5xl font-black text-red-600">{fmtMoeda(total)}</p>
        <div className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 mt-2">
          <AlertCircle size={16}/> {devedores} clientes pendentes
        </div>
      </div>

      <p className="text-xl font-black text-gray-800 mt-2">Menu Principal</p>

      <BotaoAcao label="Novo Cadastro" icon={UserPlus} color="green" onClick={abrirCadastro} />
      <BotaoAcao label="Ver Lista de Clientes" icon={Users} color="blue" onClick={() => setTela("clientes")} />
      <BotaoAcao label="Cobranças Pendentes" icon={Bell} color="orange" onClick={() => setTela("cobrancas")} />
    </div>
  );
}

/* ─────────────────────────────────────────────────
   5. TELA: LISTA DE CLIENTES
───────────────────────────────────────────────── */
function TelaLista({ clientes, onLancar, onApagar, onEditar, abrirCadastro }: any) {
  const [busca, setBusca] = useState("");

  const filtrados = clientes.filter((c: any) => 
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-5 flex flex-col gap-4 animate-in slide-in-from-right-4">
      <div className="relative mb-2">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
        <input 
          className="w-full bg-white border-2 border-gray-100 rounded-2xl pl-12 pr-4 py-4 font-bold shadow-sm focus:border-blue-500 outline-none transition-all"
          placeholder="Buscar por nome..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      <button onClick={abrirCadastro} className="bg-blue-700 text-white p-4 rounded-2xl font-bold flex justify-center items-center gap-2 shadow-lg mb-2">
        <Plus size={24}/> Adicionar Novo Cliente
      </button>

      {filtrados.length === 0 ? (
        <div className="text-center py-20 opacity-30 font-bold">Nenhum cliente encontrado.</div>
      ) : (
        filtrados.map((c: any) => {
          const pct = (c.saldo / c.limite) * 100;
          return (
            <div key={c.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div onClick={() => onEditar(c)} className="active:opacity-50">
                  <p className="text-xl font-black text-gray-800">{c.nome}</p>
                  <p className="text-sm text-gray-400 font-bold">{c.telefone}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <button onClick={() => onApagar(c)} className="text-gray-200 hover:text-red-500 p-1"><Trash2 size={20}/></button>
                   <p className="text-2xl font-black text-red-600">{fmtMoeda(c.saldo)}</p>
                </div>
              </div>

              <div className="bg-gray-50 h-3 rounded-full overflow-hidden border border-gray-100">
                <div 
                  className={`h-full transition-all duration-500 ${pct > 90 ? 'bg-red-600' : pct > 60 ? 'bg-orange-500' : 'bg-blue-600'}`} 
                  style={{ width: `${Math.min(pct, 100)}%` }} 
                />
              </div>
              <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                <span>Limite: {fmtMoeda(c.limite)}</span>
                <span>Livre: {fmtMoeda(c.limite - c.saldo)}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-1">
                <button 
                  onClick={() => onLancar(c, 'compra')}
                  className="bg-blue-50 text-blue-700 py-3.5 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 active:bg-blue-100"
                >
                  <Plus size={16}/> Compra
                </button>
                <button 
                  onClick={() => onLancar(c, 'pagamento')}
                  className="bg-green-50 text-green-700 py-3.5 rounded-xl font-black text-xs uppercase flex items-center justify-center gap-2 active:bg-green-100"
                >
                  <HandCoins size={16}/> Pagou
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   6. APP PRINCIPAL (LÓGICA)
───────────────────────────────────────────────── */
export default function App() {
  const [tela, setTela] = useState<Tela>("inicio");
  const [clientes, setClientes] = useState<any[]>(() => {
    const salvo = localStorage.getItem("fiado_data");
    return salvo ? JSON.parse(salvo) : [];
  });

  const [modalCad, setModalCad] = useState<any>(null); // null ou objeto cliente para editar
  const [mov, setMov] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem("fiado_data", JSON.stringify(clientes));
  }, [clientes]);

  // Funções de CRUD
  const salvarCliente = (dados: any) => {
    if (modalCad?.id) {
      setClientes(clientes.map(c => c.id === modalCad.id ? { ...c, ...dados } : c));
    } else {
      setClientes([{ id: Date.now().toString(), saldo: 0, ...dados }, ...clientes]);
    }
    setModalCad(null);
  };

  const apagarCliente = (c: any) => {
    if (c.saldo > 0) return alert("Não pode apagar cliente com dívida ativa!");
    if (confirm(`Deseja remover ${c.nome}?`)) setClientes(clientes.filter(x => x.id !== c.id));
  };

  const processarMov = (valor: number) => {
    if (!mov) return;
    const fator = mov.t === 'compra' ? 1 : -1;
    setClientes(clientes.map(c => 
      c.id === mov.c.id ? { ...c, saldo: Math.max(0, c.saldo + (valor * fator)) } : c
    ));
    setMov(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-28 font-sans">
      <header className="bg-blue-700 text-white p-6 pt-14 pb-10 flex flex-col gap-1 shadow-lg relative">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-black tracking-tighter">FiadoControl</h1>
          {tela !== "inicio" && (
            <button onClick={() => setTela("inicio")} className="p-2 bg-white/10 rounded-xl"><ArrowLeft/></button>
          )}
        </div>
        <p className="text-blue-200 font-bold text-sm">Gerenciamento Profissional de Crédito</p>
      </header>

      <main className="flex-1">
        {tela === "inicio" && <TelaDashboard clientes={clientes} setTela={setTela} abrirCadastro={() => setModalCad({})} />}
        {tela === "clientes" && <TelaLista clientes={clientes} abrirCadastro={() => setModalCad({})} onLancar={(c: any, t: any) => setMov({c, t})} onApagar={apagarCliente} onEditar={setModalCad} />}
        {tela === "cobrancas" && (
          <div className="p-5 flex flex-col gap-4 animate-in slide-in-from-right-4">
             <p className="text-xl font-black text-orange-600">Cobranças Ativas</p>
             {clientes.filter(c => c.saldo > 0).map(c => (
               <div key={c.id} className="bg-white p-5 rounded-[24px] border-l-8 border-orange-500 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between font-black">
                    <p>{c.nome}</p>
                    <p className="text-red-600">{fmtMoeda(c.saldo)}</p>
                  </div>
                  <a 
                    href={`https://wa.me/55${c.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(getMsgCobranca(c.nome, c.saldo))}`}
                    target="_blank"
                    className="w-full bg-green-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={18}/> Enviar Cobrança WhatsApp
                  </a>
               </div>
             ))}
          </div>
        )}
      </main>

      {/* Navegação Inferior */}
      <nav className="fixed bottom-6 left-5 right-5 bg-white/80 backdrop-blur-md border border-white h-20 rounded-[32px] flex shadow-2xl z-50 items-center px-4">
        <button onClick={() => setTela("inicio")} className={`flex-1 flex flex-col items-center gap-1 ${tela === "inicio" ? "text-blue-700" : "text-gray-300"}`}>
          <Home size={28} />
        </button>
        <button onClick={() => setTela("clientes")} className={`flex-1 flex flex-col items-center gap-1 ${tela === "clientes" ? "text-blue-700" : "text-gray-300"}`}>
          <Users size={28} />
        </button>
        <button onClick={() => setTela("cobrancas")} className={`flex-1 flex flex-col items-center gap-1 ${tela === "cobrancas" ? "text-blue-700" : "text-gray-300"}`}>
          <Bell size={28} />
        </button>
      </nav>

      {/* MODAL: CADASTRO / EDIÇÃO */}
      {modalCad && (
        <ModalBase titulo={modalCad.id ? "Editar Cliente" : "Novo Cliente"} fechar={() => setModalCad(null)}>
          <div className="flex flex-col gap-5">
            <FormCadastro inicial={modalCad} aoSalvar={salvarCliente} />
          </div>
        </ModalBase>
      )}

      {/* MODAL: COMPRA / PAGAMENTO */}
      {mov && (
        <ModalBase titulo={mov.t === 'compra' ? "Lançar Compra" : "Receber Pagamento"} fechar={() => setMov(null)}>
          <div className="bg-white p-6 rounded-3xl flex flex-col gap-6 shadow-inner">
             <div className="flex justify-between items-center opacity-50 font-bold">
               <p>{mov.c.nome}</p>
               <p>{mov.t === 'compra' ? `Livre: ${fmtMoeda(mov.c.limite - mov.c.saldo)}` : `Dívida: ${fmtMoeda(mov.c.saldo)}`}</p>
             </div>
             <input 
              autoFocus
              type="text" 
              inputMode="numeric" 
              placeholder="R$ 0,00"
              className="text-5xl font-black text-center w-full outline-none text-blue-700" 
              onChange={e => e.target.value = maskMoeda(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const val = parseFloat((e.target as any).value.replace(/\./g, "").replace(",", ".")) || 0;
                  processarMov(val);
                }
              }}
             />
             <p className="text-center text-xs font-bold text-gray-400">Toque em "Confirmar" ou aperte Enter</p>
             <button 
              onClick={(e) => {
                const input = e.currentTarget.parentElement?.querySelector('input');
                const val = parseFloat(input?.value.replace(/\./g, "").replace(",", ".") || "0");
                processarMov(val);
              }}
              className={`w-full py-5 rounded-2xl font-black text-xl text-white ${mov.t === 'compra' ? 'bg-blue-600' : 'bg-green-600'}`}
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
   COMPONENTES DE FORMULÁRIO SEPARADOS (PARA NÃO BUGAR FOCO)
───────────────────────────────────────────────── */
function FormCadastro({ inicial, aoSalvar }: any) {
  const [nome, setNome] = useState(inicial.nome || "");
  const [tel, setTel] = useState(inicial.telefone || "");
  const [lim, setLim] = useState(inicial.limite ? fmtMoeda(inicial.limite).replace("R$", "").trim() : "");

  return (
    <div className="flex flex-col gap-5">
      <CampoForm label="Nome do Cliente" icon={User}>
        <input className="bg-white border-2 border-gray-100 rounded-2xl p-4 font-bold outline-none focus:border-blue-500" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: João Silva" />
      </CampoForm>
      <CampoForm label="WhatsApp" icon={Phone}>
        <input className="bg-white border-2 border-gray-100 rounded-2xl p-4 font-bold outline-none focus:border-blue-500" type="tel" value={tel} onChange={e => setTel(maskTelefone(e.target.value))} placeholder="(00) 00000-0000" />
      </CampoForm>
      <CampoForm label="Limite de Crédito" icon={DollarSign}>
        <input className="bg-white border-2 border-gray-100 rounded-2xl p-4 font-bold outline-none focus:border-blue-500" value={lim} onChange={e => setLim(maskMoeda(e.target.value))} placeholder="R$ 0,00" />
      </CampoForm>
      <button 
        onClick={() => aoSalvar({ nome, telefone: tel, limite: parseFloat(lim.replace(/\./g, "").replace(",", ".")) || 0 })}
        className="bg-blue-700 text-white py-5 rounded-2xl font-black text-xl shadow-lg mt-4 flex items-center justify-center gap-2"
      >
        <Save size={24}/> {inicial.id ? "Salvar Alterações" : "Concluir Cadastro"}
      </button>
    </div>
  );
}
