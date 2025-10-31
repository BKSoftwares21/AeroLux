// screens/Search.tsx
import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { api, type Hotel, type Flight } from "../../../services/api";
import UserModal from './UserModal';
export default function Search() {

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [available, setAvailable] = useState(false);
  type SearchItem = ({ __type: 'hotel' } & Hotel) | ({ __type: 'flight' } & Flight);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'both'|'hotels'|'flights'>('both');

  const runSearch = useCallback(async () => {
    try {
      setLoading(true);
      const items: SearchItem[] = [] as any;
      if (mode === 'both' || mode === 'hotels') {
        const { hotels } = await api.searchHotels({ name, city, available: available ? 1 : undefined });
        items.push(...(hotels || []).map((h: any) => ({ __type: 'hotel', ...h })));
      }
      if (mode === 'both' || mode === 'flights') {
        const q = name || city || undefined;
        const { flights } = await api.searchFlights({ q, departure: city || undefined });
        const mapped = (flights || []).map((f: any) => ({
          __type: 'flight',
          id: f.id,
          flight_number: f.flightNumber || f.flight_number,
          airline: f.airline,
          departure: f.departure,
          arrival: f.arrival,
          date: new Date(f.date).toISOString().slice(0,10),
          time: f.time,
          price: Number(f.price),
          image_url: f.imageUrl || f.image_url,
          is_first_class: f.isFirstClass ?? f.is_first_class,
          capacity: Number(f.capacity ?? 0),
          seats_available: Number(f.seatsAvailable ?? f.seats_available ?? 0),
        }));
        items.push(...mapped as any);
      }
      setResults(items);
    } catch {
      // noop
    } finally {
      setLoading(false);
    }
  }, [name, city, available, mode]);

  useEffect(() => { runSearch(); }, [runSearch]);

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

        {/* Mode toggle */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
          <TouchableOpacity onPress={() => setMode('both')} style={[styles.pill, mode==='both' && styles.pillActive]}>
            <Text style={[styles.pillText, mode==='both' && styles.pillTextActive]}>Both</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMode('hotels')} style={[styles.pill, mode==='hotels' && styles.pillActive]}>
            <Text style={[styles.pillText, mode==='hotels' && styles.pillTextActive]}>Hotels</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMode('flights')} style={[styles.pill, mode==='flights' && styles.pillActive]}>
            <Text style={[styles.pillText, mode==='flights' && styles.pillTextActive]}>Flights</Text>
          </TouchableOpacity>
        </View>

        {/* Search Inputs */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#0A1A2F" style={styles.icon} />
          <TextInput
            placeholder="Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.searchContainer}>
          <Ionicons name="location" size={20} color="#0A1A2F" style={styles.icon} />
          <TextInput
            placeholder="City"
            style={styles.input}
            value={city}
            onChangeText={setCity}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <TouchableOpacity onPress={() => setAvailable(!available)} style={{ marginRight: 10 }}>
            <Ionicons name={available ? 'checkbox' : 'square-outline'} size={22} color="#D4AF37" />
          </TouchableOpacity>
          <Text style={{ color: '#fff' }}>Only show hotels with available rooms</Text>
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={runSearch}>
          <Text style={styles.searchButtonText}>{loading ? 'Searching...' : 'Search'}</Text>
        </TouchableOpacity>

        {/* Results List */}
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.__type}-${item.id}`}
          renderItem={({ item }) => {
            const onPress = () => {
              if (item.__type === 'hotel') {
                const payload = JSON.stringify({
                  name: (item as any).name,
                  location: `${(item as any).city}, ${(item as any).country}`,
                  description: (item as any).description || '',
                  rating: (item as any).star_rating ?? (item as any).starRating ?? undefined,
                  // image url (column or amenities fallback)
                  imageUri: (item as any).image_url || (item as any).amenities?.imageUrl || undefined,
                });
                router.push({ pathname: '/(tabs)/screens/User/HotelBooking', params: { type: 'hotel', payload } });
              } else {
                const payload = JSON.stringify({
                  id: (item as any).id,
                  flightNumber: (item as any).flight_number,
                  airline: (item as any).airline,
                  departure: (item as any).departure,
                  arrival: (item as any).arrival,
                  date: (item as any).date,
                  time: (item as any).time,
                  price: (item as any).price,
                  imageUri: (item as any).image_url || undefined,
                  isFirstClass: (item as any).is_first_class ?? false,
                  seatsAvailable: (item as any).seats_available ?? 0,
                });
                router.push({ pathname: '/(tabs)/screens/User/FlightBooking', params: { type: 'flight', payload } });
              }
            };
            return (
              <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
                <View style={styles.card}>
                  {item.__type === 'hotel' ? (
                    <>
                      <Text style={styles.cardTitle}>{(item as any).name}</Text>
                      <Text style={styles.cardSubtitle}>{(item as any).city}, {(item as any).country}</Text>
                      {(item as any).description ? <Text style={styles.cardSubtitle}>{(item as any).description}</Text> : null}
                    </>
                  ) : (
                    <>
                      <Text style={styles.cardTitle}>{(item as any).airline} • {(item as any).flight_number}</Text>
                      <Text style={styles.cardSubtitle}>{(item as any).departure} → {(item as any).arrival}</Text>
                      <Text style={styles.cardSubtitle}>{(item as any).date}{(item as any).time ? ` at ${(item as any).time}` : ''} • ${(item as any).price} • Seats left: {(item as any).seats_available ?? 0}</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/screens/User/Homescreen')}>
            <Ionicons name="home" size={26} color="#0A1A2F" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/screens/User/SearchScreen')}>
            <Ionicons name="search" size={26} color="#D4AF37" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/screens/User/PaymentHistory')}>
            <Ionicons name="card" size={26} color="#0A1A2F" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/screens/User/BookingHistory')}>
            <Ionicons name="clipboard" size={26} color="#0A1A2F" />
          </TouchableOpacity>
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
  searchButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  searchButtonText: {
    color: '#0A1A2F',
    fontWeight: 'bold',
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
  pill: {
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  pillActive: {
    backgroundColor: '#D4AF37',
  },
  pillText: {
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  pillTextActive: {
    color: '#0A1A2F',
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
});
