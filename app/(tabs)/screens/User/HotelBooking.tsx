import { router } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HotelDetailsScreen({ route }: any) {
  const { hotel } = route?.params || {
    hotel: {
      name: "Ocean View Resort",
      location: "The Bahamas",
      description: "Relax and unwind at our luxurious seaside resort.",
      pricePerNight: 300,
      rating: 5,
      bedType: "King",
      imageUri: require("../../../../assets/images/hotel-sample.jpg"),
    },
  };

  const handleBook = () => {
    router.push({
      pathname: "../screens/User/PaymentScreen",
      params: { hotelName: hotel.name, price: hotel.pricePerNight },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Hotel Details</Text>

      {/* Hotel Card */}
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
        <Text style={styles.subTitle}>{hotel.location}</Text>

        <View style={styles.separator} />

        <Text style={styles.description}>{hotel.description}</Text>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>Bed Type:</Text>
          <Text style={styles.detailValue}>{hotel.bedType}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>Rating:</Text>
          <Text style={styles.detailValue}>⭐ {hotel.rating}</Text>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>Price per Night:</Text>
          <Text style={styles.price}>${hotel.pricePerNight}</Text>
        </View>

        {/* Buttons */}
        <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
          <Text style={styles.bookText}>Book Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push("../screens/User/SearchScreen")}
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
