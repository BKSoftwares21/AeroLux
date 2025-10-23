import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, router } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { cancelBooking, useBookings } from "../../../store/bookingsStore";
import UserModal from "./UserModal"; // Make sure this path is correct for your project

export default function BookingHistory() {
  const [modalVisible, setModalVisible] = useState(false);
  const bookings = useBookings();
  // Simulate current user id; replace with real auth user id when available
  const currentUserId = "u1";
  const userBookings = useMemo(() => bookings.filter(b => b.userId === currentUserId), [bookings]);

  const canCancel = (b: any) => {
    const isCompletedAndPaid = b.status === "COMPLETED" && b.paymentStatus === "PAID";
    return !isCompletedAndPaid && b.status !== "CANCELLED";
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Top Navigation */}
        <View style={styles.topNav}>
          <Image
            source={require("../../../../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.appName}>Aerolux</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="menu" size={28} color="#D4AF37" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Booking History</Text>
        <FlatList
          data={userBookings}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const isCompletedAndPaid = item.status === "COMPLETED" && item.paymentStatus === "PAID";
            return (
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.label}>Date:</Text>
                  <Text style={styles.value}>{item.date}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Amount:</Text>
                  <Text style={styles.value}>${item.amount.toFixed(2)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Status:</Text>
                  <Text
                    style={[
                      styles.value,
                      isCompletedAndPaid
                        ? styles.completed
                        : item.status === "CANCELLED"
                        ? styles.cancelled
                        : styles.pending,
                    ]}
                  >
                    {isCompletedAndPaid ? "Completed" : item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Description:</Text>
                  <Text style={styles.value}>{item.description}</Text>
                </View>

                {canCancel(item) && (
                  <TouchableOpacity
                    onPress={() => cancelBooking(item.id)}
                    style={styles.cancelButton}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No bookings found.</Text>}
          contentContainerStyle={{ paddingBottom: 120 }}
        />

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/screens/User/Homescreen")}>
            <Ionicons name="home" size={26} color="#0A1A2F" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/screens/User/SearchScreen")}>
            <Ionicons name="search" size={26} color="#0A1A2F" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/screens/User/PaymentHistory")}>
            <Ionicons name="card" size={26} color="#0A1A2F" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/screens/User/BookingHistory")}>
            <Ionicons name="clipboard" size={26} color="#D4AF37" />
          </TouchableOpacity>
        </View>

        {/* Modal Component */}
        <UserModal visible={modalVisible} onClose={() => setModalVisible(false)}>
          <Text style={{ color: "#0A1A2F", fontSize: 18, textAlign: "center" }}>
            Profile or settings go here!
          </Text>
        </UserModal>
      </SafeAreaView>
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
        justifyContent: "space-between",
        padding: 20,
    },
    logo: { width: 50, height: 50 },
    appName: {  
        fontSize: 20,
        fontWeight: "bold", 
        color: "#D4AF37",
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
        marginBottom: 10,
    },
    row: {
        flexDirection: "row",
        marginBottom: 4,
    },
    label: {
        color: "#D4AF37",
        fontWeight: "bold",
        width: 100,
    },
    value: {
        color: "#FFFFFF",
        flex: 1,
        flexWrap: "wrap",
    },
    completed: {
        color: "#22C55E",
        fontWeight: "bold",
    },
    cancelled: {
        color: "#EF4444",
        fontWeight: "bold",
    },
    pending: {
        color: "#FACC15",
        fontWeight: "bold",
    },
    emptyText: {
        color: "#FFFFFF",
        textAlign: "center",
        marginTop: 20,
        fontSize: 16,
    },
    cancelButton: {
        marginTop: 12,
        backgroundColor: "#EF4444",
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    cancelButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },

    /* Bottom nav styles (added) */
    navItem: {
      width: 48,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    bottomNav: {
      position: "absolute",
      bottom: 20,
      left: 20,
      right: 20,
      height: 64,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#fff",
      paddingHorizontal: 28,
      borderRadius: 30,
      elevation: 6,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 6,
    },
});