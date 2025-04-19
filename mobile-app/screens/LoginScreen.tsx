import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import LoginForm from "../components/LoginForm";

interface LoginScreenProps {
  onLogin: () => void;
  onSwitch: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSwitch }) => {
  const handleLoginSuccess = async (token: string) => {
    onLogin();
  };

  return (
    <View style={styles.container}>
      <LoginForm onLoginSuccess={handleLoginSuccess} onSwitch={onSwitch} />
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

export default LoginScreen;
