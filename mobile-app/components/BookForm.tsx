import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  Platform,
  Modal,
  TextStyle,
  ViewStyle,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialIcons";

export interface BookFormData {
  title: string;
  author: string;
  description: string;
  isbn: string;
  publicationDate: string;
}

interface BookFormProps {
  onSubmit: (data: BookFormData) => void;
  initialData?: BookFormData;
  inputStyle?: TextStyle;
  buttonStyle?: ViewStyle;
  labelStyle?: TextStyle;
}

const BookForm: React.FC<BookFormProps> = ({
  onSubmit,
  initialData,
  inputStyle,
  buttonStyle,
  labelStyle,
}) => {
  const [formData, setFormData] = useState<BookFormData>({
    title: "",
    author: "",
    description: "",
    isbn: "",
    publicationDate: new Date().toISOString().split("T")[0],
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setSelectedDate(new Date(initialData.publicationDate));
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Le titre est requis";
    if (!formData.author.trim()) newErrors.author = "L'auteur est requis";
    if (!formData.isbn.trim()) newErrors.isbn = "L'ISBN est requis";
    if (!/^\d{10,13}$/.test(formData.isbn))
      newErrors.isbn = "ISBN invalide (10-13 chiffres)";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (date) {
      setSelectedDate(date);
      setFormData({
        ...formData,
        publicationDate: date.toISOString().split("T")[0],
      });
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        ...formData,
        publicationDate: `${formData.publicationDate}T00:00:00.000Z`,
      });
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* Titre */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, labelStyle]}>Titre du livre</Text>
        <View
          style={[styles.inputContainer, errors.title && styles.errorInput]}
        >
          <Icon name="title" size={20} color="#4a5568" style={styles.icon} />
          <TextInput
            style={[styles.input, inputStyle]}
            placeholder="Entrez le titre"
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
          />
        </View>
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
      </View>

      {/* Auteur */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, labelStyle]}>Auteur</Text>
        <View
          style={[styles.inputContainer, errors.author && styles.errorInput]}
        >
          <Icon name="person" size={20} color="#4a5568" style={styles.icon} />
          <TextInput
            style={[styles.input, inputStyle]}
            placeholder="Entrez l'auteur"
            value={formData.author}
            onChangeText={(text) => setFormData({ ...formData, author: text })}
          />
        </View>
        {errors.author && <Text style={styles.errorText}>{errors.author}</Text>}
      </View>

      {/* Description */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, labelStyle]}>Description</Text>
        <View style={styles.inputContainer}>
          <Icon
            name="description"
            size={20}
            color="#4a5568"
            style={styles.icon}
          />
          <TextInput
            style={[styles.input, inputStyle, styles.multilineInput]}
            placeholder="Description du livre"
            multiline
            numberOfLines={4}
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
          />
        </View>
      </View>

      {/* ISBN */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, labelStyle]}>ISBN</Text>
        <View style={[styles.inputContainer, errors.isbn && styles.errorInput]}>
          <Icon name="numbers" size={20} color="#4a5568" style={styles.icon} />
          <TextInput
            style={[styles.input, inputStyle]}
            placeholder="Numéro ISBN"
            keyboardType="numeric"
            value={formData.isbn}
            onChangeText={(text) => setFormData({ ...formData, isbn: text })}
          />
        </View>
        {errors.isbn && <Text style={styles.errorText}>{errors.isbn}</Text>}
      </View>

      {/* Date de publication */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, labelStyle]}>Date de publication</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Icon name="event" size={20} color="#4a5568" style={styles.icon} />
          <Text style={styles.dateText}>
            {formData.publicationDate || "Sélectionner une date"}
          </Text>
        </TouchableOpacity>

        {/* Date Picker for iOS */}
        {showDatePicker && Platform.OS === "ios" && (
          <Modal transparent={true} animationType="slide">
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosPickerWrapper}>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.closeButtonText}>Valider</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* Date Picker for Android */}
        {showDatePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>

      {/* Bouton de soumission */}
      <TouchableOpacity
        style={[styles.submitButton, buttonStyle]}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>
          {initialData ? "Mettre à jour" : "Ajouter le livre"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#2d3748",
    marginBottom: 8,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#1a202c",
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
    paddingVertical: 10,
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  dateText: {
    fontSize: 16,
    color: "#1a202c",
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: "#4299e1",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#e53e3e",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 10,
  },
  errorInput: {
    borderColor: "#e53e3e",
  },
  iosPickerContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  iosPickerWrapper: {
    backgroundColor: "white",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  closeButton: {
    backgroundColor: "#4299e1",
    padding: 15,
    alignItems: "center",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default BookForm;
