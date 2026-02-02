import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useGetServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useUploadImage,
  useDeleteImage,
  useGetServicesForAdmin,
} from "@/src/hooks/useServiceQuery";
import { Service } from "@/src/types/service";
import Spinner from "@/components/ui/Spinner";
import { ServiceCard } from "@/components/admin/ServiceCard";
import { ServiceFormModal } from "@/components/admin/ServiceFormModal";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { myColors } from "@/constants/theme";

type FormValues = {
  name: string;
  description: string;
  price: string;
  duration: string;
  imageUri?: string;
};

export default function ServicesScreen() {
  const { data: services, isLoading, isRefetching, refetch } = useGetServicesForAdmin();
  const createService = useCreateService();
  const deleteService = useDeleteService();
  const [editingId, setEditingId] = useState<number | null>(null);

  const updateService = useUpdateService(editingId || 0);
  const uploadImage = useUploadImage(editingId || 0);
  const deleteImage = useDeleteImage(editingId || 0);

  const [showFormModal, setShowFormModal] = useState(false);
  const [values, setValues] = useState<FormValues>({
    name: "",
    description: "",
    price: "",
    duration: "",
    imageUri: undefined,
  });
  const [searchQuery, setSearchQuery] = useState("");

  const isWorking =
    createService.isPending ||
    updateService.isPending ||
    deleteService.isPending ||
    uploadImage.isPending ||
    deleteImage.isPending ||
    isRefetching;

  const patchValues = (patch: Partial<FormValues>) =>
    setValues((prev) => ({ ...prev, ...patch }));

  const resetForm = () => {
    setValues({ name: "", description: "", price: "", duration: "", imageUri: undefined });
    setEditingId(null);
    setShowFormModal(false);
  };

  const onSubmit = () => {
    if (!values.name.trim() || !values.price.trim() || !values.duration) {
      Alert.alert("Eksik Bilgi", "Servis adı, fiyat ve süre zorunludur.");
      return;
    }

    const dur = Number(values.duration);
    if (Number.isNaN(dur) || dur <= 0 || dur % 15 !== 0) {
      Alert.alert("Geçersiz süre", "Süre 15’in katı ve pozitif olmalı (ör. 15, 30, 45).");
      return;
    }

    const payload = {
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      price: values.price.trim(),
      duration: dur,
    };

    if (editingId) {
      updateService.mutate(payload, {
        onSuccess: () => {
          Alert.alert("Başarılı", "Servis güncellendi!");
          resetForm();
          refetch();
        },
      });
    } else {
      createService.mutate(payload, {
        onSuccess: () => {
          Alert.alert("Başarılı", "Yeni servis eklendi!");
          resetForm();
          refetch();
        },
      });
    }
  };

  const onDelete = (id: number, itemName: string) => {
    Alert.alert(
      "Hizmeti Sil",
      `"${itemName}" hizmeti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            deleteService.mutate(id, {
              onSuccess: () => {
                Alert.alert("Başarılı", "Hizmet silindi.");
                refetch();
              },
            });
          },
        },
      ]
    );
  };

  const startEdit = (item: Service) => {
    setEditingId(item.id);
    setValues({
      name: item.name,
      description: item.description || "",
      price: item.price || "",
      duration: String(item.duration ?? ""),
      imageUri: item.image,
    });
    setShowFormModal(true);
  };

  const startCreate = () => {
    resetForm();
    setShowFormModal(true);
  };

  const pickAndUpload = async () => {
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
        name: `service-${Date.now()}.jpg`,
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

  const onRemoveImage = () => {
    if (!editingId) return;
    Alert.alert("Resmi Kaldır", "Servis resmini kaldırmak istediğinizden emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Kaldır",
        style: "destructive",
        onPress: () => {
          deleteImage.mutate(undefined, { onSuccess: () => refetch() });
          patchValues({ imageUri: undefined });
        },
      },
    ]);
  };

  const filteredServices = useMemo(
    () =>
      (services || []).filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.description || "").toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [services, searchQuery]
  );

  if (isLoading) return <Spinner />;

  return (
    <SafeAreaView style={styles.container}>
      {isWorking && <Spinner />}

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Servisler</Text>
          <Text style={styles.subtitle}>{filteredServices.length} servis bulundu</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={startCreate} activeOpacity={0.8}>
          <Ionicons name="add" size={24} color="#121212" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Servis ara..."
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
        data={filteredServices}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ServiceCard item={item} onEdit={startEdit} onDelete={onDelete} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cut-outline" size={64} color="rgba(255,255,255,0.2)" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? "Servis bulunamadı" : "Henüz servis eklenmemiş"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "Farklı bir arama terimi deneyin"
                : "Yeni servis eklemek için + butonuna tıklayın"}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <ServiceFormModal
        visible={showFormModal}
        values={values}
        setValues={patchValues}
        onClose={resetForm}
        onSubmit={onSubmit}
        onPickImage={pickAndUpload}
        onRemoveImage={onRemoveImage}
        isSubmitting={isWorking}
        isEditing={!!editingId}
        title={editingId ? "Servisi Düzenle" : "Yeni Servis Ekle"}
        subtitle={editingId ? "Servis bilgilerini güncelleyin" : "Servis detaylarını girin"}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: myColors.mainBackground, padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4 },
  addButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#D1C4B2", alignItems: "center", justifyContent: "center", elevation: 4 },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#121212", borderRadius: 12, paddingHorizontal: 12, marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  searchInput: { flex: 1, color: "#fff", fontSize: 15, paddingVertical: 12, paddingHorizontal: 8 },
  listContent: { paddingBottom: 60 },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "rgba(255,255,255,0.5)", marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: "rgba(255,255,255,0.3)", marginTop: 8, textAlign: "center" },
});
