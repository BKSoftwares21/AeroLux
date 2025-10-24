import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../../../services/api";
import { session } from "../../../store/session";
import UserModal from "./UserModal";

type PaymentItem = {
  id: string;
  date: string;
  amount: number;
  method?: string;
  status: string;
  description?: string;
};

export default function PaymentHistory() {
  const [modalVisible, setModalVisible] = useState(false);
  const [items, setItems] = useState<PaymentItem[]>([]);

  useEffect(() => {
    const run = async () => {
      const userId = session.user?.id;
      if (!userId) return;
      const { payments } = await api.getUserPayments(userId);
      const mapped = (payments || []).map((p: any) => ({
        id: String(p.id),
        date: new Date(p.createdAt || Date.now()).toISOString().slice(0,10),
        amount: Number(p.amount),
        method: p.method || 'CARD',
        status: String(p.status).toUpperCase() === 'PAID' ? 'Completed' : String(p.status).charAt(0).toUpperCase() + String(p.status).slice(1),
        description: p.booking?.description,
      }));
      setItems(mapped);
    };
    run();
  }, []);

  return (
    <>
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />

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

        <Text style={styles.title}>Payment History</Text>
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
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
                <Text style={styles.label}>Method:</Text>
                <Text style={styles.value}>{item.method}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Status:</Text>
                <Text
                  style={[
                    styles.value,
                    item.status === "Completed" ? styles.completed : styles.refunded,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
              {item.description ? (
                <View style={styles.row}>
                  <Text style={styles.label}>Description:</Text>
                  <Text style={styles.value}>{item.description}</Text>
                </View>
              ) : null}
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No payment history found.</Text>
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />

        {/* Bottom Navigation - updated layout */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/screens/User/Homescreen")}>
            <Ionicons name="home" size={26} color="#0A1A2F" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/screens/User/SearchScreen")}>
            <Ionicons name="search" size={26} color="#0A1A2F" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/screens/User/PaymentHistory")}>
            <Ionicons name="card" size={26} color="#D4AF37" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push("/screens/User/BookingHistory")}>
            <Ionicons name="clipboard" size={26} color="#0A1A2F" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* User Modal */}
      <UserModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <Text style={{ color: "#0A1A2F", fontSize: 18, textAlign: "center" }}>
          Profile or settings go here!
        </Text>
      </UserModal>
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
    marginBottom: 10,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: "contain",
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
  },
  completed: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  refunded: {
    color: "#F44336",
    fontWeight: "bold",
  },
  emptyText: {
    color: "#ccc",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },

  /* Bottom nav styles updated */
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