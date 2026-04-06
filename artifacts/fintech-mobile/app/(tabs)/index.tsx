import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { clientes, resumoFinanceiro } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";
import { formatarMoeda } from "@/lib/utils";

function SummaryCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
}: {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  iconBg: string;
  iconColor: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.summaryIcon, { backgroundColor: iconBg }]}>
        <Feather name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[styles.summaryValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function ShortcutButton({
  label,
  icon,
  onPress,
  color,
}: {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  onPress: () => void;
  color: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      style={({ pressed }) => [
        styles.shortcut,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.shortcutIcon, { backgroundColor: color + "20" }]}>
        <Feather name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.shortcutLabel, { color: colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const emAtraso = clientes.filter((c) => c.diasAtraso > 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Gestão Financeira" subtitle="Visão geral da sua carteira" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: colors.navBackground }]}>
          <Text style={styles.heroLabel}>Total a Receber</Text>
          <Text style={styles.heroValue}>
            {formatarMoeda(resumoFinanceiro.totalAReceber)}
          </Text>
          <View style={styles.heroRow}>
            <View style={styles.heroBadge}>
              <Feather name="alert-circle" size={12} color="#fbbf24" />
              <Text style={styles.heroBadgeText}>
                {formatarMoeda(resumoFinanceiro.totalEmAtraso)} em atraso
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <SummaryCard
            label="Clientes"
            value={String(resumoFinanceiro.clientesAtivos)}
            icon="users"
            iconBg={colors.secondary}
            iconColor={colors.primary}
          />
          <SummaryCard
            label="Em Atraso"
            value={String(resumoFinanceiro.clientesEmAtraso)}
            icon="alert-triangle"
            iconBg={colors.warningLight}
            iconColor={colors.warning}
          />
          <SummaryCard
            label="Em Dia"
            value={String(
              resumoFinanceiro.clientesAtivos - resumoFinanceiro.clientesEmAtraso
            )}
            icon="check-circle"
            iconBg={colors.successLight}
            iconColor={colors.success}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Atalhos Rápidos
        </Text>
        <View style={styles.shortcuts}>
          <ShortcutButton
            label="Clientes"
            icon="users"
            color={colors.primary}
            onPress={() => router.push("/(tabs)/clientes")}
          />
          <ShortcutButton
            label="Cobranças"
            icon="bell"
            color={colors.warning}
            onPress={() => router.push("/(tabs)/cobrancas")}
          />
          <ShortcutButton
            label="Relatório"
            icon="bar-chart-2"
            color={colors.success}
            onPress={() => {}}
          />
          <ShortcutButton
            label="Novo Cliente"
            icon="user-plus"
            color="#8b5cf6"
            onPress={() => {}}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Clientes em Atraso
        </Text>
        {emAtraso.map((cliente) => (
          <View
            key={cliente.id}
            style={[styles.alertCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.alertLeft}>
              <View style={[styles.avatar, { backgroundColor: colors.warningLight }]}>
                <Text style={[styles.avatarText, { color: colors.warning }]}>
                  {cliente.nome.charAt(0)}
                </Text>
              </View>
              <View>
                <Text style={[styles.alertName, { color: colors.foreground }]}>
                  {cliente.nome}
                </Text>
                <Text style={[styles.alertDays, { color: colors.warning }]}>
                  {cliente.diasAtraso} dias em atraso
                </Text>
              </View>
            </View>
            <Text style={[styles.alertValue, { color: colors.destructive }]}>
              {formatarMoeda(cliente.saldoDevedor)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, gap: 8 },
  heroCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 8,
    gap: 4,
  },
  heroLabel: {
    fontSize: 13,
    color: "#94a3b8",
    fontFamily: "Inter_400Regular",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroValue: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    color: "#ffffff",
    letterSpacing: -1,
  },
  heroRow: {
    flexDirection: "row",
    marginTop: 4,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#fbbf2420",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  heroBadgeText: {
    fontSize: 12,
    color: "#fbbf24",
    fontFamily: "Inter_500Medium",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    marginTop: 12,
    marginBottom: 8,
  },
  shortcuts: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  shortcut: {
    width: "47%",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
  },
  shortcutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  shortcutLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  alertCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  alertLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
  alertName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  alertDays: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  alertValue: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
});
