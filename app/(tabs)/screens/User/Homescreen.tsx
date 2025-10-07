import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import UserModal from './UserModal';
export default function HomeScreen() {

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      {/* Hide the default Expo Router header */}
      <Stack.Screen options={{ headerShown: false }} />

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
        

        {/* Welcome Message */}
        <Text style={styles.welcomeText}>Welcome Benita!</Text>

        {/* Offer Card */}
        <View style={styles.offerCard}>
          <Image 
            source={require('../../../../assets/images/destination.jpg')} 
            style={styles.offerImage} 
          />
          <View style={styles.offerContent}>
            <Text style={styles.offerLabel}>LIMITED TIME OFFER</Text>
            <Text style={styles.offerTitle}>The Bahamas, America</Text>
            <Text style={styles.offerDetails}>5 Days, 4 Nights</Text>
            <Text style={styles.offerPrice}>
              $899 <Text style={styles.offerDiscount}>-20%</Text>
            </Text>
            <TouchableOpacity style={styles.offerButton}>
              <Text style={styles.offerButtonText}>GET OFFER</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <Ionicons name="home" size={26} color="#D4AF37" />
         <TouchableOpacity onPress={() => router.push('./SearchScreen')}>
          <Ionicons name="search" size={26} color="#0A1A2F"  />
          </TouchableOpacity>
          <Ionicons name="heart" size={26} color="#0A1A2F" />
          <Ionicons name="person" size={26} color="#0A1A2F" />
        </View>

        {/* User Modal */}
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
    backgroundColor: '#0A1A2F',
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
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginLeft: 20,
    marginBottom: 20,
  },
  offerCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  offerImage: {
    width: '100%',
    height: 180,
    borderRadius: 15,
  },
  offerContent: {
    marginTop: 10,
  },
  offerLabel: {
    color: '#D4AF37',
    fontWeight: 'bold',
    fontSize: 12,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  offerDetails: {
    fontSize: 14,
    color: '#666',
  },
  offerPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  offerDiscount: {
    color: 'red',
    fontSize: 16,
  },
  offerButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 15,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  offerButtonText: {
    fontWeight: 'bold',
    color: '#000',
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
});
