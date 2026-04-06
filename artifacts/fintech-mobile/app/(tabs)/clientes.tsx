import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { Cliente, clientes } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";
import {
  calcularPercentualUtilizado,
  formatarMoeda,
} from "@/lib/utils";

function CreditBar({
  utilizado,
  limite,
}: {
  utilizado: number;
  limite: number;
}) {
  const colors = useColors();
  const pct = calcularPercentualUtilizado(utilizado, limite);
  const barColor =
    pct >= 90
      ? colors.destructive
      : pct >= 70
      ? colors.warning
      : colors.success;

  return (
    <View style={styles.barContainer}>
      <View style={styles.barLabels}>
        <Text style={[styles.barText, { color: colors.mutedForeground }]}>
          Limite: {formatarMoeda(limite)}
        </Text>
        <Text style={[styles.barPct, { color: barColor }]}>
          {pct.toFixed(0)}%
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
  );
}

function ClienteCard({ cliente }: { cliente: Cliente }) {
  const colors = useColors();
  const isAtrasado = cliente.diasAtraso > 0;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isAtrasado ? colors.warning + "60" : colors.border,
          borderWidth: isAtrasado ? 1.5 : 1,
        },
      ]}
    >
      <View style={styles.cardTop}>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: isAtrasado
                ? colors.warningLight
                : colors.secondary,
            },
          ]}
        >
          <Text
            style={[
              styles.avatarText,
              { color: isAtrasado ? colors.warning : colors.primary },
            ]}
          >
            {cliente.nome.charAt(0)}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: colors.foreground }]}>
            {cliente.nome}
          </Text>
          <View style={styles.cardRow}>
            {isAtrasado ? (
              <View style={styles.badgeRow}>
                <Feather
                  name="alert-triangle"
                  size={12}
                  color={colors.warning}
                />
                <Text style={[styles.badgeText, { color: colors.warning }]}>
                  {cliente.diasAtraso}d atraso
                </Text>
              </View>
            ) : (
              <View style={styles.badgeRow}>
                <Feather name="check-circle" size={12} color={colors.success} />
                <Text style={[styles.badgeText, { color: colors.success }]}>
                  Em dia
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={[styles.cardValue, { color: isAtrasado ? colors.destructive : colors.foreground }]}>
            {formatarMoeda(cliente.saldoDevedor)}
          </Text>
          <Text style={[styles.cardValueLabel, { color: colors.mutedForeground }]}>
            saldo devedor
          </Text>
        </View>
      </View>
      <CreditBar utilizado={cliente.saldoDevedor} limite={cliente.limiteCredito} />
    </View>
  );
}

export default function ClientesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Clientes" subtitle={`${clientes.length} clientes cadastrados`} />
      <FlatList
        data={clientes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ClienteCard cliente={item} />}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  card: {
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  cardName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  cardRow: {
    flexDirection: "row",
    gap: 6,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  cardRight: {
    alignItems: "flex-end",
  },
  cardValue: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  cardValueLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  barContainer: {
    gap: 4,
  },
  barLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  barText: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  barPct: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
});
