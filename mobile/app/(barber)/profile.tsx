import { useUnifiedMe, useUnifiedLogout } from "@/src/hooks/useUnifiedAuth";
import Spinner from "@/components/ui/Spinner";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity, StyleSheet, RefreshControl, ScrollView, Image, Alert, TextInput } from "react-native";
import { useBarberUploadImage, useBarberDeleteImage, useUpdateBarber } from "@/src/hooks/useBarberQuery";
import * as ImagePicker from "expo-image-picker";
import { todayAppointmentsColors } from "@/constants/theme/barber/todayAppt";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

export default function BarberProfile() {
  const router = useRouter();
  const { data, isLoading, isError, refetch, isRefetching } = useUnifiedMe();
  const logout = useUnifiedLogout();
  const navigation = useNavigation();
  const updateBarber = useUpdateBarber();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

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

  const uploadImage = useBarberUploadImage();
  const deleteImage = useBarberDeleteImage();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Spinner size="large" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={styles.container}> 
        <Text style={styles.title}>Profil</Text>
        <View style={styles.center}>
          <Text style={styles.empty}>Profil yüklenemedi. Yenilemeyi deneyin.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Uyarı", "Galeri izni verilmedi");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const formData = new FormData();
    formData.append("file", {
      uri: asset.uri,
      name: `barber-${Date.now()}.jpg`,
      type: "image/jpeg",
    } as any);

    uploadImage.mutate(formData, {
      onSuccess: () => {
        Alert.alert("Başarılı", "Resim Yüklendi");
        refetch();
      },
      onError: (err: any) => {
        console.log(err);
        Alert.alert("Hata", err?.response?.data?.message || "Yüklenemedi");
      },
    });
  };

  const onRemoveImage = () => {
    Alert.alert("Resmi Kaldır", "Berber resmini kaldırmak istediğinizden emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Kaldır",
        style: "destructive",
        onPress: () => {
          deleteImage.mutate(undefined, { onSuccess: () => refetch() });
        },
      },
    ]);
  };

  const startEditing = () => {
    setFirstName(data?.firstName ?? "");
    setLastName(data?.lastName ?? "");
    setPhone(data?.phone ?? "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setFirstName("");
    setLastName("");
    setPhone("");
  };

  const saveChanges = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Uyarı", "Lütfen tüm alanları doldurun");
      return;
    }

    updateBarber.mutate(
      { firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() ? phone.trim() : null },
      {
        onSuccess: () => {
          Alert.alert("Başarılı", "Bilgileriniz güncellendi");
          setIsEditing(false);
          refetch();
        },
        onError: (err: any) => {
          Alert.alert("Hata", err?.response?.data?.message || "Güncelleme başarısız");
        },
      }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
      >
        <Image 
          source={{ uri: data.image, cache: "force-cache" }}
          style={styles.cardImage}
        /> 
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, alignItems: "center" }}>
          <TouchableOpacity onPress={pickImage} style={{ backgroundColor: "#E4D2AC", padding: 8, borderRadius: 10, width: "45%" }}>
            <Text style={{ color: "#000", fontSize: 16, alignSelf: "center", fontWeight: "700" }}>Resim Yükle</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onRemoveImage} style={{ backgroundColor: "#E57373", padding: 8, borderRadius: 10, width: "45%", marginRight: 0 }}>
            <Text style={{ color: "#fff", fontSize: 16, alignSelf: "center", fontWeight: "700" }}>Resim Sil</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Bilgilerim</Text>
            {!isEditing && (
              <TouchableOpacity onPress={startEditing} style={styles.editIconBtn}>
                <Ionicons
                  name="create-outline"
                  size={18}
                  color="#E4D2AC"
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
                placeholderTextColor="rgba(255,255,255,0.4)"
              />

              <Text style={styles.label}>Soyad</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Soyad"
                placeholderTextColor="rgba(255,255,255,0.4)"
              />

              <Text style={styles.label}>Telefon (Telefon numarasını boş bırakarak silebilirsiniz!)</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="5XX XXX XX XX"
                placeholderTextColor="rgba(255,255,255,0.4)"
                keyboardType="phone-pad"
                maxLength={10}
              />

              <Text style={styles.label}>E-posta</Text>
              <Text style={styles.value}>{data.email ?? "—"}</Text>

              <Text style={styles.label}>Durum</Text>
              <Text style={styles.value}>{data.active ? "Aktif" : "Aktif Değil"}</Text>

              <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                <TouchableOpacity
                  onPress={saveChanges}
                  disabled={updateBarber.isPending}
                  style={[styles.saveBtn, { flex: 1 }, updateBarber.isPending && { opacity: 0.7 }]}
                >
                  <Text style={styles.saveBtnText}>
                    {updateBarber.isPending ? "Kaydediliyor..." : "Kaydet"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={cancelEditing}
                  disabled={updateBarber.isPending}
                  style={[styles.cancelBtn, { flex: 1 }]}
                >
                  <Text style={styles.cancelBtnText}>İptal</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.label}>Ad Soyad</Text>
              <Text style={styles.value}>{`${data.firstName ?? ""} ${data.lastName ?? ""}`.trim()}</Text>

              <Text style={styles.label}>E-posta</Text>
              <Text style={styles.value}>{data.email ?? "—"}</Text>

              <Text style={styles.label}>Telefon</Text>
              <Text style={styles.value}>{data.phone ?? "—"}</Text>

              <Text style={styles.label}>Durum</Text>
              <Text style={styles.value}>{data.active ? "Aktif" : "Aktif Değil"}</Text>
            </>
          )}
        </View>

        <TouchableOpacity
          style={styles.workingHourBtn}
          onPress={() => router.replace("/(barber)/workingHour")}
        >
          <Text style={styles.workingHourText}>Çalışma Saatlerim</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/change-password-barber")}
          style={styles.changeBtn}
        >
          <Text style={styles.changeText}>
            Şifre Değiştir
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onLogout()}
          disabled={logout.isPending}
          style={[styles.logoutBtn, logout.isPending && { opacity: 0.7 }]}
        >
          <Text style={styles.logoutText}>
            {logout.isPending ? "Çıkış yapılıyor..." : "Çıkış Yap"}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: todayAppointmentsColors.containerBackground, marginBottom: 32 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 8, color: "#fff", marginTop: 16 },
  empty: { color: "#ccc", marginTop: 8 },
  card: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 8,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  editIconBtn: {
    padding: 6,
    backgroundColor: "rgba(228,210,172,0.2)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E4D2AC",
  },
  editIcon: {
    fontSize: 16,
  },

  label: { fontSize: 13, color: "rgba(255,255,255,0.7)" },
  value: { fontSize: 16, fontWeight: "700", color: "#fff" },

  input: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  saveBtn: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#E4D2AC",
    alignItems: "center",
  },
  saveBtnText: {
    color: "#121212",
    fontWeight: "800",
  },

  cancelBtn: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  cancelBtnText: {
    color: "#fff",
    fontWeight: "800",
  },

  workingHourBtn: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#E4D2AC",
    alignItems: "center",
  },
  workingHourText: { color: "#121212", fontWeight: "800" },
  
  logoutBtn: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#E57373",
    alignItems: "center",
  },
  logoutText: { color: "#fff", fontWeight: "800", textAlign: "center" },
  
  cardImage: {
    width: "100%",
    height: 200,
    borderRadius: 14,
    borderCurve: "continuous",
    resizeMode: "contain", 
    marginBottom: 10,
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  changeBtn: {
    marginTop: 4,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#E4D2AC",
    alignItems: "center",
  },
  changeText: {
    color: "#121212",
    fontWeight: "800",
  },
});