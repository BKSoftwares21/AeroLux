import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
export default function FlightBooking({ route }: any) {
  const params = useLocalSearchParams<{ type?: string; payload?: string }>();
  let parsed: any = null;
  if (params?.payload && typeof params.payload === 'string') {
    try { parsed = JSON.parse(params.payload); } catch {}
  }
  const flight = parsed || route?.params?.flight || {
    id: 0,
    flightNumber: "ALX452",
    airline: "AeroLux Airlines",
    departure: "Johannesburg",
    arrival: "Paris",
    date: "2025-10-25",
    time: "14:30",
    price: 899,
    seatsAvailable: 0,
    imageUri: require("../../../../assets/images/OIP.jpg"),
    isFirstClass: true,
  };

  const [passengers, setPassengers] = React.useState(1);

  const handleBook = () => {
    router.push({
      pathname: "/(tabs)/screens/User/Payments",
      params: {
        type: "FLIGHT",
        name: flight.airline,
        location: `${flight.departure} → ${flight.arrival}`,
        price: (Number(flight.price) * passengers).toString(),
        imageUri: flight.imageUri,
        flightId: String(flight.id || 0),
        passengers: String(passengers),
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.header}>Flight Details</Text>

      <View style={styles.card}>
        <Image
          source={
            flight.imageUri
              ? typeof flight.imageUri === "string"
                ? { uri: flight.imageUri }
                : flight.imageUri
              : require("../../../../assets/images/OIP.jpg")
          }
          style={styles.image}
        />

        <Text style={styles.title}>{flight.airline}</Text>
        <Text style={styles.subTitle}>Flight: {flight.flightNumber ?? flight.flight_number}</Text>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>From:</Text>
          <Text style={styles.detailValue}>{flight.departure}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>To:</Text>
          <Text style={styles.detailValue}>{flight.arrival}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{flight.date}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>Time:</Text>
          <Text style={styles.detailValue}>{flight.time}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>Class:</Text>
          <Text style={styles.detailValue}>
            {flight.isFirstClass ? "First Class" : "Economy"}
          </Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>Seats left:</Text>
          <Text style={styles.detailValue}>{flight.seatsAvailable ?? flight.seats_available ?? 0}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>Price (each):</Text>
          <Text style={styles.price}>${flight.price}</Text>
        </View>

        <View style={[styles.detailsContainer, { alignItems: 'center' }] }>
          <Text style={styles.detailLabel}>Passengers:</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity onPress={() => setPassengers(Math.max(1, passengers - 1))} style={styles.qtyBtn}><Text style={styles.qtyText}>-</Text></TouchableOpacity>
            <Text style={styles.detailValue}>{passengers}</Text>
            <TouchableOpacity onPress={() => setPassengers(Math.min(Number(flight.seatsAvailable ?? flight.seats_available ?? 1), passengers + 1))} style={styles.qtyBtn}><Text style={styles.qtyText}>+</Text></TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.bookButton} onPress={handleBook} disabled={passengers < 1 || passengers > (Number(flight.seatsAvailable ?? flight.seats_available ?? 0))}>
          <Text style={styles.bookText}>Book {passengers} {passengers>1?'Seats':'Seat'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/screens/User/SearchScreen')}
        >
          <Text style={styles.backText}>Back to Search</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0A1A2F",
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFD700",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0A1A2F",
  },
  subTitle: {
    color: "#555",
    fontSize: 16,
    marginBottom: 10,
  },
  detailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginVertical: 4,
  },
  detailLabel: {
    color: "#0A1A2F",
    fontWeight: "600",
  },
  detailValue: {
    color: "#444",
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#D4AF37",
  },
  bookButton: {
    backgroundColor: "#FFD700",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 20,
  },
  bookText: {
    color: "#0A1A2F",
    fontSize: 18,
    fontWeight: "bold",
  },
  qtyBtn: {
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  qtyText: {
    color: '#0A1A2F',
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 15,
  },
  backText: {
    color: "#FFD700",
    fontWeight: "bold",
  },
});
