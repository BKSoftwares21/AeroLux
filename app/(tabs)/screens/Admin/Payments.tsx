// screens/Admin/PaymentsPage.tsx
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    // Replace with API call
    setPayments([
      { id: 1, bookingId: 1, amount: 250, status: "PENDING", paymentMethod: "CARD" },
      { id: 2, bookingId: 2, amount: 500, status: "PAID", paymentMethod: "MOBILE_MONEY" },
    ]);
  };

  const updatePayment = async (id: number, status: string) => {
    // Replace with API PUT request
    setPayments(payments.map(p => (p.id === id ? { ...p, status } : p)));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Payments</Text>

      <FlatList
        data={payments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Booking ID: {item.bookingId}</Text>
            <Text>Amount: ${item.amount}</Text>
            <Text>Method: {item.paymentMethod}</Text>
            <Text>Status: {item.status}</Text>

            <View style={styles.row}>
              <TouchableOpacity onPress={() => updatePayment(item.id, "PAID")} style={styles.button}>
                <Text>Mark as Paid</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => updatePayment(item.id, "FAILED")} style={styles.deleteButton}>
                <Text>Mark as Failed</Text>
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
  button: { backgroundColor: "#cfc", padding: 8, borderRadius: 5 },
  deleteButton: { backgroundColor: "#f88", padding: 8, borderRadius: 5 },
});
