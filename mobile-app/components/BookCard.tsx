import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Book } from "../types/book";
import Icon from "react-native-vector-icons/MaterialIcons";

interface BookCardProps {
  book: Book;
  onPress?: () => void;
  onReturn?: () => void;
  onBorrow?: () => void;
  loanInfo?: {
    loanDate: string;
    returnDate: string;
  };
  isBorrowed?: boolean;
  showBorrowButton?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({
  book,
  onPress,
  onReturn,
  onBorrow,
  loanInfo,
  isBorrowed = false,
  showBorrowButton = true,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = loanInfo && new Date(loanInfo.returnDate) < new Date();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.content}>
        <View style={styles.header}>
          
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {book.title}
            </Text>
            <Text style={styles.author} numberOfLines={1}>
              {book.author}
            </Text>
          </View>
        </View>

        {book.description && (
          <Text style={styles.description} numberOfLines={3}>
            {book.description}
          </Text>
        )}

        {isBorrowed && loanInfo && (
          <View style={styles.loanInfoContainer}>
            <View style={styles.loanInfoItem}>
              <Icon name="event-available" size={16} color="#4A5568" />
              <Text style={styles.loanInfoLabel}>Emprunté le : </Text>
              <Text style={styles.loanInfoValue}>
                {formatDate(loanInfo.loanDate)}
              </Text>
            </View>
            <View style={styles.loanInfoItem}>
              <Icon
                name={isOverdue ? "warning" : "event-busy"}
                size={16}
                color={isOverdue ? "#E53E3E" : "#4A5568"}
              />
              <Text style={[styles.loanInfoLabel, isOverdue && styles.overdue]}>
                Retour avant le :
              </Text>
              <Text style={[styles.loanInfoValue, isOverdue && styles.overdue]}>
                {formatDate(loanInfo.returnDate)}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.isbn}>📖 ISBN : {book.isbn}</Text>
          {book.publicationDate && (
            <Text style={styles.date}>
              🗓 Publié : {formatDate(book.publicationDate)}
            </Text>
          )}
        </View>

        {isBorrowed ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.returnButton]}
            onPress={(e) => {
              e.stopPropagation();
              onReturn?.();
            }}
          >
            <Icon name="undo" size={18} color="white" />
            <Text style={styles.actionButtonText}>Rendre le livre</Text>
          </TouchableOpacity>
        ) : showBorrowButton ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.borrowButton]}
            onPress={(e) => {
              e.stopPropagation();
              onBorrow?.();
            }}
          >
            <Icon name="bookmark-add" size={18} color="white" />
            <Text style={styles.actionButtonText}>Emprunter</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    marginBottom: 12,
  },
  coverImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  coverPlaceholder: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: "#EDF2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: "#718096",
  },
  description: {
    fontSize: 14,
    color: "#4A5568",
    marginBottom: 12,
    lineHeight: 20,
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
  loanInfoContainer: {
    backgroundColor: "#F7FAFC",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  loanInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  loanInfoLabel: {
    fontSize: 13,
    color: "#4A5568",
  },
  loanInfoValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#2D3748",
  },
  overdue: {
    color: "#E53E3E",
    fontWeight: "600",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 6,
    gap: 8,
  },
  borrowButton: {
    backgroundColor: "#4299E1",
  },
  returnButton: {
    backgroundColor: "#E53E3E",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default BookCard;
