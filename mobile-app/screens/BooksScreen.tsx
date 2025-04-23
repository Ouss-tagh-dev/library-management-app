import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ApiRoutes } from "../api/ApiRoutes";
import Header from "../components/Header";
import BookCard from "../components/BookCard";
import { Loan } from "../types/book";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { HomeStackParamList } from "../types/navigation";

const BooksScreen: React.FC = () => {
  const navigation = useNavigation<HomeStackParamList>();

  const [userName, setUserName] = useState<string>("");
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const initialize = async () => {
      await getUserInfo();
      await fetchBorrowedBooks();
    };
    initialize();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchBorrowedBooks();
    });

    return unsubscribe;
  }, [navigation]);

  const getUserInfo = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        setUserName(user.first_name || user.email || "Utilisateur");
      }
    } catch (error) {
      console.error("Erreur récupération utilisateur:", error);
    }
  };

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true);
      setError("");
      const token = await AsyncStorage.getItem("authToken");

      if (!token) throw new Error("Authentification requise");

      const loansResponse = await axios.get(ApiRoutes.loan(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!loansResponse.data?.success) {
        throw new Error("Réponse API invalide pour les prêts");
      }

      const loansData = loansResponse.data.loans;
      console.log("Prêts récupérés:", loansData);

      if (!loansData || !Array.isArray(loansData)) {
        throw new Error("Format de données de prêt invalide");
      }

      const bookIds = [...new Set(loansData.map((loan: Loan) => loan.book_id))];

      if (bookIds.length === 0) {
        setLoans([]);
        return;
      }

      const booksResponse = await axios.get(ApiRoutes.books(), {
        headers: { Authorization: `Bearer ${token}` },
        params: { ids: bookIds.join(",") },
      });

      console.log("Livres récupérés:", booksResponse.data);

      if (!booksResponse.data?.success || !booksResponse.data.books) {
        throw new Error("Réponse API invalide pour les livres");
      }

      const booksMap = booksResponse.data.books.reduce(
        (acc: any, book: any) => {
          if (book?.id && book?.title) {
            acc[book.id] = book;
          }
          return acc;
        },
        {}
      );

      const completeLoans = loansData
        .map((loan: Loan) => ({
          ...loan,
          book: booksMap[loan.book_id] || null,
        }))
        .filter((loan) => loan.book);

      setLoans(completeLoans);
    } catch (err: any) {
      console.error("Erreur récupération données:", {
        message: err.message,
        response: err.response?.data,
        stack: err.stack,
      });

      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ||
              "Erreur de communication avec le serveur"
          : "Erreur de traitement des données"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReturnBook = async (loanId: number) => {
    const loan = loans.find((l) => l.id === loanId);
    if (!loan?.book) return;

    Alert.alert(
      "Confirmation",
      `Êtes-vous sûr de vouloir rendre "${loan.book.title}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("authToken");
              if (!token) throw new Error("Token manquant");

              await axios.delete(ApiRoutes.deleteLoan(loanId), {
                headers: { Authorization: `Bearer ${token}` },
              });

              setLoans((prev) => prev.filter((l) => l.id !== loanId));
              Alert.alert("Succès", "Livre rendu avec succès");
            } catch (error: any) {
              console.error("Erreur retour livre:", {
                message: error.message,
                response: error.response?.data,
              });
              Alert.alert(
                "Erreur",
                axios.isAxiosError(error)
                  ? error.response?.data?.message || "Échec de la restitution"
                  : "Erreur inconnue"
              );
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Format de date invalide:", dateString);
      return "Date inconnue";
    }
  };

  const renderBookItem = ({ item }: { item: Loan }) => {
    if (!item.book) return null;

    return (
      <BookCard
        book={item.book}
        isBorrowed={true}
        loanInfo={{
          loanDate: formatDate(item.loan_date),
          returnDate: formatDate(item.return_date),
        }}
        onReturn={() => handleReturnBook(item.id)}
        showBorrowButton={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header title={`Bonjour, ${userName}`} subtitle="Vos livres empruntés" />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4299E1" />
          <Text style={styles.loadingText}>Chargement en cours...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Icon name="error-outline" size={40} color="#E53E3E" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchBorrowedBooks}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : loans.length > 0 ? (
        <FlatList
          data={loans}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBookItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.centerContainer}>
          <Icon name="book" size={40} color="#718096" />
          <Text style={styles.emptyText}>
            Aucun livre emprunté actuellement
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F7FAFC",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    padding: 20,
  },
  loadingText: {
    color: "#718096",
    fontSize: 16,
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 16,
    textAlign: "center",
    maxWidth: 300,
  },
  retryButton: {
    backgroundColor: "#4299E1",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyText: {
    color: "#718096",
    fontSize: 16,
    textAlign: "center",
  },
  libraryButton: {
    marginTop: 10,
    padding: 10,
  },
  libraryButtonText: {
    color: "#4299E1",
    fontSize: 16,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default BooksScreen;
