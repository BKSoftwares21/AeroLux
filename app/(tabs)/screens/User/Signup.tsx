import DateTimePicker from "@react-native-community/datetimepicker";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { api } from "../../../services/api";
import { session } from "../../../store/session";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [showPicker, setShowPicker] = useState(false);
  const [idOrPassport, setIdOrPassport] = useState("");
  const [loading, setLoading] = useState(false);

  const getAge = (date: Date) => {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    return age;
  };

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Please fill in name, email and password.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match!");
      return;
    }
    if (!dob) {
      Alert.alert("Please select your Date of Birth.");
      return;
    }
    if (getAge(dob) < 18) {
      Alert.alert("You must be at least 18 years old to sign up.");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Please enter your Phone Number.");
      return;
    }
    if (!idOrPassport.trim()) {
      Alert.alert("Please enter your ID or Passport Number.");
      return;
    }
    try {
      setLoading(true);
      const { user } = await api.signup({ 
        email: email.trim(), 
        password, 
        full_name: name.trim(), 
        phone: phone.trim() || undefined,
        date_of_birth: dob ? dob.toISOString().slice(0,10) : undefined,
        id_or_passport: idOrPassport.trim() || undefined,
      });
      session.setUser(user);
      router.push("/screens/User/Homescreen");
    } catch (e: any) {
      Alert.alert(e.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    router.push("/screens/Auth/Login");
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
      {Platform.OS === "web" ? (
        <TextInput
          style={styles.input}
          placeholder="Date of Birth (YYYY-MM-DD)"
          placeholderTextColor="#ccc"
          value={dob ? dob.toISOString().slice(0, 10) : ""}
          onChangeText={(text) => {
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
              {dob
                ? dob.toLocaleDateString()
                : "Date of Birth (Tap to select)"}
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
       <TextInput
        style={styles.input}
        placeholder="ID or Passport Number"
        placeholderTextColor="#ccc"
        value={idOrPassport}
        onChangeText={setIdOrPassport}
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

      <TouchableOpacity style={styles.signupButton} onPress={handleSignup} disabled={loading}>
        <Text style={styles.signupText}>{loading ? '...' : 'SIGN UP'}</Text>
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
