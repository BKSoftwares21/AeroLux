import { router, Stack } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { api } from "../../../services/api";
import { session } from "../../../store/session";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const { user } = await api.login({ email: email.trim(), password });
      session.setUser(user);
      
      // Navigate based on user's actual role from the server
      if (user.role === "admin") {
        router.push("/(tabs)/screens/Admin/AdminDashboardScreen");
      } else {
        router.push("/(tabs)/screens/User/Homescreen");
      }
    } catch (e: any) {
      Alert.alert("Login Failed", e.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    router.push("/(tabs)/screens/User/Signup");
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
        autoCapitalize="none"
        keyboardType="email-address"
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

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
        <Text style={styles.loginText}>{loading ? '...' : 'LOGIN'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push('/(tabs)/screens/Auth/ForgotPassword')}
        style={styles.forgotPasswordContainer}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSignup} style={styles.signupContainer}>
        <Text style={styles.signupText}>
          Don&apos;t have an account? <Text style={styles.signupLink}>Sign Up</Text>
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