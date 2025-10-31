import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getBookingById, markBookingPaid } from "../../../store/bookingsStore";
import { session } from "../../../store/session";
import { api } from "../../../services/api";

export default function Payments() {
  // Get booking details from previous screen or via bookingId
  const { bookingId, type, name, location, price, imageUri, flightId, passengers } = useLocalSearchParams<{
    bookingId?: string;
    type?: string;
    name?: string;
    location?: string;
    price?: string;
    imageUri?: string;
    flightId?: string;
    passengers?: string;
  }>();

  const booking = bookingId ? getBookingById(bookingId) : undefined;

  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const handlePayment = async () => {
    const userId = session.user?.id;
    if (booking) {
      await markBookingPaid(booking.id);
      try {
        if (userId) {
          await api.createPayment({ bookingId: booking.id, userId, amount: booking.amount, method: 'CARD' });
        }
      } catch {}
      alert(`✅ Payment Successful! Your ${booking.type.toLowerCase()} booking is confirmed.`);
      router.push({ pathname: '/(tabs)/screens/User/BookingConfirmationScreen', params: { type: booking.type, name, location, price: booking.amount, imageUri, reference: booking.reference, date: booking.date } });
    } else {
      // Create a booking first then mark paid
      try {
        if (!userId) throw new Error('No user');
        const ref = `${(type || 'HOTEL').toString().toUpperCase().slice(0,3)}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
        const created = await api.createBooking({
          userId,
          type: (type || 'HOTEL').toUpperCase(),
          reference: ref,
          date: new Date().toISOString(),
          amount: Number(price || 0),
          description: `${name || ''} ${location ? '- ' + location : ''}`.trim(),
          metadata: { imageUri },
          ...(String(type).toUpperCase() === 'FLIGHT' && flightId ? { flightId: Number(flightId), passengers: Number(passengers || 1) } : {}),
        });
        const bid = String(created.booking?.id || created.id);
        await api.markBookingPaid(bid);
        await api.createPayment({ bookingId: bid, userId, amount: Number(price || 0), method: 'CARD' });
        alert('✅ Payment Successful!');
        router.push({ pathname: '/(tabs)/screens/User/BookingConfirmationScreen', params: { type, name, location, price, imageUri, reference: ref, date: new Date().toISOString().slice(0,10) } });
      } catch {
        alert('Payment completed, but failed to create booking.');
        router.push('/(tabs)/screens/User/BookingHistory');
      }
    }
  };

  return (
    <View style={styles.container}>
       <Stack.Screen options={{ headerShown: false }} />
      {/* Header */}
      <Text style={styles.title}>Payment</Text>
      <Text style={styles.subtitle}>Confirm your booking and enter payment details</Text>

      {/* Booking Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryHeader}>Booking Summary</Text>
        <Text style={styles.summaryText}>
          <Text style={styles.label}>Type:</Text> {booking?.type || type || "Hotel"}
        </Text>
        <Text style={styles.summaryText}>
          <Text style={styles.label}>Name:</Text> {name || "The Bahamas Resort"}
        </Text>
        <Text style={styles.summaryText}>
          <Text style={styles.label}>Location:</Text> {location || "The Bahamas"}
        </Text>
        <Text style={styles.total}>
          Total: <Text style={styles.price}>${booking?.amount ?? price ?? "300"}</Text>
        </Text>
      </View>

      {/* Payment Inputs */}
      <TextInput
        style={styles.input}
        placeholder="Cardholder Name"
        placeholderTextColor="#ccc"
        value={cardName}
        onChangeText={setCardName}
      />
      <TextInput
        style={styles.input}
        placeholder="Card Number"
        placeholderTextColor="#ccc"
        keyboardType="numeric"
        value={cardNumber}
        onChangeText={setCardNumber}
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="MM/YY"
          placeholderTextColor="#ccc"
          value={expiryDate}
          onChangeText={setExpiryDate}
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="CVV"
          placeholderTextColor="#ccc"
          secureTextEntry
          keyboardType="numeric"
          value={cvv}
          onChangeText={setCvv}
        />
      </View>

      {/* Pay Button */}
      <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
        <Ionicons name="card" size={20} color="#0A1A2F" />
        <Text style={styles.payButtonText}>PAY ${price || "300"}</Text>
      </TouchableOpacity>

      {/* Back Button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Text style={styles.backText}>← Back to Booking</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1A2F",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#ccc",
    marginBottom: 25,
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0A1A2F",
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 15,
    color: "#333",
    marginBottom: 4,
  },
  label: {
    fontWeight: "bold",
    color: "#0A1A2F",
  },
  total: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#0A1A2F",
    marginTop: 10,
  },
  price: {
    color: "#D4AF37",
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#FFD700",
    color: "#FFFFFF",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    flex: 1,
    marginRight: 10,
  },
  payButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  payButtonText: {
    color: "#0A1A2F",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  backButton: {
    marginTop: 20,
    alignItems: "center",
  },
  backText: {
    color: "#FFD700",
    fontWeight: "bold",
  },
});
