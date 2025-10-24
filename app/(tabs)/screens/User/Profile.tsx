import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, Stack } from "expo-router";
import React, { useState, useEffect } from "react";
import { Alert, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { session } from "../../../store/session";

export default function UserProfileScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [showPicker, setShowPicker] = useState(false);
  const [idOrPassport, setIdOrPassport] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const user = session.user || await session.refreshProfile();
      
      if (user) {
        setName(user.full_name || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
        setIdOrPassport(user.id_or_passport || "");
        
        // Parse date of birth
        if (user.date_of_birth) {
          const parsedDate = new Date(user.date_of_birth);
          if (!isNaN(parsedDate.getTime())) {
            setDob(parsedDate);
          }
        }
      } else {
        Alert.alert("Error", "Please log in to view your profile", [
          { text: "OK", onPress: () => router.replace("/auth/login") }
        ]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session.user) {
      Alert.alert("Error", "Please log in to update your profile");
      return;
    }

    try {
      setSaving(true);
      
      const updates = {
        full_name: name.trim(),
        phone: phone.trim() || null,
        date_of_birth: dob ? dob.toISOString().split('T')[0] : null,
        id_or_passport: idOrPassport.trim() || null,
      };

      await session.updateProfile(updates);
      Alert.alert("Success", "Your profile has been updated successfully!");
      
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: () => {
            session.logout();
            router.replace("/auth/login");
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={{ color: '#FFD700', marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.push("/screens/User/Homescreen")}>
          <Ionicons name="arrow-back" size={28} color="#FFD700" />
        </TouchableOpacity>
        <Text style={styles.header}>My Profile</Text>
        <View style={{ width: 28 }} /> {/* Placeholder for alignment */}
      </View>

      {/* Profile Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../../../../assets/images/user-placeholder.jpg")}
          style={styles.profileImage}
        />
        <TouchableOpacity style={styles.editIcon}>
          <Ionicons name="camera" size={20} color="#FFD700" />
        </TouchableOpacity>
      </View>

      {/* Input Fields */}
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#ccc"
        value={name}
        onChangeText={setName}
        editable={!saving}
      />
      <TextInput
        style={[styles.input, { opacity: 0.5 }]}
        placeholder="Email"
        placeholderTextColor="#ccc"
        value={email}
        editable={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#ccc"
        value={phone}
        onChangeText={setPhone}
        editable={!saving}
      />

      {/* Date of Birth */}
      {Platform.OS === "web" ? (
        <TextInput
          style={styles.input}
          placeholder="Date of Birth (YYYY-MM-DD)"
          placeholderTextColor="#ccc"
          value={dob ? dob.toISOString().slice(0, 10) : ""}
          onChangeText={text => {
            const parsed = new Date(text);
            if (!isNaN(parsed.getTime())) setDob(parsed);
          }}
        />
      ) : (
        <>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.8}
          >
            <Text style={{ color: dob ? "#fff" : "#ccc" }}>
              {dob ? dob.toLocaleDateString() : "Date of Birth (Tap to select)"}
            </Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={dob || new Date(2000, 0, 1)}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) setDob(selectedDate);
              }}
            />
          )}
        </>
      )}

      {/* ID or Passport Number */}
      <TextInput
        style={styles.input}
        placeholder="ID or Passport Number"
        placeholderTextColor="#ccc"
        value={idOrPassport}
        onChangeText={setIdOrPassport}
        editable={!saving}
      />

      {/* Save Button */}
      <TouchableOpacity 
        style={[styles.saveButton, saving && { opacity: 0.5 }]} 
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#0A1A2F" />
        ) : (
          <Ionicons name="save-outline" size={20} color="#0A1A2F" />
        )}
        <Text style={styles.saveText}>{saving ? "Saving..." : "Save Changes"}</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FFD700" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1A2F",
    padding: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    justifyContent: "space-between",
  },
  header: {
    color: "#FFD700",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  imageContainer: {
    alignItems: "center",
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  editIcon: {
    position: "absolute",
    bottom: 5,
    right: "40%",
    backgroundColor: "#0A1A2F",
    padding: 6,
    borderRadius: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#FFD700",
    color: "#FFFFFF",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  saveButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFD700",
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 10,
  },
  saveText: {
    color: "#0A1A2F",
    fontWeight: "bold",
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },
  logoutText: {
    color: "#FFD700",
    fontWeight: "bold",
    marginLeft: 8,
  },
});