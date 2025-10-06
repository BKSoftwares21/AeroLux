import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Payments() {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");

  const handlePayment = () => {
    // Later connect to backend/payment gateway
    alert("✅ Payment Successful! Your booking is confirmed.");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Payment</Text>
      <Text style={styles.subtitle}>Enter your card details to complete the booking</Text>

      {/* Card Holder */}
      <TextInput
        style={styles.input}
        placeholder="Cardholder Name"
        placeholderTextColor="#ccc"
        value={name}
        onChangeText={setName}
      />

      {/* Card Number */}
      <TextInput
        style={styles.input}
        placeholder="Card Number"
        placeholderTextColor="#ccc"
        keyboardType="numeric"
        value={cardNumber}
        onChangeText={setCardNumber}
      />

      {/* Expiry + CVV */}
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
        <Text style={styles.payButtonText}>PAY NOW</Text>
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
    marginBottom: 30,
    textAlign: "center",
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
});
