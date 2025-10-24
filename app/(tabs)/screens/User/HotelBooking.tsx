import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HotelBookingScreen({ route }: any) {
  const params = useLocalSearchParams<{ type?: string; payload?: string }>();
  let parsed: any = null;
  if (params?.payload && typeof params.payload === 'string') {
    try { parsed = JSON.parse(params.payload); } catch {}
  }
  const hotel = parsed || route?.params?.hotel || {
    name: "Ocean View Resort",
    location: "The Bahamas",
    description: "Relax and unwind at our luxurious seaside resort.",
    pricePerNight: 300,
    rating: 5,
    bedType: "King",
    imageUri: require("../../../../assets/images/hotel-sample.jpg"),
  };

  const handleBook = () => {
    router.push({
      pathname: "../screens/User/PaymentScreen",
      params: {
        bookingType: "Hotel",
        name: hotel.name,
        details: `${hotel.location} - ${hotel.bedType} Bed`,
        price: hotel.pricePerNight,
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.header}>Hotel Details</Text>

      <View style={styles.card}>
        <Image
          source={
            hotel.imageUri
              ? typeof hotel.imageUri === "string"
                ? { uri: hotel.imageUri }
                : hotel.imageUri
              : require("../../../../assets/images/hotel-placeholder.jpg")
          }
          style={styles.image}
        />

        <Text style={styles.title}>{hotel.name}</Text>
        <Text style={styles.subTitle}>{hotel.location || (hotel.city && hotel.country ? `${hotel.city}, ${hotel.country}` : '')}</Text>

        <View style={styles.separator} />

        {hotel.description ? (
          <Text style={styles.description}>{hotel.description}</Text>
        ) : null}

        {hotel.bedType ? (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailLabel}>Bed Type:</Text>
            <Text style={styles.detailValue}>{hotel.bedType}</Text>
          </View>
        ) : null}

        {hotel.rating || hotel.star_rating ? (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailLabel}>Rating:</Text>
            <Text style={styles.detailValue}>⭐ {hotel.rating ?? hotel.star_rating}</Text>
          </View>
        ) : null}

        {hotel.pricePerNight ? (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailLabel}>Price per Night:</Text>
            <Text style={styles.price}>${hotel.pricePerNight}</Text>
          </View>
        ) : null}

        <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
          <Text style={styles.bookText}>Book Now</Text>
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#0A1A2F",
    textAlign: "center",
  },
  subTitle: {
    color: "#555",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  separator: {
    width: "80%",
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 10,
  },
  description: {
    fontSize: 15,
    color: "#333",
    textAlign: "center",
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
    fontWeight: "bold",
    fontSize: 16,
  },
  backButton: {
    marginTop: 15,
  },
  backText: {
    color: "#FFD700",
    fontWeight: "bold",
  },
});
