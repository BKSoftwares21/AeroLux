import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AdminLayout from "../../../../components/AdminLayout";
import { api } from "../../../services/api";

type AdminPayment = {
  id: string;
  bookingId: string;
  userId: number;
  amount: number;
  status: string; // 'pending' | 'paid' | 'failed'
  method?: string;
  bookingType?: 'FLIGHT' | 'HOTEL';
  description?: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    const res = await api.listPayments();
    const mapped = (res.payments || []).map((p: any) => ({
      id: String(p.id),
      bookingId: String(p.bookingId),
      userId: p.userId,
      amount: Number(p.amount),
      status: String(p.status),
      method: p.method || 'CARD',
      bookingType: p.booking?.type,
      description: p.booking?.description,
    }));
    setPayments(mapped);
  };

  const updatePayment = async (id: string, status: 'paid' | 'failed') => {
    await api.updatePaymentStatus(id, status);
    await fetchPayments();
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
              {item.bookingType === "FLIGHT" ? "✈️ Flight" : item.bookingType === "HOTEL" ? "🏨 Hotel" : "💳 Payment"}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.label}>Booking ID:</Text> {item.bookingId}
            </Text>
            {item.description ? (
              <Text style={styles.text}>
                <Text style={styles.label}>Description:</Text> {item.description}
              </Text>
            ) : null}
            <Text style={styles.text}>
              <Text style={styles.label}>Amount:</Text> ${item.amount.toFixed(2)}
            </Text>
            <Text style={styles.text}>
              <Text style={styles.label}>Payment Method:</Text>{" "}
              {item.method}
            </Text>
            <Text
              style={[
                styles.status,
                item.status === "paid"
                  ? styles.statusPaid
                  : item.status === "failed"
                  ? styles.statusFailed
                  : styles.statusPending,
              ]}
            >
              {item.status.toUpperCase()}
            </Text>

            {/* Actions */}
            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => updatePayment(item.id, "paid")}
                style={[styles.button, { backgroundColor: "#22C55E" }]}
              >
                <Text style={styles.actionText}>Mark as Paid</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => updatePayment(item.id, "failed")}
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
