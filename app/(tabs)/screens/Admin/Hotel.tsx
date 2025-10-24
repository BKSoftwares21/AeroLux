import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AdminLayout from "../../../../components/AdminLayout";
import { api, type Hotel as ApiHotel } from "../../../services/api";

export default function AdminHotelsScreen() {
  const [hotels, setHotels] = useState<ApiHotel[]>([]);
  const [editing, setEditing] = useState<ApiHotel | null>(null);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [star, setStar] = useState("");
  const [amenitiesText, setAmenitiesText] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  const resetForm = () => {
    setName("");
    setCity("");
    setCountry("");
    setDescription("");
    setStar("");
    setAmenitiesText("");
    setImageUrl(undefined);
    setEditing(null);
  };

  const load = async () => {
    const { hotels } = await api.listHotels();
    setHotels(hotels);
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!name || !city || !country || !star) {
      alert("Please fill all required fields.");
      return;
    }
    const amenitiesArray = amenitiesText
      ? amenitiesText.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const amenities: any = { list: amenitiesArray };
    if (imageUrl) amenities.imageUrl = imageUrl;
    if (editing) {
      await api.updateHotel(editing.id, {
        name,
        city,
        country,
        description,
        star_rating: Number(star),
        amenities,
      });
    } else {
      await api.createHotel({
        name,
        city,
        country,
        description,
        star_rating: Number(star),
        amenities,
      });
    }
    resetForm();
    await load();
  };

  const handleEdit = (h: ApiHotel) => {
    setEditing(h);
    setName(h.name || "");
    setCity((h as any).city || "");
    setCountry((h as any).country || "");
    setDescription((h as any).description || "");
    setStar(String((h as any).star_rating || (h as any).starRating || ""));
    const am = (h as any).amenities;
    if (am && typeof am === 'object') {
      if (Array.isArray(am.list)) setAmenitiesText(am.list.join(", "));
      if (am.imageUrl) setImageUrl(am.imageUrl);
    } else if (Array.isArray(am)) {
      setAmenitiesText(am.join(", "));
    } else if (typeof am === 'string') {
      setAmenitiesText(am);
    }
  };

  const handleDelete = async (id: number) => {
    await api.deleteHotel(id);
    await load();
  };

  return (
    <AdminLayout>
      <View style={styles.container}>
        <Text style={styles.header}>Hotels</Text>

        <TouchableOpacity style={styles.imagePicker} onPress={async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.7 });
          if (!result.canceled && result.assets?.length) {
            const asset = result.assets[0];
            try {
              const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' as any });
              const mime = (asset as any).mimeType || 'image/jpeg';
              const data = `data:${mime};base64,${base64}`;
              const uploaded = await api.uploadImage({ data, filename: (asset as any).fileName || 'hotel' });
              setImageUrl(uploaded.url);
            } catch {
              setImageUrl(asset.uri);
            }
          }
        }}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.hotelImage} />
          ) : (
            <Text style={styles.imagePickerText}>Upload Hotel Image</Text>
          )}
        </TouchableOpacity>

        <TextInput style={styles.input} placeholder="Name" placeholderTextColor="#ccc" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="City" placeholderTextColor="#ccc" value={city} onChangeText={setCity} />
        <TextInput style={styles.input} placeholder="Country" placeholderTextColor="#ccc" value={country} onChangeText={setCountry} />
        <TextInput style={styles.input} placeholder="Description" placeholderTextColor="#ccc" value={description} onChangeText={setDescription} />
        <TextInput style={styles.input} placeholder="Star Rating (1-5)" placeholderTextColor="#ccc" value={star} onChangeText={setStar} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Amenities (comma-separated)" placeholderTextColor="#ccc" value={amenitiesText} onChangeText={setAmenitiesText} />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>{editing ? 'Update Hotel' : 'Add Hotel'}</Text>
        </TouchableOpacity>

        <FlatList
          data={hotels}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {((item as any).amenities && (item as any).amenities.imageUrl) ? (
                <Image source={{ uri: (item as any).amenities.imageUrl }} style={styles.hotelImage} />
              ) : null}
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSub}>{(item as any).city}, {(item as any).country}</Text>
              {(item as any).description ? <Text style={styles.cardSub}>{(item as any).description}</Text> : null}
              {(item as any).star_rating || (item as any).starRating ? <Text style={styles.cardSub}>⭐ {(item as any).star_rating ?? (item as any).starRating}</Text> : null}
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
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
  header: { color: '#FFD700', fontWeight: 'bold', fontSize: 18, marginBottom: 10 },
  imagePicker: { alignItems: 'center', marginBottom: 15 },
  imagePickerText: { color: '#FFD700', fontSize: 16, padding: 20, borderWidth: 1, borderColor: '#FFD700', borderRadius: 8 },
  hotelImage: { width: 140, height: 100, borderRadius: 8, marginBottom: 10 },
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
  saveText: { color: "#0A1A2F", fontSize: 16, fontWeight: "bold" },
  card: {
    backgroundColor: "#1C2A44",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  cardTitle: { color: "#FFD700", fontSize: 16, fontWeight: "bold" },
  cardSub: { color: "#FFFFFF", fontSize: 14, marginTop: 5 },
  cardActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  editButton: { backgroundColor: "#3B82F6", padding: 8, borderRadius: 6, flex: 1, alignItems: "center", marginRight: 5 },
  deleteButton: { backgroundColor: "#EF4444", padding: 8, borderRadius: 6, flex: 1, alignItems: "center", marginLeft: 5 },
  actionText: { color: "#fff", fontWeight: "bold" },
});
