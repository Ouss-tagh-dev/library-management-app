import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { ApiRoutes } from "../api/ApiRoutes";

interface RegisterFormProps {
  onSwitch: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitch }) => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await axios.post(
        ApiRoutes.register(),
        {
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          role: "user",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSuccessMessage("Inscription réussie !");
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
      } else {
        throw new Error(response.data.message || "Échec de l'inscription");
      }
    } catch (err) {
      let errorMessage = "Échec de l'inscription";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {successMessage ? (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>{successMessage}</Text>
          <TouchableOpacity onPress={onSwitch}>
            <Text style={styles.successLink}>
              Cliquez ici pour vous connecter
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Prénom"
            value={firstName}
            onChangeText={setFirstName}
          />
          <TextInput
            style={styles.input}
            placeholder="Nom"
            value={lastName}
            onChangeText={setLastName}
          />
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
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            <Button
              title="S'inscrire"
              onPress={handleRegister}
              color="#007bff"
            />
          )}

          <TouchableOpacity style={styles.loginContainer} onPress={onSwitch}>
            <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
          </TouchableOpacity>
        </>
      )}
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
  successContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  successText: {
    color: "green",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  successLink: {
    color: "#007bff",
    fontSize: 18,
    textDecorationLine: "underline",
  },
  loginContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  linkText: {
    color: "#007bff",
  },
});

export default RegisterForm;
