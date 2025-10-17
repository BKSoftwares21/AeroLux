import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  status: string;
  paymentMethod: string;
  bookingType: "FLIGHT" | "HOTEL";
  details: {
    name: string;
    location: string;
    date?: string;
    duration?: string;
  };
}

import AdminLayout from "../../../../components/AdminLayout";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    // Replace this with API call
    setPayments([
      {
        id: 1,
        bookingId: 101,
        amount: 250,
        status: "PENDING",
        paymentMethod: "CARD",
        bookingType: "FLIGHT",
        details: {
          name: "AeroLux Airways",
          location: "Paris → New York",
          date: "2025-10-18",
        },
      },
      {
        id: 2,
        bookingId: 202,
        amount: 500,
        status: "PAID",
        paymentMethod: "MOBILE_MONEY",
        bookingType: "HOTEL",
        details: {
          name: "Bahamas Resort",
          location: "Nassau, Bahamas",
          duration: "5 Days / 4 Nights",
        },
      },
    ]);
  };

  const updatePayment = async (id: number, status: string) => {
    // Replace with API PUT request later
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p))
    );
  };

  return (
    <AdminLayout>
    <View style={styles.container}>

      <FlatList
        data={payments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Booking Info */}
            <Text style={styles.cardTitle}>
              {item.bookingType === "FLIGHT" ? "✈️ Flight" : "🏨 Hotel"} Booking
            </Text>
            <Text style={styles.text}>
              <Text style={styles.label}>Booking ID:</Text> {item.bookingId}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.label}>Name:</Text> {item.details.name}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.label}>Location:</Text> {item.details.location}
            </Text>
            {item.details.date && (
              <Text style={styles.text}>
                <Text style={styles.label}>Date:</Text> {item.details.date}
              </Text>
            )}
            {item.details.duration && (
              <Text style={styles.text}>
                <Text style={styles.label}>Duration:</Text>{" "}
                {item.details.duration}
              </Text>
            )}
            <Text style={styles.text}>
              <Text style={styles.label}>Amount:</Text> ${item.amount}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.label}>Payment Method:</Text>{" "}
              {item.paymentMethod}
            </Text>
            <Text
              style={[
                styles.status,
                item.status === "PAID"
                  ? styles.statusPaid
                  : item.status === "FAILED"
                  ? styles.statusFailed
                  : styles.statusPending,
              ]}
            >
              {item.status}
            </Text>

            {/* Actions */}
            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => updatePayment(item.id, "PAID")}
                style={[styles.button, { backgroundColor: "#22C55E" }]}
              >
                <Text style={styles.actionText}>Mark as Paid</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => updatePayment(item.id, "FAILED")}
                style={[styles.button, { backgroundColor: "#EF4444" }]}
              >
                <Text style={styles.actionText}>Mark as Failed</Text>
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
  // title hidden across admin pages (handled by global layout)
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
  statusPaid: {
    backgroundColor: "#22C55E",
    color: "#fff",
  },
  statusFailed: {
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
});
