import { useUnifiedMe, useUnifiedLogout, useUpdateCustomer, useDeleteCustomer } from "@/src/hooks/useUnifiedAuth";
import Spinner from "@/components/ui/Spinner";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Alert,
  TextInput, 
  Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { themeColors } from "@/constants/theme";
import { useState } from "react";
export default function CustomerProfile() {
  const router = useRouter();
  const navigation = useNavigation();
  const { data, isLoading, isError, refetch, isRefetching } = useUnifiedMe();
  const logout = useUnifiedLogout();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  console.log(data)
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const onLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "(auth)/login" }],
          })
        );
      },
    });
  };

  const startEditing = () => {
    setFirstName(data.firstName ?? "");
    setLastName(data.lastName ?? "");
    setPhone(data?.phone ?? "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setFirstName("");
    setLastName("");
    setPhone("");
  };

  const onDeleteAccount = () => {
    Alert.alert(
      "Hesabı Sil",
      "Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.",
      [
        { text: "İptal", style: "cancel", onPress: () => {
          setOpen(false);
          setConfirmText("");
        }},
        { text: "Sil", style: "destructive", onPress: deleteConfirmed }
      ]
    );
  }

  const deleteConfirmed = () => {
    deleteCustomer.mutate(undefined, {

      onSuccess: () => {
        setOpen(false);
        setConfirmText("");
        Alert.alert("Hesabınız silindi");
        router.replace("/(auth)/login")
      },
      onError: (err: any) => {
        Alert.alert("Hata", "Hesabınız silinemedi");
      }
    });
  };
  const saveChanges = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Uyarı", "Lütfen tüm alanları doldurun");
      return;
    }

    updateCustomer.mutate(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() ? phone.trim() : null,
      },
      {
        onSuccess: () => {
          Alert.alert("Başarılı", "Bilgileriniz güncellendi");
          setIsEditing(false);
          refetch();
        },
        onError: (err: any) => {
          Alert.alert(
            "Hata",
            err?.response?.data?.message 
          );
        },
      }
    );
  };


  if (isLoading) {
    return (
      <View style={styles.container}>
        <Spinner size="large" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace("/(customer)/home")}
        >
          <Ionicons name="arrow-back" size={22} color={themeColors.primary} />
        </TouchableOpacity>

        <Text style={styles.title}>Profil</Text>

        <View style={styles.errorCard}>
          <Ionicons name="alert-circle" size={48} color={themeColors.error} />
          <Text style={styles.errorText}>Profil yüklenemedi</Text>
          <Text style={styles.errorSubtext}>Yenilemeyi deneyin</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Yeniden Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.replace("/(customer)/home")}
          >
            <Ionicons name="arrow-back" size={22} color={themeColors.primary} />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Profil Bilgileri</Text>
          <Text style={styles.subtitle}>Hesap bilgilerinizi görüntüleyin</Text>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {data.firstName?.charAt(0)}
              {data.lastName?.charAt(0)}
            </Text>
          </View>

          <Text style={styles.avatarName}>
            {`${data.firstName ?? ""} ${data.lastName ?? ""}`.trim()}
          </Text>

          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Müşteri</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Bilgilerim</Text>

            {!isEditing && (
              <TouchableOpacity onPress={startEditing} style={styles.editIconBtn}>
                <Ionicons
                  name="create-outline"
                  size={18}
                  color={themeColors.primary}
                />
              </TouchableOpacity>
            )}
          </View>

          {isEditing ? (
            <>
              <Text style={styles.label}>Ad</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Ad"
                placeholderTextColor={themeColors.textMuted}
              />

              <Text style={styles.label}>Soyad</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Soyad"
                placeholderTextColor={themeColors.textMuted}
              />

              <Text style={styles.label}>Telefon (Telefon numarasını boş bırakarak silebilirsiniz!)</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="5XX XXX XX XX"
                placeholderTextColor={themeColors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
              />

              <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                <TouchableOpacity
                  onPress={saveChanges}
                  disabled={updateCustomer.isPending}
                  style={[styles.saveBtn, { flex: 1 }]}
                >
                  <Text style={styles.saveBtnText}>
                    {updateCustomer.isPending ? "Kaydediliyor..." : "Kaydet"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={cancelEditing}
                  disabled={updateCustomer.isPending}
                  style={[styles.cancelBtn, { flex: 1 }]}
                >
                  <Text style={styles.cancelBtnText}>İptal</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={themeColors.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.label}>Ad Soyad</Text>
                  <Text style={styles.value}>
                    {`${data.firstName ?? ""} ${data.lastName ?? ""}`.trim() || "—"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={themeColors.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.label}>E-posta</Text>
                  <Text style={styles.value}>{data.email ?? "—"}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={themeColors.primary}
                  />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.label}>Telefon</Text>
                  <Text style={styles.value}>{data.phone ?? "—"}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Change Password */}
        <TouchableOpacity
          onPress={() => router.replace("/change-password")}
          style={styles.changeBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="key-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.changeText}>Şifre Değiştir</Text>
        </TouchableOpacity>

        
        {/* Logout */}
        <TouchableOpacity
          onPress={onLogout}
          disabled={logout.isPending}
          style={[styles.logoutBtn, logout.isPending && { opacity: 0.6 }]}
          activeOpacity={0.8}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.logoutText}>
            {logout.isPending ? "Çıkış yapılıyor..." : "Çıkış Yap"}
          </Text>
        </TouchableOpacity>

        <View style={styles.dividerDanger} />

        <TouchableOpacity
          onPress={() => setOpen(true)}
          disabled={logout.isPending}
          style={[styles.logoutBtn, logout.isPending && { opacity: 0.6 }]}
          activeOpacity={0.8}
        >
          
          <Ionicons
            name="trash-outline"
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.logoutText}>
            {deleteCustomer.isPending ? "Hesap siliniyor..." : "Hesabımı Sil"}
          </Text>
        </TouchableOpacity>

        {open && (
          <Modal
            animationType="fade"
            transparent
            visible={open}
            onRequestClose={() => setOpen(false)}
          >
            <View style={styles.overlay}>
              <View style={styles.modal}>

                <Text style={styles.title1}>Hesabı Sil</Text>

                <Text style={styles.desc}>
                  Bu işlem geri alınamaz. Devam etmek için aşağıya{" "}
                  <Text style={{ fontWeight: "700" }}>sil</Text> yazın.
                </Text>

                <TextInput
                  value={confirmText}
                  onChangeText={setConfirmText}
                  placeholder="sil"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input1}
                />

                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => {
                      setOpen(false);
                      setConfirmText("");
                    }}
                    style={styles.cancelBtn1}
                  >
                    <Text style={styles.cancelText}>Vazgeç</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    disabled={confirmText !== "sil"}
                    onPress={() => {
                      onDeleteAccount();
                    }}
                    style={[
                      styles.deleteBtn,
                      confirmText !== "sil" && { opacity: 0.5 },
                    ]}
                  >
                    <Text style={styles.deleteText}>Hesabı Sil</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          </Modal>
        )}

      
      </ScrollView>
    </SafeAreaView>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: themeColors.background,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    marginTop: 8,
    marginBottom: 8,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: themeColors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: themeColors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: themeColors.textMuted,
  },

  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 20,
    backgroundColor: themeColors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: themeColors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "800",
    color: themeColors.textOnPrimary,
  },
  avatarName: {
    fontSize: 20,
    fontWeight: "700",
    color: themeColors.text,
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: themeColors.surfaceLight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: themeColors.primary,
  },
  roleText: {
    fontSize: 13,
    fontWeight: "600",
    color: themeColors.primary,
  },

  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: themeColors.surface,
    borderWidth: 1,
    borderColor: themeColors.border,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: themeColors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: themeColors.textDim,
    margin: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: themeColors.text,
  },
  divider: {
    height: 1,
    backgroundColor: themeColors.border,
    marginVertical: 4,
  },

  dividerDanger: {
    height: 3,
    backgroundColor: "#1e1e1e",
    marginVertical: 32,
  },

  changeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 14,
    backgroundColor: themeColors.primary,
    marginBottom: 12,
  },
  changeText: {
    color: themeColors.textOnPrimary,
    fontWeight: "700",
    fontSize: 16,
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 14,
    backgroundColor: themeColors.error,
    marginBottom: 16,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  errorCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "700",
    color: themeColors.text,
  },
  errorSubtext: {
    fontSize: 14,
    color: themeColors.textMuted,
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: themeColors.primary,
    borderRadius: 12,
  },
  retryText: {
    color: themeColors.textOnPrimary,
    fontWeight: "700",
    fontSize: 15,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: themeColors.text,
  },

  editIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: themeColors.surfaceLight,
    borderWidth: 1,
    borderColor: themeColors.primary,
  },

  input: {
    fontSize: 16,
    fontWeight: "600",
    color: themeColors.text,
    backgroundColor: themeColors.surfaceLight,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: themeColors.border,
  },

  saveBtn: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: themeColors.primary,
    alignItems: "center",
  },

  saveBtnText: {
    color: themeColors.textOnPrimary,
    fontWeight: "800",
  },

  cancelBtn: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: themeColors.surfaceLight,
    alignItems: "center",
    borderWidth: 1,
    borderColor: themeColors.border,
  },

  cancelBtnText: {
    color: themeColors.text,
    fontWeight: "800",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    maxWidth: 360,
    backgroundColor: "#121212",
    borderRadius: 16,
    padding: 20,
  },
  title1: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    color: "#fff",
  },
  desc: {
    fontSize: 14,
    color: "#555",
    marginBottom: 12,
  },
  input1: {
    borderWidth: 1,
    borderColor: "#1f1f1f",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    color: "#fff",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn1: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
  },
  cancelText: {
    fontWeight: "700",
    color: "#111",
  },
  deleteBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    alignItems: "center",
  },
  deleteText: {
    fontWeight: "800",
    color: "#fff",
  },
});
