import React, { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Flight {
  id: number;
  flightNumber: string;
  departure: string;
  arrival: string;
  date: string;
  time: string;
  price: number;
}

export default function AdminFlightsScreen() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [editingFlight, setEditingFlight] = useState<Flight | null>(null);

  const [flightNumber, setFlightNumber] = useState("");
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [price, setPrice] = useState("");

  const resetForm = () => {
    setFlightNumber("");
    setDeparture("");
    setArrival("");
    setDate("");
    setTime("");
    setPrice("");
    setEditingFlight(null);
  };

  const handleSave = () => {
    if (!flightNumber || !departure || !arrival || !price) return;

    if (editingFlight) {
      setFlights((prev) =>
        prev.map((f) =>
          f.id === editingFlight.id
            ? {
                ...f,
                flightNumber,
                departure,
                arrival,
                date,
                time,
                price: Number(price),
              }
            : f
        )
      );
    } else {
      const newFlight: Flight = {
        id: flights.length + 1,
        flightNumber,
        departure,
        arrival,
        date,
        time,
        price: Number(price),
      };
      setFlights([...flights, newFlight]);
    }
    resetForm();
  };

  const handleEdit = (flight: Flight) => {
    setEditingFlight(flight);
    setFlightNumber(flight.flightNumber);
    setDeparture(flight.departure);
    setArrival(flight.arrival);
    setDate(flight.date);
    setTime(flight.time);
    setPrice(flight.price.toString());
  };

  const handleDelete = (id: number) => {
    setFlights((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Flights</Text>

      {/* Form */}
      <TextInput
        style={styles.input}
        placeholder="Flight Number"
        placeholderTextColor="#ccc"
        value={flightNumber}
        onChangeText={setFlightNumber}
      />
      <TextInput
        style={styles.input}
        placeholder="Departure"
        placeholderTextColor="#ccc"
        value={departure}
        onChangeText={setDeparture}
      />
      <TextInput
        style={styles.input}
        placeholder="Arrival"
        placeholderTextColor="#ccc"
        value={arrival}
        onChangeText={setArrival}
      />
      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        placeholderTextColor="#ccc"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Time (HH:MM)"
        placeholderTextColor="#ccc"
        value={time}
        onChangeText={setTime}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        placeholderTextColor="#ccc"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveText}>
          {editingFlight ? "Update Flight" : "Add Flight"}
        </Text>
      </TouchableOpacity>

      {/* Flight List */}
      <FlatList
        data={flights}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardText}>
              {item.flightNumber} | {item.departure} → {item.arrival}
            </Text>
            <Text style={styles.cardSub}>
              {item.date} at {item.time}
            </Text>
            <Text style={styles.cardSub}>${item.price}</Text>

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
