// screens/Admin/BookingsPage.tsx
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../../../services/api";


type AdminBooking = {
  id: string;
  userId: number;
  type: 'FLIGHT' | 'HOTEL';
  reference: string;
  date: string;
  amount: number;
  description: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
};

export default function Bookings() {
  const [bookings, setBookings] = React.useState<AdminBooking[]>([]);

  const load = React.useCallback(async () => {
    const res = await api.listBookings();
    const mapped = (res.bookings || []).map((b: any) => ({
      id: String(b.id),
      userId: b.userId,
      type: b.type,
      reference: b.reference,
      date: new Date(b.date).toISOString().slice(0,10),
      amount: Number(b.amount),
      description: b.description,
      status: b.status,
    }));
    setBookings(mapped);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const updateBooking = async (id: string | number, status: "CONFIRMED" | "CANCELLED" | "PENDING" | "COMPLETED") => {
    await api.updateBookingStatus(String(id), status);
    await load();
  };

  const requestCancel = async (id: string | number) => {
    await api.cancelBooking(String(id));
    await load();
  };

  const deleteBooking = async (id: string | number) => {
    await api.deleteBooking(String(id));
    await load();
  };

  return (
    <View style={styles.container}>
      
      <Text style={styles.title}>Manage Bookings</Text>

      <FlatList
        data={bookings}
        keyExtractor={(item) => String(item.id)}
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
                onPress={() => requestCancel(item.id)}
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
