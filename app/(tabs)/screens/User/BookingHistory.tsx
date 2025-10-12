import Ionicons from "@expo/vector-icons/Ionicons";
import { Stack } from "expo-router";
import React, { useState } from "react";
import { FlatList, Image, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import UserModal from "./UserModal"; // Make sure this path is correct for your project

const bookings = [
    {
        id: "1",
        date: "2025-10-01",
        amount: 299.99,
        status: "Completed",
        description: "Flight to Paris",
    },
    {
        id: "2",
        date: "2025-09-15",
        amount: 120.0,
        status: "Completed",
        description: "Hotel Booking",
    },
    {       id: "3",
        date: "2025-08-20",
        amount: 450.5,
        status: "Cancelled",
        description: "Flight to New York",
    },
];          
export default function BookingHistory() 
{
    const [modalVisible, setModalVisible] = useState(false);
    
    return (
        <>
            <SafeAreaView style={styles.container}></SafeAreaView>
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
                <Text style={styles.title}>Booking History</Text>
                <FlatList
                    data={bookings}

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
                                <Text style={styles.label}>Status:</Text>
                                <Text style={styles.value}>{item.status}</Text>
                            </View>
                            <View style={styles.row}>
                                <Text style={styles.label}>Description:</Text>
                                <Text style={styles.value}>{item.description}</Text>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No bookings found.</Text>
                    }
                />
            {/* Modal Component */}
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
        padding: 20,
    },
    logo: { width: 50, height: 50 },
    appName: {  
        fontSize: 20,
        fontWeight: "bold", 
        color: "#ffffff",
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
    emptyText: {
        color: "#FFFFFF",
        textAlign: "center",
        marginTop: 20,
        fontSize: 16,
    },
});