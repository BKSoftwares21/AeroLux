import { router, Stack } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignup = () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Later: send API request to backend to create user
    console.log({ name, email, password, role: "user" });

    // Redirect to User Home after signup
    router.push("../screens/User/Homescreen");
  };

  const handleLoginRedirect = () => {
    router.push("../screens/Auth/Login");
  };

  return (
    <View style={styles.container}>
      {/* Hide Expo Router default header */}
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.logoContainer}>
        <Image
          source={require("../../../../assets/images/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Create Account</Text>

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
        placeholder="Password"
        placeholderTextColor="#ccc"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#ccc"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
        <Text style={styles.signupText}>SIGN UP</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLoginRedirect} style={styles.loginRedirect}>
        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.loginLink}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#0A1A2F",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#FFFFFF",
    color: "#FFFFFF",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  signupButton: {
    backgroundColor: "#D4AF37",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  signupText: {
    color: "#0A1A2F",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginRedirect: {
    marginTop: 20,
    alignItems: "center",
  },
  loginText: {
    color: "#FFFFFF",
  },
  loginLink: {
    color: "#D4AF37",
    fontWeight: "bold",
  },
});
