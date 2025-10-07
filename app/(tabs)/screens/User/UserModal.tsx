import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { height } = Dimensions.get("window");

interface UserModalProps {
  visible: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}

// ...existing imports...
// Remove or comment out: import { useRouter } from "expo-router";
// ...existing code...

export default function UserModal({ visible, onClose, children }: UserModalProps) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  // Remove or comment out: const router = useRouter();

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 350,
      useNativeDriver: true,
    }).start(() => {
      onClose && onClose();
      // Remove or comment out: router.replace("./Homescreen");
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.modal, { transform: [{ translateY: slideAnim }] }]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
// ...existing styles...

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 200,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  closeText: {
    color: "#D4AF37",
    fontWeight: "bold",
    fontSize: 16,
  },
  content: {
    color: "#0A1A2F",
    fontSize: 18,
    textAlign: "center",
  },
});