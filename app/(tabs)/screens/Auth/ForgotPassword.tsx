import { router, Stack } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { api } from "../../../services/api";
export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert("Please enter your email.");
      return;
    }
    try {
      setLoading(true);
      const res = await api.forgotPassword(email.trim());
      Alert.alert("A 6-digit code has been sent to your email.", res.test_code ? `Test code: ${res.test_code}` : undefined);
      setStep(2);
    } catch (e: any) {
      Alert.alert(e.message || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (code.length !== 6) {
      Alert.alert("Please enter the 6-digit code.");
      return;
    }
    if (!newPassword || !confirmPassword) {
      Alert.alert("Please enter and confirm your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords do not match.");
      return;
    }
    try {
      setLoading(true);
      await api.resetPassword({ email: email.trim(), code, new_password: newPassword });
      Alert.alert("Password changed successfully!");
      router.push("./Login");
    } catch (e: any) {
      Alert.alert(e.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
      <Text style={styles.title}>Forgot Password</Text>
      {step === 1 ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#ccc"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.button} onPress={handleSendCode} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? '...' : 'Send Code'}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit code"
            placeholderTextColor="#ccc"
            value={code}
            onChangeText={setCode}
            keyboardType="numeric"
            maxLength={6}
          />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#ccc"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            placeholderTextColor="#ccc"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? '...' : 'Change Password'}</Text>
          </TouchableOpacity>
        </>
      )}
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
  button: {
    backgroundColor: "#D4AF37",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#0A1A2F",
    fontSize: 18,
    fontWeight: "bold",
  },
});