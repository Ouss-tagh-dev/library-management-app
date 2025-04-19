import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
};

const Header = ({ title, subtitle }: Props) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0118D8",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#1B56FD",
    marginTop: 6,
    textAlign: "center",
  },
});

export default Header;
