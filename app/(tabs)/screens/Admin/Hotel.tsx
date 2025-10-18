import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AdminLayout from "../../../../components/AdminLayout";

interface Hotel {
  id: number;
  name: string;
  location: string;
  description: string;
  pricePerNight: number;
  rating: number;
  bedType: string;
  imageUrl?: string;
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

export default function AdminHotelsScreen() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [rating, setRating] = useState("");
  const [bedType, setBedType] = useState(bedTypes[0]);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const resetForm = () => {
    setName("");
    setLocation("");
    setDescription("");
    setPricePerNight("");
    setRating("");
    setBedType(bedTypes[0]);
    setImageUrl(undefined);
    setEditingHotel(null);
  };

  // --- Backend integration ---
  const { http } = require("@/constants/api");

  const mapHotelFromApi = (row: any): Hotel => ({
    id: Number(row.id),
    name: row.name,
    location: row.location,
    description: row.description ?? "",
    pricePerNight: Number(row.price_per_night ?? row.pricePerNight ?? 0),
    rating: Number(row.rating ?? 0),
    bedType: row.bed_type ?? row.bedType ?? "",
    imageUrl: row.image_url ?? row.imageUrl ?? undefined,
  });

  const fetchHotels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rows = await http<unknown[]>("/hotels.php", { method: "GET" });
      const mapped = (rows as any[]).map(mapHotelFromApi);
      setHotels(mapped);
    } catch (e: any) {
      setError(e?.message || "Failed to load hotels");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name || !location || !pricePerNight) {
      alert("⚠️ Please fill all required fields.");
      return;
    }
    try {
      if (editingHotel) {
        // Update existing hotel
        await http(`/hotels.php?id=${editingHotel.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name,
            location,
            description,
            pricePerNight: Number(pricePerNight),
            rating: Number(rating),
            bedType,
            imageUrl,
          }),
        });
      } else {
        // Create new hotel
        await http(`/hotels.php`, {
          method: "POST",
          body: JSON.stringify({
            name,
            location,
            description,
            pricePerNight: Number(pricePerNight),
            rating: Number(rating),
            bedType,
            imageUrl,
          }),
        });
      }
      await fetchHotels();
      resetForm();
    } catch (e: any) {
      alert(e?.message || "Failed to save hotel");
    }
  };

  const handleEdit = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setName(hotel.name);
    setLocation(hotel.location);
    setDescription(hotel.description);
    setPricePerNight(hotel.pricePerNight.toString());
    setRating(hotel.rating.toString());
    setBedType(hotel.bedType);
    setImageUrl(hotel.imageUrl);
  };

  const handleDelete = async (id: number) => {
    try {
      await http(`/hotels.php?id=${id}`, { method: "DELETE" });
      await fetchHotels();
    } catch (e: any) {
      alert(e?.message || "Failed to delete hotel");
    }
  };

  return (
    <AdminLayout>
    <View style={styles.container}>

      {/* Image Picker */}
      <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.hotelImage} />
        ) : (
          <Text style={styles.imagePickerText}>Pick Hotel Image</Text>
        )}
      </TouchableOpacity>

      {/* Form Fields */}
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
        <Text style={styles.pickerLabel}>Bed Type</Text>
        <Picker
          selectedValue={bedType}
          onValueChange={(value) => setBedType(value)}
          style={styles.picker}
        >
          {bedTypes.map((type) => (
            <Picker.Item key={type} label={type} value={type} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>
          {editingHotel ? "Update Hotel" : "Add Hotel"}
        </Text>
      </TouchableOpacity>

      {/* Status */}
      {isLoading ? (
        <Text style={{ color: "#fff", marginBottom: 10 }}>Loading...</Text>
      ) : null}
      {error ? (
        <Text style={{ color: "#EF4444", marginBottom: 10 }}>{error}</Text>
      ) : null}

      {/* Hotel List */}
      <FlatList
        data={hotels}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.imageUrl && (
              <Image source={{ uri: item.imageUrl }} style={styles.hotelImage} />
            )}
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSub}>{item.location}</Text>
            <Text style={styles.cardSub}>{item.description}</Text>
            <Text style={styles.cardSub}>
              💰 ${item.pricePerNight} / night | ⭐ {item.rating}
            </Text>
            <Text style={styles.cardSub}>🛏 Bed Type: {item.bedType}</Text>

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
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A1A2F", padding: 20 },
  // header hidden across admin pages (handled by global layout)
  imagePicker: { alignItems: "center", marginBottom: 15 },
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
  pickerWrapper: {
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  pickerLabel: {
    color: "#FFD700",
    fontWeight: "bold",
    padding: 8,
  },
  picker: { color: "#0A1A2F" },
  saveButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  saveText: { color: "#0A1A2F", fontSize: 16, fontWeight: "bold" },
  card: {
    backgroundColor: "#1C2A44",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  cardTitle: { color: "#FFD700", fontSize: 16, fontWeight: "bold" },
  cardSub: { color: "#FFFFFF", fontSize: 14, marginTop: 5 },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
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
  actionText: { color: "#fff", fontWeight: "bold" },
});
