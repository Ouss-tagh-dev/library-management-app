import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { ApiRoutes } from "../api/ApiRoutes";
import Header from "../components/Header";
import AdminBookCard from "../components/AdminBookCard";
import { Book } from "../types/book";

type Loan = {
  bookId: number;
  loanId: number;
  loanDate: string;
  returnDate: string;
  borrowedBy?: string;
  book: Book;
};

const LoansBooksList: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem("authToken");
        if (!token) throw new Error("Authentification requise");

        const response = await axios.get(ApiRoutes.loans(), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.success) {
          const loansData = response.data.loans.map((loan: any) => ({
            bookId: loan.book_id,
            loanId: loan.id,
            loanDate: loan.loan_date,
            returnDate: loan.return_date,
            borrowedBy: `${loan.User.first_name} ${loan.User.last_name}`,
            book: loan.Book,
          }));

          setLoans(loansData);
          setBooks(loansData.map((loan: Loan) => loan.book));
        }
      } catch (err) {
        console.error("Erreur fetchBorrowedBooks:", err);
        setError("Erreur de chargement des livres empruntés");
      } finally {
        setLoading(false);
      }
    };

    fetchBorrowedBooks();
  }, []);

  const renderBookItem = ({ item }: { item: Book }) => {
    const loan = loans.find((l) => l.bookId === item.id);
    return (
      <AdminBookCard
        book={item}
        loanInfo={
          loan
            ? {
                loanDate: loan.loanDate,
                returnDate: loan.returnDate,
              }
            : undefined
        }
        borrowedBy={loan?.borrowedBy}
        isBorrowed={!!loan}
      />
    );
  };

  return (
    <View style={styles.container}>
      <Header title="Livres empruntés" subtitle="Liste des emprunts" />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4299E1" />
          <Text style={styles.loadingText}>Chargement des emprunts...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBookItem}
          contentContainerStyle={styles.booksList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun livre emprunté</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#718096",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#718096",
  },
  booksList: {
    paddingBottom: 40,
  },
});

export default LoansBooksList;
