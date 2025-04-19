import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios, { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiRoutes } from "../api/ApiRoutes";

interface LoginFormProps {
  onLoginSuccess: (token: string) => void;
  onSwitch: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onSwitch }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        ApiRoutes.login(),
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 10000,
        }
      );

      console.log("Réponse serveur:", JSON.stringify(response.data, null, 2));

      if (response.data.success && response.data.data?.token) {
        await AsyncStorage.setItem("authToken", response.data.data.token);
        await AsyncStorage.setItem(
          "user",
          JSON.stringify(response.data.data.user)
        );

        console.log("Token stocké:", response.data.data.token);
        onLoginSuccess(response.data.data.token);
      } else {
        throw new Error("Structure de réponse serveur invalide");
      }
    } catch (err) {
      let errorMessage = "Échec de la connexion";

      if (axios.isAxiosError(err)) {
        const serverError = err as AxiosError<{ message?: string }>;
        errorMessage =
          serverError.response?.data?.message ||
          serverError.message ||
          "Erreur inconnue";

        console.error(
          "Détails erreur:",
          `Status: ${serverError.response?.status}`,
          `Data: ${JSON.stringify(serverError.response?.data)}`
        );
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Se connecter" onPress={handleLogin} color="#007bff" />
      )}

      <TouchableOpacity style={styles.registerContainer} onPress={onSwitch}>
        <Text style={styles.linkText}>Créer un compte</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  error: {
    color: "red",
    marginBottom: 15,
    textAlign: "center",
  },
  registerContainer: {
    marginTop: 20,
    alignSelf: "center",
  },
  linkText: {
    color: "#007bff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default LoginForm;
