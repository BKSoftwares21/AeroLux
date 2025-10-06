import { router, Stack } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Login() {
  const [role, setRole] = useState<"user" | "admin">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (role === "user") {
      router.push("../screens/User/Homescreen");
    } else if (role === "admin") {
      router.push("../screens/Admin/AdminDashboardScreen");
    }
  };

  const handleSignup = () => {
    router.push("../screens/Auth/Signup");
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

      <Text style={styles.title}>AeroLux Login</Text>

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

      <View style={styles.roleSwitch}>
        <TouchableOpacity
          style={[styles.roleButton, role === "user" && styles.activeRole]}
          onPress={() => setRole("user")}
        >
          <Text style={styles.roleText}>User</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, role === "admin" && styles.activeRole]}
          onPress={() => setRole("admin")}
        >
          <Text style={styles.roleText}>Admin</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>LOGIN</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => alert('Password reset link will be sent to your email')} style={styles.forgotPasswordContainer}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('../Signup')} style={styles.signupContainer}>
        <Text style={styles.signupText}>
          Don't have an account? <Text style={styles.signupLink}>Sign Up</Text>
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
  roleSwitch: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 25,
  },
  roleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  activeRole: {
    backgroundColor: "#D4AF37",
    borderColor: "#D4AF37",
  },
  roleText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  loginButton: {
    backgroundColor: "#D4AF37",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  loginText: {
    color: "#0A1A2F",
    fontSize: 18,
    fontWeight: "bold",
  },
  forgotPasswordContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#D4AF37",
    fontSize: 14,
  },
  signupContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  signupText: {
    color: "#FFFFFF",
  },
  signupLink: {
    color: "#D4AF37",
    fontWeight: "bold",
  },
});
