import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Spinner from "@/components/ui/Spinner";
import { Image } from "expo-image";
import {
  useGetShopForAdmin,
  useUpdateShop,
  useUploadShopImage,
  useDeleteShopImage,
} from "@/src/hooks/useShopQuery";
import { useNavigation } from "expo-router";

export default function Settings() {
  const navigation = useNavigation<any>();

  const { data: shop, isLoading, refetch, isRefetching } =
    useGetShopForAdmin();
  const updateShop = useUpdateShop(shop?.id || 0);
  const uploadImage = useUploadShopImage();
  const deleteImage = useDeleteShopImage();

  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [address, setAddress] = useState("");

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Spinner size="large" />
      </View>
    );
  }

  if (!shop) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>İşletme Ayarları</Text>
        <Text style={styles.empty}>İşletme bilgileri yüklenemedi</Text>
      </SafeAreaView>
    );
  }

  const startEditing = () => {
    setName(shop.name ?? "");
    setPhone(shop.phone ?? "");
    setCity(shop.city ?? "");
    setDistrict(shop.district ?? "");
    setNeighborhood(shop.neighborhood ?? "");
    setAddress(shop.address ?? "");
    setIsEditing(true);
  };

  const saveChanges = () => {
    const payload: any = {
      ...(name.trim() && { name: name.trim() }),
      ...(phone.trim() && { phone: phone.trim() }),
      ...(city.trim() && { city: city.trim() }),
      ...(district.trim() && { district: district.trim() }),
      ...(neighborhood.trim() && { neighborhood: neighborhood.trim() }),
      ...(address.trim() && { address: address.trim() }),
    };

    if (Object.keys(payload).length === 0) {
      Alert.alert("Uyarı", "Değişiklik yok");
      return;
    }

    updateShop.mutate(payload, {
      onSuccess: () => {
        Alert.alert("Başarılı", "Bilgiler güncellendi");
        setIsEditing(false);
        refetch();
      },
      onError: () => {
        Alert.alert("Hata", "Güncelleme başarısız");
      },
    });
  };

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
    })
    if (result.canceled) return;

    const asset = result.assets[0];
    const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        name: `shop-${Date.now()}.jpg`,
        type: "image/jpeg",
      } as any);

      uploadImage.mutate(formData, {
        onSuccess: () => Alert.alert("Başarılı", "Resim Yüklendi"),
        onError: (err: any) => {
          console.log(err)
          Alert.alert("Hata", err?.response?.data?.message || "Yüklenemedi");
        },
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>İşletme Profili</Text>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140, gap: 20 }}
        >
          {/* IMAGE */}
          <View>
            <Image source={{ uri: shop.image }} style={styles.image} contentFit="contain" />
            <View style={styles.imageRow}>
              <TouchableOpacity style={styles.primaryBtn} onPress={pickImage}>
                <Text style={styles.primaryBtnText}>Görsel Değiştir</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dangerBtn}
                onPress={() => deleteImage.mutate(undefined, { onSuccess: refetch })}
              >
                <Text style={styles.dangerBtnText}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* PROFILE CARD */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Profil Bilgileri</Text>
              {!isEditing && (
                <TouchableOpacity onPress={startEditing}>
                  <Ionicons name="create-outline" size={20} color="#E4D2AC" />
                </TouchableOpacity>
              )}
            </View>

            {isEditing ? (
              <>
                <Field label="İşletme Adı" hint="Uygulamada görünen isim">
                  <TextInput style={styles.input} value={name} onChangeText={setName} />
                </Field>

                <Field label="Telefon" hint="5XX XXX XX XX (Opsiyonel)">
                  <TextInput
                    style={styles.input}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </Field>

                <Field label="Şehir">
                  <TextInput style={styles.input} value={city} onChangeText={setCity} />
                </Field>

                <Field label="İlçe">
                  <TextInput style={styles.input} value={district} onChangeText={setDistrict} />
                </Field>

                <Field label="Mahalle">
                  <TextInput
                    style={styles.input}
                    value={neighborhood}
                    onChangeText={setNeighborhood}
                  />
                </Field>

                <Field label="Adres">
                  <TextInput
                    style={[styles.input, styles.multiline]}
                    multiline
                    value={address}
                    onChangeText={setAddress}
                  />
                </Field>

                <View style={styles.row}>
                  <TouchableOpacity style={styles.primaryBtn} onPress={saveChanges}>
                    <Text style={styles.primaryBtnText}>Kaydet</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => setIsEditing(false)}
                  >
                    <Text style={styles.secondaryBtnText}>İptal</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Info label="İşletme Adı" value={shop.name} />
                <Info label="Telefon" value={shop.phone} />
                <Info label="Şehir" value={shop.city} />
                <Info label="İlçe" value={shop.district} />
                <Info label="Mahalle" value={shop.neighborhood} />
                <Info label="Adres" value={shop.address} />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------- SMALL COMPONENTS ---------- */
function Field({ label, hint, children }: any) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.label}>{label}</Text>
      {hint && <Text style={styles.hint}>{hint}</Text>}
      {children}
    </View>
  );
}

function Info({ label, value }: any) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "—"}</Text>
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f", padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { color: "#fff", fontSize: 22, fontWeight: "800" },
  empty: { color: "#aaa" },

  image: { width: "100%", height: 200, borderRadius: 14 },
  imageRow: { flexDirection: "row", gap: 8, marginTop: 8 },

  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between" },
  cardTitle: { color: "#fff", fontWeight: "800", fontSize: 16 },

  label: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  hint: { color: "rgba(255,255,255,0.4)", fontSize: 12 },
  value: { color: "#fff", fontSize: 16, fontWeight: "700" },

  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    fontSize: 16,
  },
  multiline: { minHeight: 80 },

  row: { flexDirection: "row", gap: 8, marginTop: 8 },

  primaryBtn: {
    flex: 1,
    backgroundColor: "#E4D2AC",
    padding: 14,
    borderRadius: 14,
  },
  primaryBtnText: { fontWeight: "800", textAlign: "center" },

  secondaryBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 14,
    borderRadius: 14,
  },
  secondaryBtnText: { color: "#fff", fontWeight: "800", textAlign: "center" },

  dangerBtn: {
    flex: 1,
    backgroundColor: "#E57373",
    padding: 14,
    borderRadius: 14,
  },
  dangerBtnText: { color: "#fff", fontWeight: "800", textAlign: "center" },
});
