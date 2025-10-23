import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
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

  const resetForm = () => {
    setName("");
    setCity("");
    setCountry("");
    setDescription("");
    setStar("");
    setAmenitiesText("");
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
    const amenities = amenitiesText
      ? amenitiesText.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
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
    setStar(String((h as any).star_rating || ""));
    const am = (h as any).amenities;
    setAmenitiesText(Array.isArray(am) ? am.join(", ") : typeof am === 'string' ? am : "");
  };

  const handleDelete = async (id: number) => {
    await api.deleteHotel(id);
    await load();
  };

  return (
    <AdminLayout>
      <View style={styles.container}>
        <Text style={styles.header}>Hotels</Text>

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
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSub}>{(item as any).city}, {(item as any).country}</Text>
              {(item as any).description ? <Text style={styles.cardSub}>{(item as any).description}</Text> : null}
              {(item as any).star_rating ? <Text style={styles.cardSub}>⭐ {(item as any).star_rating}</Text> : null}
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
