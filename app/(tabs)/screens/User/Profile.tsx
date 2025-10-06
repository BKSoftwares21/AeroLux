import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function UserProfileScreen() {
  const [name, setName] = useState("Benita Kazadi");
  const [email, setEmail] = useState("benita@example.com");
  const [phone, setPhone] = useState("+267 712 3456");

  const handleSave = () => {
    Alert.alert("Profile Updated", "Your details have been successfully updated!");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>My Profile</Text>

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
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        placeholderTextColor="#ccc"
        value={phone}
        onChangeText={setPhone}
      />

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Ionicons name="save-outline" size={20} color="#0A1A2F" />
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton}>
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
  header: {
    color: "#FFD700",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
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
