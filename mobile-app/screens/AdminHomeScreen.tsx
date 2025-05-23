import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ApiRoutes } from "../api/ApiRoutes";
import Header from "../components/Header";
import AdminBookCard from "../components/AdminBookCard";
import { Book } from "../types/book";
import Icon from "react-native-vector-icons/Feather";
import { HomeStackParamList } from "../types/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import { dateFormatter } from "../utils/dateFormatter";

type Loan = {
  bookId: number;
  loanId: number;
  loanDate: string;
  returnDate: string;
};

const AdminHomeScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();

  const [userName, setUserName] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    const initialize = async () => {
      try {
        await getUserInfo();
        await fetchBooks();
        await fetchBorrowedBooks();
      } catch (err) {
        console.error("Erreur lors de l'initialisation:", err);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchBooks();
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

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("Token non trouvé");

      const response = await axios.get(ApiRoutes.books(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.success) {
        setBooks(response.data.books);
        setError("");
      } else {
        throw new Error("Aucun livre trouvé");
      }
    } catch (err) {
      console.error("Erreur fetchBooks:", err);
      setError("Erreur de chargement des livres");
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowedBooks = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const response = await axios.get(ApiRoutes.loan(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data?.success) {
        const loansData = response.data.loans.map((loan: any) => ({
          bookId: loan.book_id,
          loanId: loan.id,
          loanDate: loan.loan_date,
          returnDate: loan.return_date,
        }));
        setLoans(loansData);
      }
    } catch (err) {
      console.error("Erreur fetchBorrowedBooks:", err);
    }
  };

  const handleReturnBook = async (loanId: number) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("Authentification requise");

      await axios.delete(ApiRoutes.deleteLoan(loanId), {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoans(loans.filter((loan) => loan.loanId !== loanId));
      Alert.alert("Succès", "Livre rendu avec succès");
    } catch (error: any) {
      console.error("Erreur handleReturnBook:", error);
      Alert.alert("Erreur", error.message || "Échec de la restitution");
    }
  };

  const handleEditBook = (bookId: number) => {
    navigation.navigate("EditBook", { bookId });
  };

  const handleDeleteBook = async (bookId: number) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("Authentification requise");

      const response = await axios.delete(ApiRoutes.book(bookId), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        await Promise.all([fetchBooks(), fetchBorrowedBooks()]);
        Alert.alert("Succès", "Livre supprimé avec succès");
      }
    } catch (error: any) {
      console.error("Erreur handleDeleteBook:", error);
      const message = error.response?.data?.message || "Erreur de suppression";
      Alert.alert("Erreur", message);
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderBookItem = ({ item }: { item: Book }) => {
    const loan = loans.find((l) => l.bookId === item.id);
    return (
      <AdminBookCard
        book={item}
        onPress={() => navigation.navigate("BookDetails", { bookId: item.id })}
        onReturn={() => loan && handleReturnBook(loan.loanId)}
        loanInfo={
          loan
            ? { loanDate: loan.loanDate, returnDate: loan.returnDate }
            : undefined
        }
        isBorrowed={!!loan}
        showBorrowButton={!loan}
        onEdit={() => handleEditBook(item.id)}
        onDelete={() => handleDeleteBook(item.id)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={`Bonjour, ${userName}`}
        subtitle="Découvrez notre bibliothèque"
      />

      <TouchableOpacity
        style={styles.loansButton}
        onPress={() => navigation.navigate("LoansBooks")}
      >
        <Text style={styles.loansButtonText}>Voir les livres empruntés</Text>
      </TouchableOpacity>

      <View style={styles.searchContainer}>
        <Icon
          name="search"
          size={20}
          color="#718096"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un livre ou un auteur..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Icon
            name="x"
            size={18}
            color="#718096"
            style={styles.clearIcon}
            onPress={() => setSearchQuery("")}
          />
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4299E1" />
          <Text style={styles.loadingText}>Chargement des livres...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={40} color="#E53E3E" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchBooks}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBookItem}
          contentContainerStyle={styles.booksList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="book" size={40} color="#718096" />
              <Text style={styles.emptyText}>
                {searchQuery ? "Aucun résultat" : "Aucun livre disponible"}
              </Text>
            </View>
          }
        />
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
  loansButton: {
    backgroundColor: "#4299E1",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  loansButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#2D3748",
  },
  clearIcon: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  loadingText: {
    color: "#718096",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 15,
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
    paddingHorizontal: 25,
    borderRadius: 6,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#718096",
  },
  booksList: {
    paddingBottom: 40,
  },
});

export default AdminHomeScreen;
