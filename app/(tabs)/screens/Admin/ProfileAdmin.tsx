import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import AdminLayout from "../../../../components/AdminLayout";
import { session } from "../../../store/session";

export default function ProfileAdmin() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [lastLogin, setLastLogin] = useState("");
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
        if (user.role !== 'admin') {
          Alert.alert("Access Denied", "You don't have admin privileges", [
            { text: "OK", onPress: () => router.replace("/") }
          ]);
          return;
        }
        
        setName(user.full_name || "");
        setEmail(user.email || "");
        setRole(user.role === 'admin' ? 'Administrator' : 'User');
        setLastLogin(user.last_login ? new Date(user.last_login).toLocaleString() : 'Never');
      } else {
        Alert.alert("Error", "Please log in to view your profile", [
          { text: "OK", onPress: () => router.replace("/(tabs)/screens/Auth/Login") }
        ]);
      }
    } catch {
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

    if (session.user.role !== 'admin') {
      Alert.alert("Error", "You don't have permission to update admin profiles");
      return;
    }

    try {
      setSaving(true);
      
      const updates = {
        full_name: name.trim(),
      };

      await session.updateProfile(updates);
      Alert.alert("Success", "Your admin profile has been updated successfully!");
      
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
            router.replace("/(tabs)/screens/Auth/Login");
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <AdminLayout>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={{ color: '#FFD700', marginTop: 10 }}>Loading profile...</Text>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
    <View style={styles.container}>
      {/* Header removed: global admin layout used across pages */}

      {/* Profile Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../../../../assets/images/admin-placeholder.jpg")}
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

      {/* Read-Only Fields */}
      <View style={styles.infoBox}>
        <Text style={styles.label}>Role:</Text>
        <Text style={styles.value}>{role}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Last Login:</Text>
        <Text style={styles.value}>{lastLogin}</Text>
      </View>

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
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A1A2F",
    padding: 20,
  },
  // header hidden across admin pages (handled by global layout)
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
  infoBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderColor: "#FFD700",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  label: {
    color: "#FFD700",
    fontWeight: "bold",
  },
  value: {
    color: "#FFFFFF",
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
