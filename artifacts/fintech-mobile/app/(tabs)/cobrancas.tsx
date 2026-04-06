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
import { Header } from "@/components/Header";
import { Cliente, clientes } from "@/data/mockData";
import { useColors } from "@/hooks/useColors";
import { formatarData, formatarMoeda, gerarLinkWhatsApp } from "@/lib/utils";

const clientesEmAtraso = clientes.filter((c) => c.diasAtraso > 0);

function CobrancaCard({ cliente }: { cliente: Cliente }) {
  const colors = useColors();

  const urgencia =
    cliente.diasAtraso >= 30
      ? "alta"
      : cliente.diasAtraso >= 10
      ? "media"
      : "baixa";

  const urgenciaColor =
    urgencia === "alta"
      ? colors.destructive
      : urgencia === "media"
      ? colors.warning
      : "#8b5cf6";

  const urgenciaLabel =
    urgencia === "alta" ? "Urgente" : urgencia === "media" ? "Atenção" : "Leve";

  function handleCobrarWhatsApp() {
    const mensagem = `Olá ${cliente.nome}, informamos que existe uma pendência de ${formatarMoeda(cliente.saldoDevedor)} em aberto há ${cliente.diasAtraso} dias (vencimento em ${formatarData(cliente.vencimento)}). Por favor, entre em contato para regularizar sua situação. Obrigado!`;
    const link = gerarLinkWhatsApp(cliente.telefone, mensagem);
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
          borderWidth: 1.5,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: urgenciaColor + "20" },
          ]}
        >
          <Text style={[styles.avatarText, { color: urgenciaColor }]}>
            {cliente.nome.charAt(0)}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={[styles.cardName, { color: colors.foreground }]}>
              {cliente.nome}
            </Text>
            <View
              style={[
                styles.urgenciaBadge,
                { backgroundColor: urgenciaColor + "20" },
              ]}
            >
              <Text style={[styles.urgenciaText, { color: urgenciaColor }]}>
                {urgenciaLabel}
              </Text>
            </View>
          </View>
          <Text style={[styles.cardDays, { color: urgenciaColor }]}>
            {cliente.diasAtraso} dias em atraso
          </Text>
          <Text style={[styles.cardDate, { color: colors.mutedForeground }]}>
            Vencimento: {formatarData(cliente.vencimento)}
          </Text>
        </View>
      </View>

      <View
        style={[styles.divider, { backgroundColor: colors.border }]}
      />

      <View style={styles.cardBottom}>
        <View>
          <Text style={[styles.bottomLabel, { color: colors.mutedForeground }]}>
            Valor em aberto
          </Text>
          <Text style={[styles.bottomValue, { color: colors.destructive }]}>
            {formatarMoeda(cliente.saldoDevedor)}
          </Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.whatsappBtn,
            { backgroundColor: "#25D366", opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={handleCobrarWhatsApp}
        >
          <Feather name="message-circle" size={16} color="#fff" />
          <Text style={styles.whatsappText}>Cobrar no WhatsApp</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function CobrancasScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Cobranças"
        subtitle={`${clientesEmAtraso.length} clientes em atraso`}
      />
      {clientesEmAtraso.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="check-circle" size={48} color={colors.success} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Tudo em dia!
          </Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Nenhum cliente está em atraso no momento.
          </Text>
        </View>
      ) : (
        <FlatList
          data={clientesEmAtraso}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CobrancaCard cliente={item} />}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: insets.bottom + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  card: {
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
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
    gap: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  urgenciaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  urgenciaText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  cardDays: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  cardDate: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  divider: {
    height: 1,
  },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  bottomValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  whatsappBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  whatsappText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
