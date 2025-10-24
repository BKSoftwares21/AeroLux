import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
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
import { api, type Flight as ApiFlight } from "../../../services/api";

type Flight = ApiFlight;

export default function AdminFlightsScreen() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);

  const [flightNumber, setFlightNumber] = useState("");
  const [airline, setAirline] = useState("");
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [isFirstClass, setIsFirstClass] = useState(false);

  const resetForm = () => {
    setFlightNumber("");
    setAirline("");
    setDeparture("");
    setArrival("");
    setDate("");
    setTime("");
    setPrice("");
    setImageUrl(undefined);
    setIsFirstClass(false);
    setEditingFlight(null);
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      try {
        const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' as any });
        const mime = (asset as any).mimeType || 'image/jpeg';
        const data = `data:${mime};base64,${base64}`;
        const uploaded = await api.uploadImage({ data, filename: (asset as any).fileName || 'flight' });
        setImageUrl(uploaded.url);
      } catch {
        // fallback to local preview
        setImageUrl(asset.uri);
      }
    }
  };

  const handleSave = async () => {
    if (!flightNumber || !airline || !departure || !arrival || !price) return;

    if (editingFlight) {
      await api.updateFlight(editingFlight.id, {
        flight_number: flightNumber,
        airline,
        departure,
        arrival,
        date,
        time,
        price: +price,
        image_url: imageUrl,
        is_first_class: isFirstClass,
      });
    } else {
      await api.createFlight({
        flight_number: flightNumber,
        airline,
        departure,
        arrival,
        date,
        time,
        price: +price,
        image_url: imageUrl,
        is_first_class: isFirstClass,
      });
    }
    await load();
    resetForm();
  };

  const handleEdit = (flight: Flight) => {
    setEditingFlight(flight);
    setFlightNumber((flight as any).flight_number || (flight as any).flightNumber || "");
    setAirline(flight.airline);
    setDeparture(flight.departure);
    setArrival(flight.arrival);
    setDate(typeof flight.date === 'string' ? flight.date : new Date(flight.date as any).toISOString().slice(0,10));
    setTime((flight as any).time || "");
    setPrice(String(flight.price));
    setImageUrl((flight as any).image_url || (flight as any).imageUrl);
    setIsFirstClass(Boolean((flight as any).is_first_class ?? (flight as any).isFirstClass));
  };

  const handleDelete = async (id: number) => {
    await api.deleteFlight(id);
    await load();
  };

  useEffect(() => { load(); }, []);

  async function load() {
    const { flights } = await api.listFlights();
    const mapped = (flights || []).map((f: any) => ({
      id: f.id,
      flight_number: f.flightNumber || f.flight_number,
      airline: f.airline,
      departure: f.departure,
      arrival: f.arrival,
      date: new Date(f.date).toISOString().slice(0,10),
      time: f.time || '',
      price: Number(f.price),
      image_url: f.imageUrl || f.image_url,
      is_first_class: f.isFirstClass ?? f.is_first_class,
    }));
    setFlights(mapped as any);
  }

  return (
    <AdminLayout>
    <View style={styles.container}>

      {/* Image Upload */}
      <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.flightImage} />
        ) : (
          <Text style={styles.imagePickerText}>Upload Flight Image</Text>
        )}
      </TouchableOpacity>

      {/* Form Fields */}
      <TextInput style={styles.input} placeholder="Flight Number" value={flightNumber} onChangeText={setFlightNumber} placeholderTextColor="#ccc" />
      <TextInput style={styles.input} placeholder="Airline" value={airline} onChangeText={setAirline} placeholderTextColor="#ccc" />
      <TextInput style={styles.input} placeholder="Departure" value={departure} onChangeText={setDeparture} placeholderTextColor="#ccc" />
      <TextInput style={styles.input} placeholder="Arrival" value={arrival} onChangeText={setArrival} placeholderTextColor="#ccc" />
      <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholderTextColor="#ccc" />
      <TextInput style={styles.input} placeholder="Time (HH:MM)" value={time} onChangeText={setTime} placeholderTextColor="#ccc" />
      <TextInput style={styles.input} placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" placeholderTextColor="#ccc" />

      {/* Toggle Class */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleButton, isFirstClass && styles.toggleButtonActive]}
          onPress={() => setIsFirstClass(true)}
        >
          <Text style={[styles.toggleText, isFirstClass && styles.toggleTextActive]}>First Class</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, !isFirstClass && styles.toggleButtonActive]}
          onPress={() => setIsFirstClass(false)}
        >
          <Text style={[styles.toggleText, !isFirstClass && styles.toggleTextActive]}>Economy</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>{editingFlight ? "Update Flight" : "Add Flight"}</Text>
      </TouchableOpacity>

      {/* Flight List */}
      <FlatList
        data={flights}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {(item as any).image_url && <Image source={{ uri: (item as any).image_url }} style={styles.flightImage} />}
            <Text style={styles.cardText}>{(item as any).flight_number} • {item.airline}</Text>
            <Text style={styles.cardSub}>{item.departure} → {item.arrival}</Text>
            <Text style={styles.cardSub}>{(item as any).date} {item.time ? `at ${item.time}` : ''}</Text>
            <Text style={styles.cardSub}>${Number(item.price).toFixed(2)}</Text>
            <Text style={styles.cardSub}>{((item as any).is_first_class) ? "First Class" : "Economy"}</Text>

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
  container: {
    flex: 1,
    backgroundColor: "#0A1A2F",
    padding: 20,
  },
  // header hidden across admin pages (handled by global layout)
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
  flightImage: {
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
  toggleRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
    gap: 10,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFD700",
    backgroundColor: "transparent",
    marginHorizontal: 5,
  },
  toggleButtonActive: {
    backgroundColor: "#FFD700",
  },
  toggleText: {
    color: "#FFD700",
    fontWeight: "bold",
  },
  toggleTextActive: {
    color: "#0A1A2F",
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
});
