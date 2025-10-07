// screens/Search.tsx
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import UserModal from './UserModal';
export default function Search() {

    const [modalVisible, setModalVisible] = useState(false);

  const data = [
    { id: "1", name: "Hotel BlueSky", location: "Cape Town" },
    { id: "2", name: "Safari Lodge", location: "Kruger Park" },
    { id: "3", name: "City View Apartments", location: "Johannesburg" },
  ];

  return (
    <> 
      <Stack.Screen options={{ headerShown: false }}/>
      <SafeAreaView style={styles.container}>
        
        {/* Top Navigation */}
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

        <Text style={styles.title}>Search</Text>

        {/* Search Input with Icon */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#0A1A2F" style={styles.icon} />
          <TextInput
            placeholder="Search hotels, flights, or packages"
            style={styles.input}
          />
        </View>

        {/* Results List */}
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>{item.location}</Text>
            </View>
          )}
        />

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={() => router.push('./Homescreen')}>
            <Ionicons name="home" size={26} color="#0A1A2F" />
          </TouchableOpacity>
          <Ionicons name="search" size={26} color="#D4AF37" />
          <Ionicons name="heart" size={26} color="#0A1A2F" />
          <Ionicons name="person" size={26} color="#0A1A2F" />
        </View>
          
      </SafeAreaView>
<UserModal visible={modalVisible} onClose={() => setModalVisible(false)}>
          <Text style={{ color: "#0A1A2F", fontSize: 18, textAlign: "center" }}>
            Profile or settings go here!
          </Text>
        </UserModal>

    </>
  );
}

// CSS theme
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1A2F",
    padding: 20,
  },
    header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    color: '#D4AF37'
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  bottomNav: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  logo: {
    width: 50,
    height: 50,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
