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

interface Flight {
  id: number;
  flightNumber: string;
  airline: string;
  departure: string;
  arrival: string;
  date: string;
  time: string;
  price: number;
  imageUrl?: string;
  isFirstClass: boolean;
}

export default function AdminFlightsScreen() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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

  // Backend integration
  const { http } = require("@/constants/api");

  const mapFlightFromApi = (row: any): Flight => ({
    id: Number(row.id),
    flightNumber: row.flight_number ?? row.flightNumber ?? "",
    airline: row.airline ?? "",
    departure: row.departure ?? "",
    arrival: row.arrival ?? "",
    date: row.departure_date ?? row.date ?? "",
    time: row.departure_time ?? row.time ?? "",
    price: Number(row.price ?? 0),
    imageUrl: row.image_url ?? row.imageUrl ?? undefined,
    isFirstClass: Boolean(row.is_first_class ?? row.isFirstClass ?? false),
  });

  const fetchFlights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const rows = await http<unknown[]>("/flights.php", { method: "GET" });
      setFlights((rows as any[]).map(mapFlightFromApi));
    } catch (e: any) {
      setError(e?.message || "Failed to load flights");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();
  }, []);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.length) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!flightNumber || !airline || !departure || !arrival || !price) return;
    try {
      if (editingFlight) {
        await http(`/flights.php?id=${editingFlight.id}`, {
          method: "PUT",
          body: JSON.stringify({ flightNumber, airline, departure, arrival, date, time, price: +price, imageUrl, isFirstClass }),
        });
      } else {
        await http(`/flights.php`, {
          method: "POST",
          body: JSON.stringify({ flightNumber, airline, departure, arrival, date, time, price: +price, imageUrl, isFirstClass }),
        });
      }
      await fetchFlights();
      resetForm();
    } catch (e: any) {
      alert(e?.message || "Failed to save flight");
    }
  };

  const handleEdit = (flight: Flight) => {
    setEditingFlight(flight);
    setFlightNumber(flight.flightNumber);
    setAirline(flight.airline);
    setDeparture(flight.departure);
    setArrival(flight.arrival);
    setDate(flight.date);
    setTime(flight.time);
    setPrice(flight.price.toString());
    setImageUrl(flight.imageUrl);
    setIsFirstClass(flight.isFirstClass);
  };

  const handleDelete = async (id: number) => {
    try {
      await http(`/flights.php?id=${id}`, { method: "DELETE" });
      await fetchFlights();
    } catch (e: any) {
      alert(e?.message || "Failed to delete flight");
    }
  };

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

      {/* Status */}
      {isLoading ? (
        <Text style={{ color: "#fff", marginBottom: 10 }}>Loading...</Text>
      ) : null}
      {error ? (
        <Text style={{ color: "#EF4444", marginBottom: 10 }}>{error}</Text>
      ) : null}

      {/* Flight List */}
      <FlatList
        data={flights}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.imageUrl && <Image source={{ uri: item.imageUrl }} style={styles.flightImage} />}
            <Text style={styles.cardText}>{item.flightNumber} • {item.airline}</Text>
            <Text style={styles.cardSub}>{item.departure} → {item.arrival}</Text>
            <Text style={styles.cardSub}>{item.date} at {item.time}</Text>
            <Text style={styles.cardSub}>${item.price.toFixed(2)}</Text>
            <Text style={styles.cardSub}>{item.isFirstClass ? "First Class" : "Economy"}</Text>

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
