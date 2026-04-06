import { Feather } from "@expo/vector-icons";
import React, { useState, useRef } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useClientes, type Cliente } from "@/context/ClientesContext";
import { useColors } from "@/hooks/useColors";
import { calcularPercentualUtilizado, formatarMoeda } from "@/lib/utils";

/* ─── Máscaras ─────────────────────────────────────── */
function mascaraTelefone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2)  return d.length ? `(${d}` : "";
  if (d.length <= 7)  return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function mascaraMoeda(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const num = parseInt(digits, 10) / 100;
  return num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function limiteNumerico(str: string): number {
  return parseFloat(str.replace(/\./g, "").replace(",", ".")) || 0;
}

/* ─── Card de cliente ──────────────────────────────── */
function ClienteCard({ cliente }: { cliente: Cliente }) {
  const colors = useColors();
  const pct = calcularPercentualUtilizado(cliente.saldoDevedor, cliente.limiteCredito);
  const isAtrasado = cliente.diasAtraso > 0;
  const statusColor = isAtrasado ? colors.danger : colors.success;
  const statusBg    = isAtrasado ? colors.dangerLight : colors.successLight;
  const barColor    = pct >= 90 ? colors.danger : pct >= 70 ? colors.warning : colors.success;
  const limiteLivre = Math.max(cliente.limiteCredito - cliente.saldoDevedor, 0);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: isAtrasado ? colors.danger + "50" : colors.border, borderWidth: isAtrasado ? 2 : 1 }]}>
      {/* Linha principal */}
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: statusBg }]}>
          <Text style={[styles.avatarText, { color: statusColor }]}>
            {cliente.nome.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: colors.foreground }]}>{cliente.nome}</Text>
          {!!cliente.endereco && (
            <Text style={[styles.cardAddr, { color: colors.mutedForeground }]} numberOfLines={1}>
              {cliente.endereco}
            </Text>
          )}
          <View style={styles.statusRow}>
            <Feather name={isAtrasado ? "alert-circle" : "check-circle"} size={16} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {isAtrasado ? `${cliente.diasAtraso} dias em atraso` : "Em dia"}
            </Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={[styles.valorLabel, { color: colors.mutedForeground }]}>Deve</Text>
          <Text style={[styles.valorNum, { color: isAtrasado ? colors.danger : colors.foreground }]}>
            {formatarMoeda(cliente.saldoDevedor)}
          </Text>
        </View>
      </View>

      {/* Limite */}
      <View style={[styles.limiteRow, { backgroundColor: colors.background, borderRadius: 10 }]}>
        <View>
          <Text style={[styles.limiteLabel, { color: colors.mutedForeground }]}>LIMITE TOTAL</Text>
          <Text style={[styles.limiteVal, { color: colors.foreground }]}>{formatarMoeda(cliente.limiteCredito)}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.limiteLabel, { color: colors.mutedForeground }]}>DISPONÍVEL</Text>
          <Text style={[styles.limiteVal, { color: limiteLivre <= 0 ? colors.danger : colors.success }]}>
            {formatarMoeda(limiteLivre)}
          </Text>
        </View>
      </View>

      {/* Barra */}
      <View style={styles.barSection}>
        <View style={styles.barHeader}>
          <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>Crédito utilizado</Text>
          <Text style={[styles.barPct, { color: barColor }]}>{pct.toFixed(0)}%</Text>
        </View>
        <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
          <View style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: barColor }]} />
        </View>
      </View>
    </View>
  );
}

/* ─── Modal de cadastro ────────────────────────────── */
interface ModalCadastroProps {
  onSalvar: (dados: { nome: string; endereco: string; telefone: string; limiteCredito: number }) => void;
  onFechar: () => void;
}

function ModalCadastro({ onSalvar, onFechar }: ModalCadastroProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [nome,      setNome]      = useState("");
  const [endereco,  setEndereco]  = useState("");
  const [telefone,  setTelefone]  = useState("");
  const [limiteStr, setLimiteStr] = useState("");
  const [erro,      setErro]      = useState("");

  function salvar() {
    if (!nome.trim()) { setErro("Por favor, informe o nome do cliente."); return; }
    if (telefone.replace(/\D/g, "").length < 10) { setErro("Informe o telefone com DDD (mínimo 10 dígitos)."); return; }
    if (!limiteStr) { setErro("Informe o limite de crédito."); return; }
    const limite = limiteNumerico(limiteStr);
    if (limite <= 0) { setErro("O limite de crédito deve ser maior que zero."); return; }
    onSalvar({ nome: nome.trim(), endereco: endereco.trim(), telefone, limiteCredito: limite });
  }

  const inputStyle = [styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }];
  const labelStyle = [styles.fieldLabel, { color: colors.foreground }];

  return (
    <Modal animationType="slide" transparent presentationStyle="overFullScreen" onRequestClose={onFechar}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <Pressable style={styles.modalOverlay} onPress={onFechar} />
        <View style={[styles.modalSheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Cabeçalho */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Cadastrar Novo Cliente</Text>
            <Pressable onPress={onFechar} style={[styles.closeBtn, { backgroundColor: colors.muted }]}>
              <Feather name="x" size={20} color={colors.mutedForeground} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.formBody}>

              {/* Nome */}
              <View style={styles.field}>
                <View style={styles.fieldLabelRow}>
                  <Feather name="user" size={18} color={colors.primary} />
                  <Text style={labelStyle}>Nome Completo</Text>
                </View>
                <TextInput
                  style={inputStyle}
                  placeholder="Ex: Maria da Silva"
                  placeholderTextColor={colors.mutedForeground}
                  value={nome}
                  onChangeText={setNome}
                  autoFocus
                />
              </View>

              {/* Endereço */}
              <View style={styles.field}>
                <View style={styles.fieldLabelRow}>
                  <Feather name="map-pin" size={18} color={colors.primary} />
                  <Text style={labelStyle}>Endereço</Text>
                </View>
                <TextInput
                  style={inputStyle}
                  placeholder="Ex: Rua das Flores, 123"
                  placeholderTextColor={colors.mutedForeground}
                  value={endereco}
                  onChangeText={setEndereco}
                />
              </View>

              {/* Telefone */}
              <View style={styles.field}>
                <View style={styles.fieldLabelRow}>
                  <Feather name="phone" size={18} color={colors.primary} />
                  <Text style={labelStyle}>Telefone WhatsApp</Text>
                </View>
                <TextInput
                  style={inputStyle}
                  placeholder="(00) 00000-0000"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="phone-pad"
                  value={telefone}
                  onChangeText={(v) => setTelefone(mascaraTelefone(v))}
                />
              </View>

              {/* Limite */}
              <View style={styles.field}>
                <View style={styles.fieldLabelRow}>
                  <Feather name="dollar-sign" size={18} color="#16a34a" />
                  <Text style={labelStyle}>Limite de Crédito</Text>
                </View>
                <View style={styles.limiteInputWrap}>
                  <View style={[styles.limitePrefix, { backgroundColor: "#dcfce7" }]}>
                    <Text style={styles.limitePrefixText}>R$</Text>
                  </View>
                  <TextInput
                    style={[inputStyle, styles.limiteInput]}
                    placeholder="0,00"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="numeric"
                    value={limiteStr}
                    onChangeText={(v) => setLimiteStr(mascaraMoeda(v))}
                  />
                </View>
                {!!limiteStr && (
                  <Text style={styles.limitePreview}>Limite: R$ {limiteStr}</Text>
                )}
              </View>

              {/* Erro */}
              {!!erro && (
                <View style={styles.erroBox}>
                  <Feather name="alert-circle" size={16} color="#dc2626" />
                  <Text style={styles.erroText}>{erro}</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Botão Salvar */}
          <View style={styles.modalFooter}>
            <Pressable
              style={({ pressed }) => [styles.salvarBtn, { opacity: pressed ? 0.88 : 1 }]}
              onPress={salvar}
            >
              <Feather name="check-circle" size={24} color="#fff" />
              <Text style={styles.salvarBtnText}>Salvar Cliente</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ─── Tela Clientes ─────────────────────────────────── */
export default function ClientesScreen() {
  const colors  = useColors();
  const insets  = useSafeAreaInsets();
  const isWeb   = Platform.OS === "web";
  const topPad  = isWeb ? 67 : insets.top + 16;

  const { clientes, adicionarCliente } = useClientes();
  const [modalAberto, setModalAberto] = useState(false);

  const emAtraso = clientes.filter((c) => c.diasAtraso > 0).length;

  function salvarCliente(dados: { nome: string; endereco: string; telefone: string; limiteCredito: number }) {
    adicionarCliente(dados);
    setModalAberto(false);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad }]}>
        <Text style={styles.headerTitle}>Clientes</Text>
        <Text style={styles.headerSub}>
          {clientes.length} cadastrado{clientes.length !== 1 ? "s" : ""} · {emAtraso} em atraso
        </Text>
      </View>

      <FlatList
        data={clientes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ClienteCard cliente={item} />}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: isWeb ? 120 : insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListHeaderComponent={
          /* Botão + Cadastrar Novo Cliente */
          <Pressable
            style={({ pressed }) => [styles.cadastrarBtn, { opacity: pressed ? 0.88 : 1 }]}
            onPress={() => setModalAberto(true)}
          >
            <Feather name="plus-circle" size={26} color="#fff" strokeWidth={2} />
            <Text style={styles.cadastrarBtnText}>+ Cadastrar Novo Cliente</Text>
          </Pressable>
        }
        ListEmptyComponent={
          <View style={[styles.emptyBox, { borderColor: colors.border }]}>
            <Feather name="users" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>Nenhum cliente ainda</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Toque em "+ Cadastrar Novo Cliente" para adicionar o primeiro.
            </Text>
          </View>
        }
      />

      {modalAberto && (
        <ModalCadastro onSalvar={salvarCliente} onFechar={() => setModalAberto(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold", color: "#ffffff" },
  headerSub: { fontSize: 15, fontFamily: "Inter_400Regular", color: "#bfdbfe", marginTop: 2 },
  list: { padding: 16, gap: 0 },

  /* Botão cadastrar */
  cadastrarBtn: {
    backgroundColor: "#16a34a",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  cadastrarBtnText: { color: "#fff", fontSize: 20, fontFamily: "Inter_700Bold" },

  /* Card */
  card: {
    borderRadius: 16, padding: 16, gap: 14,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
    marginBottom: 12,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 24, fontFamily: "Inter_700Bold" },
  cardInfo: { flex: 1, gap: 2 },
  cardName: { fontSize: 19, fontFamily: "Inter_700Bold" },
  cardAddr: { fontSize: 13, fontFamily: "Inter_400Regular" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 2 },
  statusText: { fontSize: 15, fontFamily: "Inter_500Medium" },
  cardRight: { alignItems: "flex-end" },
  valorLabel: { fontSize: 12, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.5 },
  valorNum: { fontSize: 18, fontFamily: "Inter_700Bold" },

  /* Limite row */
  limiteRow: { flexDirection: "row", justifyContent: "space-between", padding: 12 },
  limiteLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  limiteVal: { fontSize: 16, fontFamily: "Inter_700Bold", marginTop: 2 },

  /* Barra */
  barSection: { gap: 6 },
  barHeader: { flexDirection: "row", justifyContent: "space-between" },
  barLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  barPct: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  barTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  barFill: { height: 8, borderRadius: 4 },

  /* Empty */
  emptyBox: {
    borderRadius: 16, borderWidth: 2, borderStyle: "dashed",
    padding: 32, alignItems: "center", gap: 10, marginTop: 8,
  },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center" },

  /* Modal */
  modalOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)" },
  modalSheet: {
    marginTop: "auto",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 12, marginBottom: 4 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  formBody: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 20 },
  field: { gap: 8 },
  fieldLabelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  fieldLabel: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  input: {
    borderWidth: 2, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 18, fontFamily: "Inter_400Regular",
  },
  limiteInputWrap: { flexDirection: "row", gap: 0 },
  limitePrefix: {
    borderTopLeftRadius: 14, borderBottomLeftRadius: 14,
    paddingHorizontal: 14, justifyContent: "center", alignItems: "center",
  },
  limitePrefixText: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#16a34a" },
  limiteInput: { flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, fontSize: 20, fontFamily: "Inter_700Bold" },
  limitePreview: { fontSize: 14, fontFamily: "Inter_500Medium", color: "#16a34a", paddingLeft: 4 },
  erroBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#fef2f2", borderRadius: 12, padding: 14 },
  erroText: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium", color: "#dc2626" },
  modalFooter: { paddingHorizontal: 20, paddingTop: 12 },
  salvarBtn: {
    backgroundColor: "#16a34a", borderRadius: 16, height: 60,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    shadowColor: "#16a34a", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  salvarBtnText: { color: "#fff", fontSize: 20, fontFamily: "Inter_700Bold" },
});
