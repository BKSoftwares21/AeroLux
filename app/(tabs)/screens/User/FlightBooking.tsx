import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function FlightBooking() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState("1");

  const handleBooking = () => {
    console.log({ from, to, date, passengers });
    // Later: call backend API
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book a Flight</Text>

      <TextInput
        placeholder="From"
        value={from}
        onChangeText={setFrom}
        style={styles.input}
      />
      <TextInput
        placeholder="To"
        value={to}
        onChangeText={setTo}
        style={styles.input}
      />
      <TextInput
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
        style={styles.input}
      />
      <TextInput
        placeholder="Passengers"
        value={passengers}
        onChangeText={setPassengers}
        style={styles.input}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleBooking}>
        <Text style={styles.buttonText}>Search Flights</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
