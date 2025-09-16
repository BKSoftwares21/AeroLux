import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function HotelBooking() {
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");

  const handleBooking = () => {
    console.log({ location, checkIn, checkOut, guests });
    // Later: call backend API
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book a Hotel</Text>

      <TextInput
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
        style={styles.input}
      />
      <TextInput
        placeholder="Check-In Date (YYYY-MM-DD)"
        value={checkIn}
        onChangeText={setCheckIn}
        style={styles.input}
      />
      <TextInput
        placeholder="Check-Out Date (YYYY-MM-DD)"
        value={checkOut}
        onChangeText={setCheckOut}
        style={styles.input}
      />
      <TextInput
        placeholder="Guests"
        value={guests}
        onChangeText={setGuests}
        style={styles.input}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleBooking}>
        <Text style={styles.buttonText}>Search Hotels</Text>
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
