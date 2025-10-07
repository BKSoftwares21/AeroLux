// screens/Admin/AdminHome.tsx
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AdminModal from "./AdminModal";

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.container}>
        {/* Top Nav */}
        <View style={styles.topNav}>
          <Image 
            source={require('../../../../assets/images/logo.png')} 
            style={styles.logo} 
          />
          <Text style={styles.appName}>Aerolux</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="menu" size={28} color="#D4AF37" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title}>Admin Dashboard</Text>

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
      </SafeAreaView>

      {/* Admin Modal */}
      <AdminModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1A2F",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#fff",
    textAlign: "center", // optional, if you want title centered too
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
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
