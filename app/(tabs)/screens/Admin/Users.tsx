// screens/Admin/AdminUsersScreen.tsx
import React, { useEffect, useState } from "react";
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AdminLayout from "../../../../components/AdminLayout";
import { api } from "../../../services/api";

type User = {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  created_at: string;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [password, setPassword] = useState("");

  const load = async () => {
    const { users } = await api.listUsers();
    setUsers(users as any);
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!fullName || !email) {
      alert("Please fill in name and email.");
      return;
    }
    if (editingUser) {
      await api.updateUser(editingUser.id, { full_name: fullName, email, phone, role });
    } else {
      if (!password) { alert("Password is required for new users."); return; }
      await api.createUser({ full_name: fullName, email, phone, role, password });
    }
    setModalVisible(false);
    setEditingUser(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setRole("user");
    setPassword("");
    await load();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFullName(user.full_name);
    setEmail(user.email);
    setPhone(user.phone || "");
    setRole(user.role);
    setPassword("");
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    await api.deleteUser(id);
    await load();
  };

  return (
    <AdminLayout>
      <View style={styles.container}>
        <FlatList
          data={users}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.userText}>{item.full_name} ({item.role})</Text>
              <Text style={styles.emailText}>{item.email}</Text>
              {item.phone ? <Text style={styles.detailText}>Phone: {item.phone}</Text> : null}
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
            setFullName("");
            setEmail("");
            setPhone("");
            setRole("user");
            setPassword("");
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
              <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#aaa" value={fullName} onChangeText={setFullName} />
              <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#aaa" value={email} onChangeText={setEmail} />
              <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#aaa" value={phone} onChangeText={setPhone} />
              {!editingUser && (
                <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#aaa" value={password} onChangeText={setPassword} secureTextEntry />
              )}
              <View style={styles.roleSwitch}>
                <TouchableOpacity style={[styles.roleButton, role === "user" && styles.activeRole]} onPress={() => setRole("user")}>
                  <Text style={styles.roleText}>User</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.roleButton, role === "admin" && styles.activeRole]} onPress={() => setRole("admin")}>
                  <Text style={styles.roleText}>Admin</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>{editingUser ? "Update" : "Create"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#0A1A2F" },
  card: { backgroundColor: "rgba(255,255,255,0.1)", padding: 15, borderRadius: 8, marginBottom: 10 },
  userText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  emailText: { color: "#ccc", marginBottom: 5 },
  detailText: { color: "#ccc", marginBottom: 2 },
  actions: { flexDirection: "row", gap: 10 },
  editButton: { backgroundColor: "#D4AF37", padding: 8, borderRadius: 5 },
  deleteButton: { backgroundColor: "red", padding: 8, borderRadius: 5 },
  actionText: { color: "#fff" },
  addButton: { backgroundColor: "#D4AF37", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 10 },
  addText: { color: "#0A1A2F", fontWeight: "bold", fontSize: 16 },
  modalContainer: { flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.7)", padding: 20 },
  modalContent: { backgroundColor: "#1a1a2e", padding: 20, borderRadius: 10 },
  modalTitle: { color: "#fff", fontSize: 20, marginBottom: 15 },
  input: { borderWidth: 1, borderColor: "#fff", color: "#fff", padding: 12, marginBottom: 15, borderRadius: 8 },
  roleSwitch: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  roleButton: { padding: 10, borderWidth: 1, borderColor: "#fff", borderRadius: 6 },
  activeRole: { backgroundColor: "#D4AF37", borderColor: "#D4AF37" },
  roleText: { color: "#fff" },
  saveButton: { backgroundColor: "#D4AF37", padding: 12, borderRadius: 8, alignItems: "center" },
  saveText: { color: "#0A1A2F", fontWeight: "bold", fontSize: 16 },
  cancelButton: { marginTop: 10, alignItems: "center" },
  cancelText: { color: "#fff" },
});
