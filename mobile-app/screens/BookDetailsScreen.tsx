import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiRoutes } from "../api/ApiRoutes";
import { Book } from "../types/book";
import { HomeStackParamList } from "../types/navigation";
import Icon from "react-native-vector-icons/MaterialIcons";

type BookDetailsRouteProp = RouteProp<HomeStackParamList, "BookDetails">;

interface Props {
  route: BookDetailsRouteProp;
}

const BookDetailsScreen: React.FC<Props> = ({ route }) => {
  const { bookId } = route.params;
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBorrowed, setIsBorrowed] = useState(false);
  const [loanId, setLoanId] = useState<number | null>(null);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("fr-FR");

  const fetchBookDetails = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        throw new Error("Authentification requise");
      }

      const [bookResponse, loansResponse] = await Promise.all([
        axios.get(ApiRoutes.book(bookId), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(ApiRoutes.loan(), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (bookResponse.data.success) {
        setBook(bookResponse.data.book);
        setError(null);
      }

      if (loansResponse.data.success) {
        const loan = loansResponse.data.loans.find(
          (l: any) => l.book_id === bookId
        );
        setIsBorrowed(!!loan);
        setLoanId(loan?.id || null);
      }
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Erreur de connexion"
          : "Erreur inconnue"
      );
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchBookDetails();
  }, [fetchBookDetails]);

  const handleBorrow = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("Authentification requise");

      // Calcul des dates
      const today = new Date();
      const returnDate = new Date(today);
      returnDate.setDate(today.getDate() + 10); // Ajoute 10 jours

      const requestData = {
        bookId: bookId,
        loanDate: today.toISOString().split("T")[0], // Date du jour
        returnDate: returnDate.toISOString().split("T")[0], // Date +10j
      };

      const response = await axios.post(ApiRoutes.loan(), requestData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        await fetchBookDetails();
        Alert.alert(
          "Succès",
          `Livre emprunté jusqu'au ${formatDate(returnDate.toISOString())}`
        );
      }
    } catch (error) {
      Alert.alert(
        "Erreur",
        axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Échec de l'emprunt"
      );
    }
  };

  const handleReturn = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token || !loanId) throw new Error("Opération impossible");

      await axios.delete(ApiRoutes.deleteLoan(loanId), {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchBookDetails();
      Alert.alert("Succès", "Livre rendu avec succès !");
    } catch (error) {
      Alert.alert(
        "Erreur",
        axios.isAxiosError(error)
          ? error.response?.data?.message
          : "Échec de la restitution"
      );
    }
  };

  const handleRetry = () => {
    setError(null);
    fetchBookDetails();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4299E1" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Icon name="error-outline" size={40} color="#E53E3E" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.centered}>
        <Icon name="book" size={40} color="#718096" />
        <Text style={styles.emptyText}>Livre introuvable</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>par {book.author}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {book.description || "Aucune description disponible"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}> Informations</Text>
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ISBN</Text>
            <Text style={styles.infoValue}>{book.isbn}</Text>
          </View>

          {book.publicationDate && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Publication</Text>
              <Text style={styles.infoValue}>
                {formatDate(book.publicationDate)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.actionButton,
          isBorrowed ? styles.returnButton : styles.borrowButton,
        ]}
        onPress={isBorrowed ? handleReturn : handleBorrow}
      >
        <Icon
          name={isBorrowed ? "check-circle" : "bookmark-add"}
          size={20}
          color="white"
        />
        <Text style={styles.actionButtonText}>
          {isBorrowed ? "Rendre le livre" : "Emprunter ce livre"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F7FAFC",
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  coverContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  coverImage: {
    width: 200,
    height: 300,
    borderRadius: 10,
    resizeMode: "contain",
  },
  coverPlaceholder: {
    width: 200,
    height: 300,
    borderRadius: 10,
    backgroundColor: "#EDF2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2D3748",
    textAlign: "center",
    marginBottom: 8,
  },
  author: {
    fontSize: 18,
    color: "#718096",
    textAlign: "center",
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4A5568",
  },
  infoContainer: {
    backgroundColor: "#F7FAFC",
    borderRadius: 8,
    padding: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  infoLabel: {
    fontSize: 16,
    color: "#718096",
  },
  infoValue: {
    fontSize: 16,
    color: "#2D3748",
    fontWeight: "500",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    marginVertical: 20,
    gap: 10,
  },
  borrowButton: {
    backgroundColor: "#4299E1",
  },
  returnButton: {
    backgroundColor: "#E53E3E",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 16,
    textAlign: "center",
    marginTop: 15,
    marginBottom: 25,
    maxWidth: 300,
  },
  retryButton: {
    backgroundColor: "#4299E1",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "500",
  },
  emptyText: {
    color: "#718096",
    fontSize: 16,
    marginTop: 10,
  },
});

export default BookDetailsScreen;
