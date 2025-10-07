import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, router } from 'expo-router';
import React, { useState } from "react";
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const notifications = [
  {
    id: "1",
    title: "Booking Confirmed",
    message: "Your flight to Paris has been confirmed. Check your email for details.",
    date: "2025-10-01",
    read: false,
  },
  {
    id: "2",
    title: "Limited Time Offer",
    message: "Get 20% off on your next booking to the Bahamas!",
    date: "2025-09-28",
    read: true,
  },
  {
    id: "3",
    title: "Payment Received",
    message: "Your payment for Hotel Booking has been received.",
    date: "2025-09-15",
    read: true,
  },
];

export default function Notifications() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <SafeAreaView style={styles.container}>
           <Stack.Screen options={{ headerShown: false }} />
        {/* Top Navigation */}
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.push("/screens/User/Homescreen")}>
            <Ionicons name="arrow-back" size={28} color="#D4AF37" />
          </TouchableOpacity>
          <Image
            source={require("../../../../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.appName}>Aerolux</Text>
        </View>

        <Text style={styles.title}>Notifications</Text>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.card, item.read ? styles.read : styles.unread]}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMessage}>{item.message}</Text>
              <Text style={styles.cardDate}>{item.date}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No notifications found.</Text>
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      </SafeAreaView>

      {/* User Modal (optional, remove if not needed on this page) */}
      {/* <UserModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <Text style={{ color: "#0A1A2F", fontSize: 18, textAlign: "center" }}>
          Profile or settings go here!
        </Text>
      </UserModal> */}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1A2F",
    padding: 20,
  },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
    marginLeft: 16,
  },
  appName: {
    color: "#D4AF37",
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginLeft: -40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: "#D4AF37",
  },
  read: {
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  cardTitle: {
    color: "#D4AF37",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  cardMessage: {
    color: "#FFFFFF",
    fontSize: 15,
    marginBottom: 4,
  },
  cardDate: {
    color: "#ccc",
    fontSize: 13,
    textAlign: "right",
  },
  emptyText: {
    color: "#ccc",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
});