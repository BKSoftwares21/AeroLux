import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { height } = Dimensions.get("window");

type UserModalProps = {
  visible: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
};

export default function UserModal({ visible, onClose, children }: UserModalProps) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const router = useRouter();
                                                                                        
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
  }, [visible, slideAnim]);                               

  const handleClose = () => {
    Animated.timing(slideAnim, {     
      toValue: height,
      duration: 350,
      useNativeDriver: true,

      
    }).start(() => {
      onClose && onClose();
    });
  };

  const handleNavigate = (path: 
    "/screens/User/Profile" | 
    "/screens/User/Notifications" | 
    "/screens/User/Payments"
  ) => {
    handleClose();
    setTimeout(() => {
      router.push(path);
    }, 350); // Wait for animation to finish
  };

  const handleLogout = () => {
    handleClose();
    setTimeout(() => {
      // TODO: Add your logout logic here (e.g., clear tokens, reset state)
      router.replace("/screens/Auth/Login");
    }, 350);
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
            <Ionicons name="close" size={24} color="#D4AF37" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.option}
            onPress={() => handleNavigate("/screens/User/Profile")}
          >
            <Ionicons name="person-circle-outline" size={24} color="#0A1A2F" style={styles.optionIcon} />
            <Text style={styles.optionText}>Account Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.option}
            onPress={() => handleNavigate("/screens/User/Notifications")}
          >
            <Ionicons name="notifications-outline" size={24} color="#0A1A2F" style={styles.optionIcon} />
            <Text style={styles.optionText}>Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.option}
            onPress={() => handleNavigate("/screens/User/Payments")}
          >
            <Ionicons name="card-outline" size={24} color="#0A1A2F" style={styles.optionIcon} />
            <Text style={styles.optionText}>Checkout</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.logoutOption}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#F44336" style={styles.optionIcon} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

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
    minHeight: 220,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionIcon: {
    marginRight: 16,
  },
  optionText: {
    fontSize: 18,
    color: "#0A1A2F",
    fontWeight: "bold",
  },
  logoutOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 10,
  },
  logoutText: {
    fontSize: 18,
    color: "#F44336",
    fontWeight: "bold",
  },
});