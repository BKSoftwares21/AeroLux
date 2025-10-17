// screens/Admin/AdminUsersScreen.tsx
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AdminLayout from "../../../../components/AdminLayout";

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob: string; // ISO string
  idOrPassport: string;
  role: "user" | "admin";
  createdAt: string;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [showPicker, setShowPicker] = useState(false);
  const [idOrPassport, setIdOrPassport] = useState("");
  const [role, setRole] = useState<"user" | "admin">("user");

  // Load users (later connect to backend API)
  useEffect(() => {
    setUsers([
      {
        id: "1",
        name: "Alice",
        email: "alice@mail.com",
        phone: "+267 123 4567",
        dob: "2000-01-01",
        idOrPassport: "A1234567",
        role: "user",
        createdAt: "2025-09-01",
      },
      {
        id: "2",
        name: "Bob",
        email: "bob@mail.com",
        phone: "+267 987 6543",
        dob: "1995-05-10",
        idOrPassport: "B7654321",
        role: "admin",
        createdAt: "2025-09-02",
      },
    ]);
  }, []);

  const handleSave = () => {
    if (!name || !email || !phone || !dob || !idOrPassport) {
      alert("Please fill in all fields.");
      return;
    }
    if (editingUser) {
      // Update existing user
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...editingUser,
                name,
                email,
                phone,
                dob: dob.toISOString().slice(0, 10),
                idOrPassport,
                role,
              }
            : u
        )
      );
    } else {
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        dob: dob.toISOString().slice(0, 10),
        idOrPassport,
        role,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
    }
    setModalVisible(false);
    setEditingUser(null);
    setName("");
    setEmail("");
    setPhone("");
    setDob(undefined);
    setIdOrPassport("");
    setRole("user");
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
    setDob(new Date(user.dob));
    setIdOrPassport(user.idOrPassport);
    setRole(user.role);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <AdminLayout>
      <View style={styles.container}>
        <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.userText}>{item.name} ({item.role})</Text>
            <Text style={styles.emailText}>{item.email}</Text>
            <Text style={styles.detailText}>Phone: {item.phone}</Text>
            <Text style={styles.detailText}>DOB: {item.dob}</Text>
            <Text style={styles.detailText}>ID/Passport: {item.idOrPassport}</Text>
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
            setPhone("");
            setDob(undefined);
            setIdOrPassport("");
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
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#aaa"
                value={phone}
                onChangeText={setPhone}
              />
              {/* Date of Birth */}
              {Platform.OS === "web" ? (
                <TextInput
                  style={styles.input}
                  placeholder="Date of Birth (YYYY-MM-DD)"
                  placeholderTextColor="#aaa"
                  value={dob ? dob.toISOString().slice(0, 10) : ""}
                  onChangeText={text => {
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
                    <Text style={{ color: dob ? "#fff" : "#aaa" }}>
                      {dob ? dob.toLocaleDateString() : "Date of Birth (Tap to select)"}
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
                placeholder="ID or Passport Number"
                placeholderTextColor="#aaa"
                value={idOrPassport}
                onChangeText={setIdOrPassport}
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
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  // header removed; handled globally in AdminLayout
  container: { flex: 1, padding: 20, backgroundColor: "#0A1A2F" },
  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  userText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  emailText: { color: "#ccc", marginBottom: 5 },
  detailText: { color: "#ccc", marginBottom: 2 },
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
