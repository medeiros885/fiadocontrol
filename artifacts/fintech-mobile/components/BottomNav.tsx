/**
 * BottomNav — Menu inferior acessível para idosos
 *
 * Características:
 * - Área de toque gigante (h: 80px)
 * - Ícone E texto em cada botão
 * - Alto contraste: azul ativo, cinza inativo
 * - Fundo branco com borda no topo
 *
 * Este componente é utilizado pelo sistema de rotas (app/(tabs)/_layout.tsx)
 * via Expo Router Tabs. Você pode importar este componente como referência
 * visual ou usá-lo diretamente em telas sem tab bar.
 */

import { Feather } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface NavItem {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  route: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Início", icon: "home", route: "/(tabs)/index" },
  { label: "Clientes", icon: "users", route: "/(tabs)/clientes" },
  { label: "Cobrar", icon: "bell", route: "/(tabs)/cobrancas" },
];

export function BottomNav() {
  const colors = useColors();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const bottomPad = isWeb ? 34 : insets.bottom;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.navBackground,
          borderTopColor: colors.navBorder,
          paddingBottom: bottomPad,
        },
      ]}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.includes(item.route.replace("/(tabs)/", "/"));
        const iconColor = isActive ? colors.navActive : colors.navInactive;
        const labelColor = isActive ? colors.navActive : colors.navInactive;

        return (
          <Pressable
            key={item.route}
            style={({ pressed }) => [
              styles.navItem,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => router.push(item.route as any)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            {isActive && (
              <View
                style={[styles.activeBar, { backgroundColor: colors.navActive }]}
              />
            )}
            <Feather name={item.icon} size={28} color={iconColor} />
            <Text style={[styles.navLabel, { color: labelColor }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 6,
    minHeight: 64,
    gap: 4,
  },
  activeBar: {
    position: "absolute",
    top: 0,
    left: "20%",
    right: "20%",
    height: 3,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  navLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
});
