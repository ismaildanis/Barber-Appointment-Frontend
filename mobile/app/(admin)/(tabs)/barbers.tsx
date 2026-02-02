import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  Modal,
  Switch,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useCreateBarber,
  useUpdateActivityBarberr,
  useDeleteBarber,
  useBarberUploadImage,
  useBarberDeleteImage,
  useGetBarbersForAdmin,
} from "@/src/hooks/useBarberQuery";
import { Barber } from "@/src/types/barber";
import Spinner from "@/components/ui/Spinner";
import { myColors } from "@/constants/theme";

export default function BarbersScreen() {
  const { data: barbers, isLoading, isRefetching, refetch } = useGetBarbersForAdmin();

  const createBarber = useCreateBarber();
  const [editingId, setEditingId] = useState<number | null>(null);

  const updateActivity = useUpdateActivityBarberr(editingId || 0);
  const deleteBarber = useDeleteBarber();
  const uploadImage = useBarberUploadImage();
  const deleteImage = useBarberDeleteImage();

  const [showFormModal, setShowFormModal] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [active, setActive] = useState(true);
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const isWorking =
    createBarber.isPending ||
    updateActivity.isPending ||
    deleteBarber.isPending ||
    uploadImage.isPending ||
    deleteImage.isPending ||
    isRefetching;

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setActive(true);
    setImageUri(undefined);
    setEditingId(null);
    setShowFormModal(false);
  };

  const onSubmit = () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      Alert.alert("Eksik Bilgi", "Ad, soyad ve email zorunludur.");
      return;
    }

    if (!editingId && !password.trim()) {
      Alert.alert("Eksik Bilgi", "Yeni berber için şifre zorunludur.");
      return;
    }

    if (editingId) {
      updateActivity.mutate(
        { active },
        {
          onSuccess: () => {
            Alert.alert("Başarılı", "Berber durumu güncellendi!");
            resetForm();
            refetch();
          },
        }
      );
    } else {
      createBarber.mutate(
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim() ? phone.trim() : null,
          password: password.trim(),
        },
        {
          onSuccess: () => {
            Alert.alert("Başarılı", "Yeni berber eklendi!");
            resetForm();
            refetch();
          },
          onError: (err: any) => {
            Alert.alert("Hata", err.response.data.message || "Ekleme basarısız.");
          },
        }
      );
    }
  };

  const onDelete = (id: number, name: string) => {
    Alert.alert(
      "Berberi Sil",
      `"${name}" kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            deleteBarber.mutate(id, {
              onSuccess: () => {
                Alert.alert("Başarılı", "Berber silindi.");
                refetch();
              },
            });
          },
        },
      ]
    );
  };

  const startEdit = (item: Barber) => {
    setEditingId(item.id);
    setFirstName(item.firstName);
    setLastName(item.lastName);
    setEmail(item.email);
    setPhone(item.phone ?? "");
    setActive(item.active);
    setImageUri(item.image);
    setShowFormModal(true);
  };

  const startCreate = () => {
    resetForm();
    setShowFormModal(true);
  };

  const filteredBarbers = (barbers || []).filter((item) =>
    `${item.firstName} ${item.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: Barber }) => {
    return (
      <View style={styles.barberCard}>
        <View style={styles.barberHeader}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.barberAvatar} resizeMode="cover" />
          ) : (
            <View style={[styles.barberAvatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={32} color="rgba(255,255,255,0.3)" />
            </View>
          )}

          <View style={styles.barberInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.barberName}>
                {item.firstName} {item.lastName}
              </Text>
              <View style={[styles.statusBadge, item.active ? styles.activeBadge : styles.inactiveBadge]}>
                <View style={[styles.statusDot, item.active ? styles.activeDot : styles.inactiveDot]} />
                <Text style={[styles.statusText, item.active ? styles.activeText : styles.inactiveText]}>
                  {item.active ? "Aktif" : "Pasif"}
                </Text>
              </View>
            </View>

            <View style={styles.contactInfo}>
              <View style={styles.contactRow}>
                <Ionicons name="mail-outline" size={14} color="rgba(255,255,255,0.6)" />
                <Text style={styles.contactText}>{item.email}</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="call-outline" size={14} color="rgba(255,255,255,0.6)" />
                {item.phone ? <Text style={styles.contactText}>{item.phone}</Text> : null}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => startEdit(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={18} color="rgba(209, 196, 178)" />
            <Text style={styles.editButtonText}>Düzenle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(item.id, `${item.firstName} ${item.lastName}`)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) return <Spinner />;

  return (
    <SafeAreaView style={styles.container}>
      {isWorking && <Spinner />}

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Berberler</Text>
          <Text style={styles.subtitle}>
            {filteredBarbers.length} berber bulundu
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={startCreate}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color="#121212" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Berber ara..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredBarbers}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="rgba(255,255,255,0.2)" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? "Berber bulunamadı" : "Henüz berber eklenmemiş"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "Farklı bir arama terimi deneyin"
                : "Yeni berber eklemek için + butonuna tıklayın"}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={showFormModal}
        animationType={Platform.OS === "android" ? "none" : "slide"}
        transparent={true}
        onRequestClose={resetForm}
        statusBarTranslucent
      hardwareAccelerated
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{flex: 1}}
        >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>
                  {editingId ? "Berberi Düzenle" : "Yeni Berber Ekle"}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {editingId ? "Berber bilgilerini güncelleyin" : "Berber detaylarını girin"}
                </Text>
              </View>
              <TouchableOpacity onPress={resetForm} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Ad <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Örn. Ahmet"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={styles.input}
                  editable={!editingId}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Soyad <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Örn. Yılmaz"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={styles.input}
                  editable={!editingId}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Email <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="ornek@email.com"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!editingId}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Telefon <Text style={[styles.required, { fontSize: 12, color: "rgba(255,255,255,0.6)" }]}>(Opsiyonel)</Text>
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="5XX XXX XX XX"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={styles.input}
                  keyboardType="phone-pad"
                  editable={!editingId}
                  maxLength={10}
                />
              </View>

              {!editingId && (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Şifre <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="En az 6 karakter"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    style={styles.input}
                    secureTextEntry
                  />
                </View>
              )}

              {editingId && (
                <View style={styles.formGroup}>
                  <View style={styles.switchRow}>
                    <View>
                      <Text style={styles.label}>Durum</Text>
                      <Text style={styles.switchSubtext}>
                        {active ? "Berber aktif" : "Berber pasif"}
                      </Text>
                    </View>
                    <Switch
                      value={active}
                      onValueChange={setActive}
                      trackColor={{ false: "#3e3e3e", true: "#E4D2AC" }}
                      thumbColor={active ? "#fff" : "#f4f3f4"}
                    />
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={resetForm}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={onSubmit}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark" size={20} color="#121212" />
                <Text style={styles.submitButtonText}>
                  {editingId ? "Güncelle" : "Kaydet"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: myColors.mainBackground, padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4 },
  addButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#D1C4B2", alignItems: "center", justifyContent: "center" },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#121212", borderRadius: 12, paddingHorizontal: 12, marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  searchInput: { flex: 1, color: "#fff", fontSize: 15, paddingVertical: 12, paddingHorizontal: 8 },
  listContent: { paddingBottom: 20 },
  barberCard: { backgroundColor: "#121212", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  barberHeader: { flexDirection: "row", marginBottom: 12 },
  barberAvatar: { width: 70, height: 70, borderRadius: 35, marginRight: 12, backgroundColor: "rgba(255,255,255,0.05)" },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
  barberInfo: { flex: 1 },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  barberName: { fontSize: 18, fontWeight: "700", color: "#fff", flex: 1 },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 6 },
  activeBadge: { backgroundColor: "rgba(76, 175, 80, 0.15)" },
  inactiveBadge: { backgroundColor: "rgba(158, 158, 158, 0.15)" },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  activeDot: { backgroundColor: "#4CAF50" },
  inactiveDot: { backgroundColor: "#9e9e9e" },
  statusText: { fontSize: 12, fontWeight: "600" },
  activeText: { color: "#4CAF50" },
  inactiveText: { color: "#9e9e9e" },
  contactInfo: { gap: 6 },
  contactRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  contactText: { fontSize: 13, color: "rgba(255,255,255,0.7)" },
  actionButtons: { flexDirection: "row", gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  editButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10, backgroundColor: "rgba(209, 196, 178, 0.2)", borderWidth: 1, borderColor: "rgba(209, 196, 178, 0.3)" },
  editButtonText: { fontSize: 14, fontWeight: "600", color: "#rgba(209, 196, 178)" },
  deleteButton: { width: 44, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "rgba(244, 67, 54, 0.15)", borderWidth: 1, borderColor: "rgba(244, 67, 54, 0.3)" },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "rgba(255,255,255,0.5)", marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: "rgba(255,255,255,0.3)", marginTop: 8, textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#1a1a1a", borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "90%", borderWidth: 1, borderColor: "rgba(173, 140, 87, 0.2)" },
  modalHeader: { flexDirection: "row", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" },
  modalTitle: { fontSize: 22, fontWeight: "700", color: "#fff" },
  modalSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4 },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  modalScroll: { maxHeight: 450, paddingHorizontal: 20 },
  formGroup: { marginTop: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.9)", marginBottom: 8 },
  required: { color: "#F44336" },
  input: { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 14, color: "#fff", fontSize: 15 },
  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 14 },
  switchSubtext: { fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 2 },
  uploadButton: { backgroundColor: "rgba(255,255,255,0.03)", borderWidth: 2, borderStyle: "dashed", borderColor: "rgba(255,255,255,0.2)", borderRadius: 12, padding: 32, alignItems: "center", justifyContent: "center" },
  uploadText: { fontSize: 16, fontWeight: "600", color: "rgba(255,255,255,0.7)", marginTop: 12 },
  uploadSubtext: { fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4 },
  imagePreview: { gap: 12 },
  previewImage: { width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.05)", alignSelf: "center" },
  imageActions: { flexDirection: "row", gap: 12 },
  changeImageBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "rgba(173, 140, 87, 0.15)", paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: "rgba(173, 140, 87, 0.3)" },
  changeImageText: { fontSize: 14, fontWeight: "600", color: "#E4D2AC" },
  removeImageBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "rgba(244, 67, 54, 0.15)", paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: "rgba(244, 67, 54, 0.3)" },
  removeImageText: { fontSize: 14, fontWeight: "600", color: "#F44336" },
  modalFooter: { flexDirection: "row", gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  cancelButtonText: { fontSize: 16, fontWeight: "600", color: "rgba(255,255,255,0.8)" },
  submitButton: { flex: 1, flexDirection: "row", gap: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: "#E4D2AC", alignItems: "center", justifyContent: "center" },
  submitButtonText: { fontSize: 16, fontWeight: "700", color: "#121212" },
});