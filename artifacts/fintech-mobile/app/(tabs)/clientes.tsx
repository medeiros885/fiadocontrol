import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Cliente, clientes } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";
import { calcularPercentualUtilizado, formatarMoeda } from "@/lib/utils";

function ClienteCard({ cliente }: { cliente: Cliente }) {
  const colors = useColors();
  const pct = calcularPercentualUtilizado(cliente.saldoDevedor, cliente.limiteCredito);
  const isAtrasado = cliente.diasAtraso > 0;

  const statusColor = isAtrasado ? colors.danger : colors.success;
  const statusBg = isAtrasado ? colors.dangerLight : colors.successLight;
  const barColor =
    pct >= 90 ? colors.danger : pct >= 70 ? colors.warning : colors.success;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isAtrasado ? colors.danger + "50" : colors.border,
          borderWidth: isAtrasado ? 2 : 1,
        },
      ]}
    >
      {/* Linha principal */}
      <View style={styles.cardTop}>
        <View style={[styles.avatar, { backgroundColor: statusBg }]}>
          <Text style={[styles.avatarText, { color: statusColor }]}>
            {cliente.nome.charAt(0)}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: colors.foreground }]}>
            {cliente.nome}
          </Text>
          <View style={styles.statusRow}>
            <Feather
              name={isAtrasado ? "alert-circle" : "check-circle"}
              size={16}
              color={statusColor}
            />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {isAtrasado ? `${cliente.diasAtraso} dias em atraso` : "Em dia"}
            </Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={[styles.valorLabel, { color: colors.mutedForeground }]}>
            Deve
          </Text>
          <Text style={[styles.valorNum, { color: isAtrasado ? colors.danger : colors.foreground }]}>
            {formatarMoeda(cliente.saldoDevedor)}
          </Text>
        </View>
      </View>

      {/* Barra de limite */}
      <View style={styles.barSection}>
        <View style={styles.barHeader}>
          <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>
            Limite: {formatarMoeda(cliente.limiteCredito)}
          </Text>
          <Text style={[styles.barPct, { color: barColor }]}>
            {pct.toFixed(0)}% usado
          </Text>
        </View>
        <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.barFill,
              { width: `${pct}%` as any, backgroundColor: barColor },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

export default function ClientesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top + 16;

  const emAtraso = clientes.filter((c) => c.diasAtraso > 0).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.primary, paddingTop: topPad },
        ]}
      >
        <Text style={styles.headerTitle}>Clientes</Text>
        <Text style={styles.headerSub}>
          {clientes.length} cadastrados · {emAtraso} em atraso
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
      />
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
    color: "#bfdbfe",
    marginTop: 2,
  },
  list: { padding: 16 },
  card: {
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTop: {
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
  cardInfo: { flex: 1, gap: 4 },
  cardName: {
    fontSize: 19,
    fontFamily: "Inter_700Bold",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  cardRight: { alignItems: "flex-end" },
  valorLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valorNum: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  barSection: { gap: 6 },
  barHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  barLabel: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  barPct: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
});
