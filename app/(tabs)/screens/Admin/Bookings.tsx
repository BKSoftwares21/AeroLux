// screens/Admin/BookingsPage.tsx
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    // Replace with API call
    setBookings([
      { id: 1, userId: "u1", type: "FLIGHT", reference: "FL123", status: "PENDING" },
      { id: 2, userId: "u2", type: "HOTEL", reference: "HT456", status: "CONFIRMED" },
    ]);
  };

  const updateBooking = async (id: number, status: string) => {
    // Replace with API PUT request
    setBookings(bookings.map(b => (b.id === id ? { ...b, status } : b)));
  };

  const deleteBooking = async (id: number) => {
    // Replace with API DELETE request
    setBookings(bookings.filter(b => b.id !== id));
  };

  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>Manage Bookings</Text>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {item.type === "FLIGHT" ? "✈️ Flight" : "🏨 Hotel"} Booking
            </Text>

            <Text style={styles.text}>
              <Text style={styles.label}>User:</Text> {item.userId}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.label}>Type:</Text> {item.type}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.label}>Reference:</Text> {item.reference}
            </Text>
            <Text
              style={[
                styles.status,
                item.status === "CONFIRMED"
                  ? styles.statusConfirmed
                  : item.status === "CANCELLED"
                  ? styles.statusCancelled
                  : styles.statusPending,
              ]}
            >
              {item.status}
            </Text>

            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => updateBooking(item.id, "CONFIRMED")}
                style={[styles.button, { backgroundColor: "#22C55E" }]}
              >
                <Text style={styles.actionText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => updateBooking(item.id, "CANCELLED")}
                style={[styles.button, { backgroundColor: "#EF4444" }]}
              >
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => deleteBooking(item.id)}
                style={[styles.button, styles.deleteButton]}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1C2A44",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 10,
  },
  text: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 4,
  },
  label: {
    color: "#FFD700",
    fontWeight: "bold",
  },
  status: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    fontWeight: "bold",
    fontSize: 13,
  },
  statusConfirmed: {
    backgroundColor: "#22C55E",
    color: "#fff",
  },
  statusCancelled: {
    backgroundColor: "#EF4444",
    color: "#fff",
  },
  statusPending: {
    backgroundColor: "#FACC15",
    color: "#0A1A2F",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#B91C1C",
  },
});
