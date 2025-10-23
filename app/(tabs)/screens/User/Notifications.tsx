import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack, router } from 'expo-router';
import React, { useEffect, useState } from "react";
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { api } from "../../../services/api";
import { session } from "../../../store/session";

type Noti = { id: number; title: string; body: string; is_read: 0 | 1; created_at: string };

export default function Notifications() {
  const [items, setItems] = useState<Noti[]>([]);

  useEffect(() => {
    const run = async () => {
      const email = session.user?.email;
      if (!email) return;
      const { notifications } = await api.getNotifications({ email });
      setItems(notifications);
    };
    run();
  }, []);

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
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={[styles.card, item.is_read ? styles.read : styles.unread]}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMessage}>{item.body}</Text>
              <Text style={styles.cardDate}>{new Date(item.created_at).toLocaleString()}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No notifications found.</Text>
          }
          contentContainerStyle={{ paddingBottom: 80 }}
        />
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