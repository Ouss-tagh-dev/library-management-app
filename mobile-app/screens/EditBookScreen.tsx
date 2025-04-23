import React, { useState, useEffect } from "react";
import { View, ActivityIndicator, Alert } from "react-native";
import BookForm from "../components/BookForm";
import { ApiRoutes } from "../api/ApiRoutes";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackScreenProps } from "@react-navigation/stack";
import { HomeStackParamList } from "../types/navigation";
import { Book } from "../types/book";

type Props = StackScreenProps<HomeStackParamList, "EditBook">;

const EditBookScreen: React.FC<Props> = ({ route, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState<Book | null>(null);
  const { bookId } = route.params;

  const fetchBook = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("Token non trouvé");

      const response = await axios.get(ApiRoutes.book(bookId), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setBook({
          ...response.data.book,
          publicationDate:
            response.data.book.publicationDate?.split("T")[0] || "",
        });
      }
    } catch (error: any) {
      Alert.alert(
        "Erreur",
        error.response?.data?.message || "Erreur de chargement"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [bookId]);

  const handleSubmit = async (formData: Book) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("authToken");
      if (!token) throw new Error("Authentification requise");

      const response = await axios.put(ApiRoutes.book(bookId), formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        Alert.alert("Succès", "Livre mis à jour", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Home", { refresh: true }),
          },
        ]);
      }
    } catch (error: any) {
      Alert.alert(
        "Erreur",
        error.response?.data?.message || "Échec de la mise à jour"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading || !book) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <BookForm initialData={book} onSubmit={handleSubmit} />;
};

export default EditBookScreen;
