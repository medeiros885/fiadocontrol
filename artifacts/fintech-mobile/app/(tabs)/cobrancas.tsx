import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import React from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Cliente, clientes } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";
import { formatarData, formatarMoeda, gerarLinkWhatsApp } from "@/lib/utils";

const emAtraso = clientes.filter((c) => c.diasAtraso > 0);

function CobrancaCard({ cliente }: { cliente: Cliente }) {
  const colors = useColors();

  const urgencia =
    cliente.diasAtraso >= 30 ? "alta" : cliente.diasAtraso >= 10 ? "media" : "baixa";
  const urgenciaLabel =
    urgencia === "alta" ? "URGENTE" : urgencia === "media" ? "ATENÇÃO" : "EM ATRASO";
  const urgenciaColor =
    urgencia === "alta" ? colors.danger : urgencia === "media" ? colors.warning : "#7c3aed";
  const urgenciaBg =
    urgencia === "alta" ? colors.dangerLight : urgencia === "media" ? colors.warningLight : "#ede9fe";

  function handleWhatsApp() {
    const msg = `Olá ${cliente.nome}! Passando para lembrar que sua dívida de ${formatarMoeda(cliente.saldoDevedor)} está em aberto há ${cliente.diasAtraso} dias (vencimento em ${formatarData(cliente.vencimento)}). Entre em contato para regularizar. Obrigado!`;
    const link = gerarLinkWhatsApp(cliente.telefone, msg);
    if (Platform.OS === "web") {
      window.open(link, "_blank");
    } else {
      Linking.openURL(link);
    }
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: urgenciaColor + "40",
          borderWidth: 2,
        },
      ]}
    >
      {/* Badge de urgência */}
      <View style={[styles.urgBadge, { backgroundColor: urgenciaBg }]}>
        <Feather name="alert-triangle" size={14} color={urgenciaColor} />
        <Text style={[styles.urgText, { color: urgenciaColor }]}>
          {urgenciaLabel} — {cliente.diasAtraso} dias em atraso
        </Text>
      </View>

      {/* Info do cliente */}
      <View style={styles.clienteRow}>
        <View style={[styles.avatar, { backgroundColor: urgenciaBg }]}>
          <Text style={[styles.avatarText, { color: urgenciaColor }]}>
            {cliente.nome.charAt(0)}
          </Text>
        </View>
        <View style={styles.clienteInfo}>
          <Text style={[styles.clienteNome, { color: colors.foreground }]}>
            {cliente.nome}
          </Text>
          <Text style={[styles.clienteVenc, { color: colors.mutedForeground }]}>
            Venceu em {formatarData(cliente.vencimento)}
          </Text>
        </View>
      </View>

      {/* Valor */}
      <View style={[styles.valorBox, { backgroundColor: colors.background }]}>
        <Text style={[styles.valorLabel, { color: colors.mutedForeground }]}>
          Valor em Aberto
        </Text>
        <Text style={[styles.valorNum, { color: colors.danger }]}>
          {formatarMoeda(cliente.saldoDevedor)}
        </Text>
      </View>

      {/* Botão WhatsApp — largura total */}
      <Pressable
        style={({ pressed }) => [
          styles.whatsBtn,
          { opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={handleWhatsApp}
      >
        <Feather name="message-circle" size={24} color="#fff" />
        <Text style={styles.whatsBtnText}>Cobrar no WhatsApp</Text>
      </Pressable>
    </View>
  );
}

export default function CobrancasScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top + 16;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.danger, paddingTop: topPad },
        ]}
      >
        <Text style={styles.headerTitle}>Cobranças</Text>
        <Text style={styles.headerSub}>
          {emAtraso.length} cliente{emAtraso.length !== 1 ? "s" : ""} precisam pagar
        </Text>
      </View>

      {emAtraso.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="check-circle" size={64} color={colors.success} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Tudo em dia!
          </Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Nenhum cliente está devendo no momento.
          </Text>
        </View>
      ) : (
        <FlatList
          data={emAtraso}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CobrancaCard cliente={item} />}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: isWeb ? 120 : insets.bottom + 110 },
          ]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: "#ffffff",
  },
  headerSub: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#fecaca",
    marginTop: 2,
  },
  list: { padding: 16 },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: "#fff",
  },
  urgBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  urgText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  clienteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
  },
  clienteInfo: { flex: 1 },
  clienteNome: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  clienteVenc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  valorBox: {
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
  valorLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valorNum: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    marginTop: 4,
  },
  whatsBtn: {
    backgroundColor: "#16a34a",
    borderRadius: 14,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  whatsBtnText: {
    color: "#ffffff",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
  },
  emptySub: {
    fontSize: 17,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
