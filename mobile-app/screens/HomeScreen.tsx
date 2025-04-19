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
import BookCard from "../components/BookCard";
import { Book } from "../types/book";
import Icon from "react-native-vector-icons/Feather";
import { HomeStackParamList } from "../types/navigation";
import { StackNavigationProp } from "@react-navigation/stack";

type Loan = {
  bookId: number;
  loanId: number;
  loanDate: string;
  returnDate: string;
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<HomeStackParamList>>();
  const [userName, setUserName] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    const initialize = async () => {
      console.log("Initialisation du composant HomeScreen");
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

  const getUserInfo = async () => {
    try {
      const userString = await AsyncStorage.getItem("user");
      console.log("Données utilisateur brutes:", userString);
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
      console.log(
        "Token utilisé pour fetchBooks:",
        token?.slice(0, 10) + "..."
      );

      if (!token) throw new Error("Token non trouvé");

      const response = await axios.get(ApiRoutes.books(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Réponse de l'API livres:", response.data);

      if (response.data?.success) {
        setBooks(response.data.books);
        setError("");
      } else {
        throw new Error("Aucun livre trouvé dans la réponse");
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

      console.log("Fetching borrowed books...");
      const response = await axios.get(ApiRoutes.loan(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Réponse des prêts:", response.data);

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

  const handleBorrowBook = async (bookId: number) => {
    try {
      console.log("Tentative d'emprunt pour bookId:", bookId);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("Authentification requise");

      const loanDate = new Date();
      const returnDate = new Date(loanDate);
      returnDate.setDate(loanDate.getDate() + 10);

      const payload = {
        bookId: bookId,
        loanDate: loanDate.toISOString().split("T")[0],
        returnDate: returnDate.toISOString().split("T")[0],
      };

      console.log("Payload emprunt:", payload);

      const response = await axios.post(ApiRoutes.loan(), payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Réponse emprunt:", response.data);

      if (response.data.success) {
        const newLoan = {
          bookId,
          loanId: response.data.loan.id,
          loanDate: response.data.loan.loan_date,
          returnDate: response.data.loan.return_date,
        };
        setLoans([...loans, newLoan]);
        Alert.alert(
          "Succès",
          `Emprunt réussi jusqu'au ${formatDate(
            response.data.loan.return_date
          )}`
        );
      }
    } catch (error) {
      console.error("Erreur handleBorrowBook:", error);
      let errorMessage = "Erreur inconnue";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }
      Alert.alert("Erreur", errorMessage);
    }
  };

  const handleReturnBook = async (loanId: number) => {
    try {
      console.log("Tentative de retour pour loanId:", loanId);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("Authentification requise");

      console.log("Suppression du prêt ID:", loanId);
      await axios.delete(ApiRoutes.deleteLoan(loanId), {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoans(loans.filter((loan) => loan.loanId !== loanId));
      Alert.alert("Succès", "Livre rendu avec succès");
    } catch (error) {
      console.error("Erreur handleReturnBook:", error);
      let errorMessage = "Échec de la restitution";
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      }
      Alert.alert("Erreur", errorMessage);
    }
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
      console.error("Erreur formatDate:", error);
      return "Date invalide";
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderBookItem = ({ item }: { item: Book }) => {
    const loan = loans.find((l) => l.bookId === item.id);
    console.log(`Rendu livre ${item.id} - emprunté: ${!!loan}`);

    return (
      <BookCard
        book={item}
        onPress={() => navigation.navigate("BookDetails", { bookId: item.id })}
        onBorrow={() => handleBorrowBook(item.id)}
        onReturn={() => loan && handleReturnBook(loan.loanId)}
        loanInfo={
          loan
            ? { loanDate: loan.loanDate, returnDate: loan.returnDate }
            : undefined
        }
        isBorrowed={!!loan}
        showBorrowButton={!loan}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={`Bonjour, ${userName}`}
        subtitle="Découvrez notre bibliothèque"
      />

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
    padding: 20,
    gap: 10,
    marginTop: 100,
  },
  emptyText: {
    color: "#718096",
    fontSize: 16,
    textAlign: "center",
  },
  booksList: {
    paddingBottom: 20,
  },
});

export default HomeScreen;
