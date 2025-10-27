import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BookingConfirmationScreen({ route }: any) {
  const { type, name, location, price, imageUri, reference, date } = route?.params || {};

  return (
    <View style={styles.container}>
      {/* Success Icon */}
      <Ionicons name="checkmark-circle" size={100} color="#FFD700" />
<Stack.Screen options={{ headerShown: false }} />
      {/* Title */}
      <Text style={styles.title}>Booking Confirmed!</Text>
      <Text style={styles.subtitle}>
        Thank you for choosing AeroLux. Your booking has been successfully
        completed.
      </Text>

      {/* Booking Details */}
      <View style={styles.card}>
        <Image
          source={imageUri ? (typeof imageUri === 'string' ? { uri: imageUri } : imageUri) : require("../../../../assets/images/destination.jpg")}
          style={styles.cardImage}
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{name || (type === 'FLIGHT' ? 'Flight' : 'Hotel')}</Text>
          <Text style={styles.cardDetails}>{location || ''}</Text>
          <Text style={styles.cardPrice}>{price ? `$${price}` : ''}</Text>
          {reference ? <Text style={styles.cardDetails}>Ref: {reference}</Text> : null}
          {date ? <Text style={styles.cardDetails}>Date: {date}</Text> : null}
        </View>
      </View>

      {/* Button to return home */}
      <TouchableOpacity style={styles.homeButton} onPress={() => router.push('./Homescreen')}>
        <Ionicons name="home" size={20} color="#0A1A2F" />
        <Text style={styles.homeButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1A2F",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFD700",
    marginTop: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    marginVertical: 15,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginVertical: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: 150,
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardDetails: {
    fontSize: 14,
    color: "#666",
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  homeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
    width: "80%",
  },
  homeButtonText: {
    color: "#0A1A2F",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
