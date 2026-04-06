import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  const paddingTop = isWeb ? 67 : insets.top + 12;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.navBackground,
          paddingTop,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: "#ffffff" }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.navInactive }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  content: {
    gap: 2,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
