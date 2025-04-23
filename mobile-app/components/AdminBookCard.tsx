import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Book } from "../types/book";
import Icon from "react-native-vector-icons/MaterialIcons";
import { dateFormatter } from "../utils/dateFormatter";

interface LoanInfo {
  loanDate: string;
  returnDate: string;
}

interface AdminBookCardProps {
  book: Book;
  onEdit?: () => void;
  onDelete?: () => void;
  isBorrowed?: boolean;
  loanInfo?: LoanInfo;
  borrowedBy?: string;
}

const AdminBookCard: React.FC<AdminBookCardProps> = ({
  book,
  onEdit,
  onDelete,
  isBorrowed = false,
  loanInfo,
  borrowedBy,
}) => {
  const handleDelete = () => {
    Alert.alert(
      "Confirmation",
      "Êtes-vous sûr de vouloir supprimer ce livre ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Supprimer", onPress: onDelete, style: "destructive" },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>{book.author}</Text>
        </View>
      </View>

      {book.description && (
        <Text style={styles.description} numberOfLines={3}>
          {book.description}
        </Text>
      )}

      <View style={styles.footer}>
        <Text style={styles.isbn}>ISBN : {book.isbn}</Text>
        <Text style={styles.date}>
          Publié : {dateFormatter(book.publicationDate || "")}
        </Text>
      </View>

      {isBorrowed && (
        <View style={styles.loanInfo}>
          <Text style={styles.borrowedBy}>
            Emprunté par : <Text style={styles.bold}>{borrowedBy}</Text>
          </Text>
          <Text style={styles.returnDate}>
            Retour prévu :{" "}
            <Text style={styles.bold}>
              {dateFormatter(loanInfo?.returnDate || "")}
            </Text>
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        {onEdit && (
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={onEdit}
          >
            <Icon name="edit" size={18} color="white" />
            <Text style={styles.buttonText}>Modifier</Text>
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Icon name="delete" size={18} color="white" />
            <Text style={styles.buttonText}>Supprimer</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
  },
  author: {
    fontSize: 14,
    color: "#718096",
  },
  description: {
    fontSize: 14,
    color: "#4A5568",
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 12,
  },
  isbn: {
    fontSize: 12,
    color: "#718096",
  },
  date: {
    fontSize: 12,
    color: "#718096",
  },
  loanInfo: {
    marginBottom: 12,
  },
  borrowedBy: {
    fontSize: 14,
    color: "#2D3748",
    marginBottom: 4,
  },
  returnDate: {
    fontSize: 14,
    color: "#2D3748",
  },
  bold: {
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 6,
    gap: 8,
    width: "48%",
  },
  editButton: {
    backgroundColor: "#4299E1",
  },
  deleteButton: {
    backgroundColor: "#E53E3E",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default AdminBookCard;
