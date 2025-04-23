import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialIcons";
import { User } from "../types/user";
import Header from "../components/Header";

const ProfileScreen: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        if (userString) {
          const userData = JSON.parse(userString);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["authToken", "user"]);
      onLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4299E1" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Utilisateur non trouvé</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Profil" subtitle="Informations personnelles" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.infoRow}>
            <Icon name="badge" size={24} color="#4299E1" />
            <View style={styles.textContainer}>
              <Text style={styles.label}>Nom complet</Text>
              <Text
                style={styles.value}
              >{`${user.first_name} ${user.last_name}`}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Icon name="email" size={24} color="#4299E1" />
            <View style={styles.textContainer}>
              <Text style={styles.label}>Adresse email</Text>
              <Text style={styles.value}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Icon name="security" size={24} color="#4299E1" />
            <View style={styles.textContainer}>
              <Text style={styles.label}>Rôle</Text>
              <Text style={[styles.value, styles.role]}>
                {user.role.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Icon name="calendar-today" size={24} color="#4299E1" />
            <View style={styles.textContainer}>
              <Text style={styles.label}>Compte créé le</Text>
              <Text style={styles.value}>{formatDate(user.createdAt)}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color="white" />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
    padding: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  textContainer: {
    marginLeft: 15,
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#2D3748",
    fontWeight: "500",
  },
  role: {
    color: "#48BB78",
    fontWeight: "600",
  },
  separator: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E53E3E",
    padding: 16,
    borderRadius: 10,
    marginTop: 30,
    gap: 12,
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
});

export default ProfileScreen;
