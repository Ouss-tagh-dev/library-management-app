import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BookForm, { BookFormData } from "../components/BookForm";
import { ApiRoutes } from "../api/ApiRoutes";
import Header from "../components/Header";

const NewBookScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const user = JSON.parse(userString);
          setUserName(user.first_name || user.email || "Utilisateur");
        }
      } catch (error) {
        console.error("Erreur de chargement utilisateur:", error);
      }
    };
    loadUser();
  }, []);

  const handleSubmit = async (formData: BookFormData) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch(ApiRoutes.books(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de la création");
      }

      Alert.alert("Succès", "Livre créé avec succès", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Erreur",
        error.message || "Une erreur est survenue lors de la création"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={`Bonjour, ${userName}`}
        subtitle="Ajouter un nouveau livre"
        style={styles.header}
      />

      <BookForm
        onSubmit={handleSubmit}
        buttonStyle={styles.submitButton}
        labelStyle={styles.label}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#4299e1" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7fafc",
  },
  header: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  submitButton: {
    backgroundColor: "#48bb78",
    marginHorizontal: 20,
  },
  label: {
    color: "#2d3748",
    fontWeight: "600",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default NewBookScreen;
