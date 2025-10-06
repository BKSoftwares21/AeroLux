import React, { useState } from "react";
import {
    FlatList,
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
}

export default function Hotel() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [rating, setRating] = useState("");

  const resetForm = () => {
    setName("");
    setLocation("");
    setDescription("");
    setPricePerNight("");
    setRating("");
    setEditingHotel(null);
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
  };

  const handleDelete = (id: number) => {
    setHotels((prev) => prev.filter((hotel) => hotel.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Hotels</Text>

      {/* Form */}
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
            <Text style={styles.cardText}>
              {item.name} - {item.location}
            </Text>
            <Text style={styles.cardSub}>
              {item.description || "No description"}
            </Text>
            <Text style={styles.cardSub}>
              ${item.pricePerNight} / night | ⭐ {item.rating}
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
  },
  editButton: {
    backgroundColor: "#3B82F6",
    padding: 8,
    borderRadius: 6,
  },
  deleteButton: {
    backgroundColor: "#EF4444",
    padding: 8,
    borderRadius: 6,
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
