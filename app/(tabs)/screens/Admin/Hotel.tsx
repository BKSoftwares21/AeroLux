import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Hotel {
  id: number;
  name: string;
  location: string;
  description: string;
  pricePerNight: number;
  rating: number;
  imageUri?: string;
  bedType?: string;
}

const bedTypes = [
  "Single",
  "Double",
  "Queen",
  "King",
  "Twin",
  "Bunk",
  "Sofa Bed",
  "Studio",
];

export default function Hotel() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [rating, setRating] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [bedType, setBedType] = useState<string>(bedTypes[0]);

  const resetForm = () => {
    setName("");
    setLocation("");
    setDescription("");
    setPricePerNight("");
    setRating("");
    setImageUri(undefined);
    setBedType(bedTypes[0]);
    setEditingHotel(null);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!name || !location || !pricePerNight) return;

    if (editingHotel) {
      setHotels((prev) =>
        prev.map((hotel) =>
          hotel.id === editingHotel.id
            ? {
                ...hotel,
                name,
                location,
                description,
                pricePerNight: Number(pricePerNight),
                rating: Number(rating),
                imageUri,
                bedType,
              }
            : hotel
        )
      );
    } else {
      const newHotel: Hotel = {
        id: hotels.length + 1,
        name,
        location,
        description,
        pricePerNight: Number(pricePerNight),
        rating: Number(rating),
        imageUri,
        bedType,
      };
      setHotels([...hotels, newHotel]);
    }
    resetForm();
  };

  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setName(hotel.name);
    setLocation(hotel.location);
    setDescription(hotel.description);
    setPricePerNight(hotel.pricePerNight.toString());
    setRating(hotel.rating.toString());
    setImageUri(hotel.imageUri);
    setBedType(hotel.bedType || bedTypes[0]);
  };

  const handleDelete = (id: number) => {
    setHotels((prev) => prev.filter((hotel) => hotel.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Hotels</Text>

      {/* Form */}
      <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.hotelImage} />
        ) : (
          <Text style={styles.imagePickerText}>Pick Hotel Image</Text>
        )}
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Hotel Name"
        placeholderTextColor="#ccc"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        placeholderTextColor="#ccc"
        value={location}
        onChangeText={setLocation}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        placeholderTextColor="#ccc"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Price Per Night"
        placeholderTextColor="#ccc"
        value={pricePerNight}
        onChangeText={setPricePerNight}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Rating (1-5)"
        placeholderTextColor="#ccc"
        value={rating}
        onChangeText={setRating}
        keyboardType="numeric"
      />

      {/* Bed Type Picker */}
      <View style={styles.pickerWrapper}>
        <Text style={styles.pickerLabel}>Bed Type:</Text>
        <Picker
          selectedValue={bedType}
          style={styles.picker}
          onValueChange={(itemValue: string) => setBedType(itemValue)}
        >
          {bedTypes.map((type) => (
            <Picker.Item label={type} value={type} key={type} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>
          {editingHotel ? "Update Hotel" : "Add Hotel"}
        </Text>
      </TouchableOpacity>

      {/* Hotel List */}
      <FlatList
        data={hotels}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.imageUri && (
              <Image source={{ uri: item.imageUri }} style={styles.hotelImage} />
            )}
            <Text style={styles.cardText}>
              {item.name} - {item.location}
            </Text>
            <Text style={styles.cardSub}>
              {item.description || "No description"}
            </Text>
            <Text style={styles.cardSub}>
              ${item.pricePerNight} / night | ⭐ {item.rating}
            </Text>
            <Text style={styles.cardSub}>
              Bed Type: {item.bedType}
            </Text>

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEdit(item)}
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1A2F",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 20,
    textAlign: "center",
  },
  imagePicker: {
    alignItems: "center",
    marginBottom: 15,
  },
  imagePickerText: {
    color: "#FFD700",
    fontSize: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#FFD700",
    borderRadius: 8,
  },
  hotelImage: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#FFFFFF",
    color: "#FFFFFF",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  saveButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  saveText: {
    color: "#0A1A2F",
    fontSize: 16,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#1C2A44",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  cardText: {
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 16,
  },
  cardSub: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 5,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    width: "100%",
  },
  editButton: {
    backgroundColor: "#3B82F6",
    padding: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: "#EF4444",
    padding: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
    marginLeft: 5,
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  pickerWrapper: {
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pickerLabel: {
    color: "#FFD700",
    fontWeight: "bold",
    marginBottom: 2,
  },
  picker: {
    color: "#fff",
    backgroundColor: "transparent",
    width: "100%",
  },
});
