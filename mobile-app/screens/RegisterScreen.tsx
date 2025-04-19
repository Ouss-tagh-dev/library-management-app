import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import RegisterForm from "../components/RegisterForm";

interface RegisterScreenProps {
  onSwitch: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSwitch }) => {
  return (
    <View style={styles.container}>
      <RegisterForm onSwitch={onSwitch} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
  },
});

export default RegisterScreen;
