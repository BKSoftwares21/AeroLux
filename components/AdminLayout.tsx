import React, { useState } from "react";
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import AdminModal from "../app/(tabs)/screens/Admin/AdminModal";

interface AdminLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
}

export default function AdminLayout({ children, showBackButton = true }: AdminLayoutProps) {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.container}>
        {/* Top Nav */}
        <View style={styles.topNav}>
          <Image source={require("../assets/images/logo.png")} style={styles.logo} />
          <Text style={styles.appName}>Aerolux</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="menu" size={28} color="#D4AF37" />
          </TouchableOpacity>
        </View>

        {/* Page Content */}
        <View style={styles.content}>{children}</View>

        {/* Bottom Back Button */}
        {showBackButton && (
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={20} color="#0A1A2F" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      {/* Global Admin Modal */}
      <AdminModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1A2F",
  },
  topNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  content: {
    flex: 1,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
    backgroundColor: "#0A1A2F",
  },
  backButton: {
    backgroundColor: "#D4AF37",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  backText: {
    color: "#0A1A2F",
    fontWeight: "bold",
    marginLeft: 8,
  },
});
