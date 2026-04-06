import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useClientes } from "@/context/ClientesContext";
import { useColors } from "@/hooks/useColors";
import { formatarMoeda } from "@/lib/utils";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? 67 : insets.top + 16;

  const { clientes } = useClientes();
  const emAtraso = clientes.filter((c) => c.diasAtraso > 0);
  const totalAReceber = clientes.reduce((acc, c) => acc + c.saldoDevedor, 0);
  const totalEmAtraso = emAtraso.reduce((acc, c) => acc + c.saldoDevedor, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad }]}>
        <Text style={styles.appName}>FiadoControl</Text>
        <Text style={styles.appSub}>Controle de crédito e cobranças</Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: isWeb ? 120 : insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* CARD TOTAL */}
        <View style={[styles.totalCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.totalLabel, { color: colors.mutedForeground }]}>
            TOTAL A RECEBER
          </Text>
          <Text style={[styles.totalValue, { color: colors.danger }]}>
            {formatarMoeda(totalAReceber)}
          </Text>
          <View style={[styles.totalBadge, { backgroundColor: colors.dangerLight }]}>
            <Feather name="alert-circle" size={16} color={colors.danger} />
            <Text style={[styles.totalBadgeText, { color: colors.danger }]}>
              {formatarMoeda(totalEmAtraso)} em atraso
            </Text>
          </View>
        </View>

        {/* RESUMO */}
        <View style={styles.resumoRow}>
          <View style={[styles.resumoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="users" size={28} color={colors.primary} />
            <Text style={[styles.resumoNum, { color: colors.foreground }]}>{clientes.length}</Text>
            <Text style={[styles.resumoLabel, { color: colors.mutedForeground }]}>Clientes</Text>
          </View>
          <View style={[styles.resumoCard, { backgroundColor: colors.dangerLight, borderColor: colors.danger + "40" }]}>
            <Feather name="alert-triangle" size={28} color={colors.danger} />
            <Text style={[styles.resumoNum, { color: colors.danger }]}>{emAtraso.length}</Text>
            <Text style={[styles.resumoLabel, { color: colors.danger }]}>Em Atraso</Text>
          </View>
          <View style={[styles.resumoCard, { backgroundColor: colors.successLight, borderColor: colors.success + "40" }]}>
            <Feather name="check-circle" size={28} color={colors.success} />
            <Text style={[styles.resumoNum, { color: colors.success }]}>{clientes.length - emAtraso.length}</Text>
            <Text style={[styles.resumoLabel, { color: colors.success }]}>Em Dia</Text>
          </View>
        </View>

        {/* ATALHOS */}
        <Text style={[styles.secTitle, { color: colors.foreground }]}>
          O que você quer fazer?
        </Text>

        <Pressable
          style={({ pressed }) => [styles.atalho, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
          onPress={() => router.push("/(tabs)/clientes")}
        >
          <View style={styles.atalhoInner}>
            <View style={styles.atalhoIcon}>
              <Feather name="users" size={28} color="#fff" />
            </View>
            <View style={styles.atalhoText}>
              <Text style={styles.atalhoTitle}>Ver Clientes</Text>
              <Text style={styles.atalhoSub}>Lista completa de clientes</Text>
            </View>
            <Feather name="chevron-right" size={24} color="#fff" />
          </View>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.atalho, { backgroundColor: colors.success, opacity: pressed ? 0.85 : 1 }]}
          onPress={() => router.push("/(tabs)/cobrancas")}
        >
          <View style={styles.atalhoInner}>
            <View style={styles.atalhoIcon}>
              <Feather name="bell" size={28} color="#fff" />
            </View>
            <View style={styles.atalhoText}>
              <Text style={styles.atalhoTitle}>Fazer Cobrança</Text>
              <Text style={styles.atalhoSub}>{emAtraso.length} clientes precisam pagar</Text>
            </View>
            <Feather name="chevron-right" size={24} color="#fff" />
          </View>
        </Pressable>

        {/* ALERTAS */}
        {emAtraso.length > 0 && (
          <>
            <Text style={[styles.secTitle, { color: colors.foreground }]}>
              Atenção — Clientes em Atraso
            </Text>
            {emAtraso.map((c) => (
              <View
                key={c.id}
                style={[styles.alertCard, { backgroundColor: colors.card, borderColor: colors.danger + "50" }]}
              >
                <View style={[styles.alertAvatar, { backgroundColor: colors.dangerLight }]}>
                  <Text style={[styles.alertAvatarText, { color: colors.danger }]}>
                    {c.nome.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.alertInfo}>
                  <Text style={[styles.alertName, { color: colors.foreground }]}>{c.nome}</Text>
                  <Text style={[styles.alertDays, { color: colors.danger }]}>{c.diasAtraso} dias em atraso</Text>
                </View>
                <Text style={[styles.alertVal, { color: colors.danger }]}>{formatarMoeda(c.saldoDevedor)}</Text>
              </View>
            ))}
          </>
        )}

        {/* ESTADO VAZIO */}
        {clientes.length === 0 && (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="users" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Nenhum cliente ainda</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Vá até "Clientes" e cadastre seu primeiro cliente.
            </Text>
            <Pressable
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/(tabs)/clientes")}
            >
              <Text style={styles.emptyBtnText}>Cadastrar Agora</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  appName: { fontSize: 30, fontFamily: "Inter_700Bold", color: "#ffffff", letterSpacing: -0.5 },
  appSub: { fontSize: 15, fontFamily: "Inter_400Regular", color: "#bfdbfe", marginTop: 2 },
  scroll: { padding: 16, gap: 12 },
  totalCard: {
    borderRadius: 16, padding: 24, alignItems: "center", gap: 10,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  totalLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", letterSpacing: 1, textTransform: "uppercase" },
  totalValue: { fontSize: 44, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  totalBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  totalBadgeText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  resumoRow: { flexDirection: "row", gap: 10 },
  resumoCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: "center", gap: 6, borderWidth: 1.5 },
  resumoNum: { fontSize: 30, fontFamily: "Inter_700Bold" },
  resumoLabel: { fontSize: 13, fontFamily: "Inter_500Medium", textAlign: "center" },
  secTitle: { fontSize: 19, fontFamily: "Inter_700Bold", marginTop: 4 },
  atalho: { borderRadius: 14, padding: 18 },
  atalhoInner: { flexDirection: "row", alignItems: "center", gap: 14 },
  atalhoIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  atalhoText: { flex: 1 },
  atalhoTitle: { fontSize: 19, fontFamily: "Inter_700Bold", color: "#fff" },
  atalhoSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)", marginTop: 2 },
  alertCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 16, borderWidth: 1.5, gap: 12 },
  alertAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  alertAvatarText: { fontSize: 20, fontFamily: "Inter_700Bold" },
  alertInfo: { flex: 1 },
  alertName: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  alertDays: { fontSize: 14, fontFamily: "Inter_500Medium", marginTop: 2 },
  alertVal: { fontSize: 17, fontFamily: "Inter_700Bold" },
  emptyBox: { borderRadius: 16, padding: 24, alignItems: "center", gap: 10, borderWidth: 2, marginTop: 8 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center" },
  emptyBtn: { borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 4 },
  emptyBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
});
