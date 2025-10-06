// screens/Admin/AdminUsersScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");

  // Load users (later connect to backend API)
  useEffect(() => {
    setUsers([
      { id: "1", name: "Alice", email: "alice@mail.com", role: "user", createdAt: "2025-09-01" },
      { id: "2", name: "Bob", email: "bob@mail.com", role: "admin", createdAt: "2025-09-02" },
    ]);
  }, []);

  const handleSave = () => {
    if (editingUser) {
      // Update existing user
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id ? { ...editingUser, name, email, role } : u
        )
      );
    } else {
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        role,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
    }
    setModalVisible(false);
    setEditingUser(null);
    setName("");
    setEmail("");
    setRole("user");
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false}} />
 <View style={styles.topNav}>
          <Image 
            source={require('../../../../assets/images/logo.png')} 
            style={styles.logo} 
          />
          <Text style={styles.appName}>Aerolux</Text>
          <Ionicons name="menu" size={28} color="#D4AF37" />
        </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.userText}>{item.name} ({item.role})</Text>
            <Text style={styles.emailText}>{item.email}</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleEdit(item)} style={styles.editButton}>
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Add User Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setEditingUser(null);
          setName("");
          setEmail("");
          setRole("user");
          setModalVisible(true);
        }}
      >
        <Text style={styles.addText}>+ Add User</Text>
      </TouchableOpacity>

      {/* Modal for Create/Update */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingUser ? "Edit User" : "Add User"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={setEmail}
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
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>
                {editingUser ? "Update" : "Create"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
     topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  container: { flex: 1, padding: 20, backgroundColor: "#0A1A2F" },
  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  userText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  emailText: { color: "#ccc", marginBottom: 5 },
  actions: { flexDirection: "row", gap: 10 },
  editButton: { backgroundColor: "#D4AF37", padding: 8, borderRadius: 5 },
  deleteButton: { backgroundColor: "red", padding: 8, borderRadius: 5 },
  actionText: { color: "#fff" },
  addButton: {
    backgroundColor: "#D4AF37",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  addText: { color: "#0A1A2F", fontWeight: "bold", fontSize: 16 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1a1a2e",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: { color: "#fff", fontSize: 20, marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#fff",
    color: "#fff",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
  },
  roleSwitch: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  roleButton: { padding: 10, borderWidth: 1, borderColor: "#fff", borderRadius: 6 },
  activeRole: { backgroundColor: "#D4AF37", borderColor: "#D4AF37" },
  roleText: { color: "#fff" },
  saveButton: {
    backgroundColor: "#D4AF37",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: { color: "#0A1A2F", fontWeight: "bold", fontSize: 16 },
  cancelButton: { marginTop: 10, alignItems: "center" },
  cancelText: { color: "#fff" },
});
