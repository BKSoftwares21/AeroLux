import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import UserModal from './UserModal';
export default function HomeScreen() {

  const [modalVisible, setModalVisible] = useState(false);
  const [userName] = useState('User'); // replace with real user from auth when available

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
        

        {/* Decorative Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userName[0]}</Text>
          </View>
          <View style={styles.welcomeTextWrapper}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{userName} ✨</Text>
            <Text style={styles.subtitle}>Find the best deals for your next trip.</Text>
          </View>
        </View>

        {/* Offer Card */}
        <View style={styles.offerCard}>
          <Image 
            source={require('../../../../assets/images/destination.jpg')} 
            style={styles.offerImage} 
          />
          <View style={styles.offerContent}>

            <Text style={styles.offerTitle}>The Bahamas, America</Text>
            <Text style={styles.offerDetails}>5 Days, 4 Nights</Text>
            <Text style={styles.offerPrice}>
              $899 
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/screens/User/SearchScreen')}style={styles.offerButton}>
              <Text style={styles.offerButtonText}>SEE MORE LOCATIONS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <Ionicons name="home" size={26} color="#D4AF37" />
         <TouchableOpacity onPress={() => router.push('./SearchScreen')}>
          <Ionicons name="search" size={26} color="#0A1A2F"  />
          </TouchableOpacity>
         <TouchableOpacity onPress={() => router.push('./PaymentHistory')}>
           <Ionicons name="card" size={26} color="#0A1A2F" />
     </TouchableOpacity>
     <TouchableOpacity onPress={() => router.push('./BookingHistory')}>
        <Ionicons name="clipboard" size={26} color="#0A1A2F" />
      </TouchableOpacity>
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
  navItem: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
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

  /* New welcome card styles */
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12233B',
    marginHorizontal: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#0A1A2F',
    fontWeight: 'bold',
    fontSize: 28,
  },
  welcomeTextWrapper: {
    flex: 1,
  },
  greeting: {
    color: '#9FB4D6',
    fontSize: 14,
  },
  userName: {
    color: '#FFD700',
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 2,
  },
  subtitle: {
    color: '#B9CFE6',
    fontSize: 13,
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
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 28,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
});
