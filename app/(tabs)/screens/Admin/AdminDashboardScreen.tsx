// screens/Admin/AdminHome.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AdminLayout from "../../../../components/AdminLayout";

export default function AdminDashboardScreen() {
  const router = useRouter();

  return (
    <AdminLayout>
      {/* Options Wrapper (centered) */}
      <View style={styles.optionsWrapper}>
        {/* Users Management */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("./Users")}
        >
          <Ionicons name="people" size={30} color="#D4AF37" />
          <Text style={styles.cardText}>Manage Users</Text>
        </TouchableOpacity>

        {/* Hotels Management */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("./Hotel")}
        >
          <Ionicons name="business" size={30} color="#D4AF37" />
          <Text style={styles.cardText}>Manage Hotels</Text>
        </TouchableOpacity>

        {/* Flights Management */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("./Flight")}
        >
          <Ionicons name="airplane" size={30} color="#D4AF37" />
          <Text style={styles.cardText}>Manage Flights</Text>
        </TouchableOpacity>

        {/* Bookings Management */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("./Bookings")}
        >
          <Ionicons name="clipboard" size={30} color="#D4AF37" />
          <Text style={styles.cardText}>Manage Bookings</Text>
        </TouchableOpacity>

         {/*Payments Option */}
         <TouchableOpacity
          style={styles.card}
          onPress={() => router.push("./Payments")}
        >
          <Ionicons name="clipboard" size={30} color="#D4AF37" />
          <Text style={styles.cardText}>Manage Payments</Text>
        </TouchableOpacity>
      
      </View>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1A2F",
  },
  optionsWrapper: {
    alignItems: "center", // this centers only the cards horizontally
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 12,
    width: "90%",
    marginBottom: 15,
    elevation: 2,
  },
  cardText: {
    fontSize: 18,
    marginLeft: 15,
    color: "#000",
  },
  // Top nav, logo, and title are now handled by AdminLayout
});
