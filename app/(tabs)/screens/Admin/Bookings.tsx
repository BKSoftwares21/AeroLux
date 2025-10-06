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
            <Text>User: {item.userId}</Text>
            <Text>Type: {item.type}</Text>
            <Text>Reference: {item.reference}</Text>
            <Text>Status: {item.status}</Text>

            <View style={styles.row}>
              <TouchableOpacity onPress={() => updateBooking(item.id, "CONFIRMED")} style={styles.button}>
                <Text>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => updateBooking(item.id, "CANCELLED")} style={styles.button}>
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteBooking(item.id)} style={styles.deleteButton}>
                <Text>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  card: { backgroundColor: "#f9f9f9", padding: 12, marginBottom: 10, borderRadius: 8 },
  row: { flexDirection: "row", marginTop: 8, justifyContent: "space-between" },
  button: { backgroundColor: "#ddd", padding: 8, borderRadius: 5 },
  deleteButton: { backgroundColor: "#f88", padding: 8, borderRadius: 5 },
});
