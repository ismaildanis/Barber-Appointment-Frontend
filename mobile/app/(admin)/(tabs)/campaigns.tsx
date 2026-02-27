import { useState, useMemo } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { myColors } from "@/constants/theme";
import Spinner from "@/components/ui/Spinner";
import {
  useCreateCampaignMutation,
  useGetCampaignForAdmin,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
} from "@/src/hooks/useCampaignQuery";
import type { CampaignForAdmin } from "@/src/types/campaign";
import { useShopStore } from "@/src/store/useShopStore";
import { useGetServicesForAdmin } from "@/src/hooks/useServiceQuery";
import type { Service } from "@/src/types/service";

type FormValues = {
  name: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: string;
  startAt: string;
  endAt: string;
  wheelEnabled: boolean;
  wheelWeight: string;
  active: boolean;
};

export default function CampaignsScreen() {
  const { activeShopSlug } = useShopStore();
  const safeSlug = activeShopSlug ?? "";
  const insets = useSafeAreaInsets();

  const { data: campaigns, isLoading, isRefetching, refetch } = useGetCampaignForAdmin();
  const createCampaign = useCreateCampaignMutation();
  const updateCampaign = useUpdateCampaignMutation();
  const deleteCampaign = useDeleteCampaignMutation();

  const [values, setValues] = useState<FormValues>({
    name: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    startAt: "",
    endAt: "",
    wheelEnabled: false,
    wheelWeight: "",
    active: true,
  });

  const { data: services } = useGetServicesForAdmin();
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [editingCampaign, setEditingCampaign] = useState<CampaignForAdmin | null>(null);

  const sortedServices = useMemo(
    () =>
      (services ?? []).slice().sort((a, b) => a.name.localeCompare(b.name)),
    [services]
  );

  const patchValues = (patch: Partial<FormValues>) =>
    setValues((prev) => ({ ...prev, ...patch }));

  const resetForm = () =>
    setValues({
      name: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      startAt: "",
      endAt: "",
      wheelEnabled: false,
      wheelWeight: "",
      active: true,
    });

  const clearEditing = () => {
    setEditingCampaign(null);
    setSelectedServiceIds([]);
    resetForm();
  };

  const onSubmit = () => {
    if (
      !values.name.trim() ||
      !values.discountValue.trim() ||
      !values.startAt.trim()
    ) {
      Alert.alert(
        "Eksik Bilgi",
        "Kampanya adı, indirim ve başlangıç tarihi zorunludur."
      );
      return;
    }

    if (!selectedServiceIds.length) {
      Alert.alert(
        "Hizmet Seçilmedi",
        "Kampanyanın geçerli olacağı en az bir hizmet seçmelisiniz."
      );
      return;
    }

    const discountValue = Number(values.discountValue);
    if (Number.isNaN(discountValue) || discountValue <= 0) {
      Alert.alert("Geçersiz İndirim", "İndirim değeri pozitif bir sayı olmalıdır.");
      return;
    }

    const wheelWeight = values.wheelWeight.trim()
      ? Number(values.wheelWeight)
      : undefined;

    const payload = {
      name: values.name.trim(),
      description: values.description.trim() || undefined,
      discountType: values.discountType,
      discountValue,
      serviceIds: selectedServiceIds,
      startAt: values.startAt.trim(),
      endAt: values.endAt.trim() || null,
      wheelEnabled: values.wheelEnabled,
      wheelWeight,
      active: values.active,
    };

    if (editingCampaign) {
      updateCampaign.mutate(
        { id: editingCampaign.id, data: payload },
        {
          onSuccess: () => {
            Alert.alert("Başarılı", "Kampanya güncellendi.");
            clearEditing();
            refetch();
          },
          onError: (err: any) => {
            const msg =
              err?.response?.data?.message ||
              err?.message ||
              "Kampanya güncellenemedi.";
            Alert.alert("Hata", msg);
          },
        }
      );
    } else {
      createCampaign.mutate(payload, {
        onSuccess: () => {
          Alert.alert("Başarılı", "Kampanya oluşturuldu.");
          clearEditing();
          refetch();
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.message ||
            err?.message ||
            "Kampanya oluşturulamadı.";
          Alert.alert("Hata", msg);
        },
      });
    }
  };

  const isWorking =
    isLoading ||
    isRefetching ||
    createCampaign.isPending ||
    updateCampaign.isPending ||
    deleteCampaign.isPending;

  const startEdit = (item: CampaignForAdmin) => {
    setEditingCampaign(item);
    const isPercentage =
      item.discountType === 1 || item.discountType === "PERCENTAGE";
    setValues({
      name: item.name,
      description: item.description ?? "",
      discountType: isPercentage ? "PERCENTAGE" : "FIXED_AMOUNT",
      discountValue: String(item.discountValue ?? ""),
      startAt: item.startAt?.slice(0, 10) ?? "",
      endAt: item.endAt ? item.endAt.slice(0, 10) : "",
      wheelEnabled: item.wheelEnabled,
      wheelWeight: item.wheelWeight != null ? String(item.wheelWeight) : "",
      active: item.active,
    });
    setSelectedServiceIds(
      (item.campaignServices ?? []).map((cs) => cs.serviceId)
    );
  };

  const handleDelete = () => {
    if (!editingCampaign) return;
    Alert.alert(
      "Kampanyayı Sil",
      `"${editingCampaign.name}" kampanyasını silmek istediğine emin misin?`,
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            deleteCampaign.mutate(editingCampaign.id, {
              onSuccess: () => {
                Alert.alert("Silindi", "Kampanya başarıyla silindi.");
                clearEditing();
                refetch();
              },
              onError: (err: any) => {
                const msg =
                  err?.response?.data?.message ||
                  err?.message ||
                  "Kampanya silinemedi.";
                Alert.alert("Hata", msg);
              },
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {isWorking && <Spinner />}

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: 32 + insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Kampanyalar</Text>
            <Text style={styles.subtitle}>
              {safeSlug
                ? `Aktif işletme: ${safeSlug}`
                : "Önce bir işletme seçmelisiniz"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={clearEditing}
            style={styles.headerAction}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={18} color="#E4D2AC" />
            <Text style={styles.headerActionText}>
              {editingCampaign ? "Yeni" : "Temizle"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {editingCampaign ? "Kampanyayı Düzenle" : "Yeni Kampanya Oluştur"}
          </Text>

          <LabeledInput
            label="Kampanya Adı"
            value={values.name}
            onChangeText={(t) => patchValues({ name: t })}
            placeholder="Örn: Kış İndirimi %10"
          />

          <LabeledInput
            label="Açıklama"
            value={values.description}
            onChangeText={(t) => patchValues({ description: t })}
            placeholder="Opsiyonel açıklama"
            multiline
          />

          <View style={styles.row}>
            <Text style={styles.label}>İndirim Tipi</Text>
            <View style={styles.chipRow}>
              <TouchableOpacity
                onPress={() => patchValues({ discountType: "PERCENTAGE" })}
                style={[
                  styles.chip,
                  values.discountType === "PERCENTAGE" && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    values.discountType === "PERCENTAGE" && styles.chipTextActive,
                  ]}
                >
                  Yüzde
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => patchValues({ discountType: "FIXED_AMOUNT" })}
                style={[
                  styles.chip,
                  values.discountType === "FIXED_AMOUNT" && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    values.discountType === "FIXED_AMOUNT" && styles.chipTextActive,
                  ]}
                >
                  Tutar
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <LabeledInput
            label={
              values.discountType === "PERCENTAGE"
                ? "İndirim Oranı (%)"
                : "İndirim Tutarı (₺)"
            }
            value={values.discountValue}
            onChangeText={(t) => patchValues({ discountValue: t })}
            keyboardType="numeric"
          />

          <LabeledInput
            label="Başlangıç Tarihi (YYYY-MM-DD)"
            value={values.startAt}
            onChangeText={(t) => patchValues({ startAt: t })}
            placeholder="2026-02-23"
          />

          <LabeledInput
            label="Bitiş Tarihi (YYYY-MM-DD)"
            value={values.endAt}
            onChangeText={(t) => patchValues({ endAt: t })}
            placeholder="Boş bırakılırsa süresiz"
          />

          {/* Hizmet Seçimi */}
          <View style={{ marginTop: 4 }}>
            <Text style={styles.label}>Hizmetler</Text>
            <Text style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>
              Kampanyanın geçerli olacağı hizmetleri seçin.
            </Text>
            <View
              style={{
                maxHeight: 180,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.12)",
                backgroundColor: "rgba(0,0,0,0.4)",
                paddingVertical: 4,
              }}
            >
              <ScrollView>
                {sortedServices.map((s: Service) => {
                  const checked = selectedServiceIds.includes(s.id);
                  return (
                    <TouchableOpacity
                      key={s.id}
                      activeOpacity={0.8}
                      onPress={() =>
                        setSelectedServiceIds((prev) =>
                          prev.includes(s.id)
                            ? prev.filter((id) => id !== s.id)
                            : [...prev, s.id]
                        )
                      }
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: "#FFFFFF",
                            fontSize: 13,
                            fontWeight: "600",
                          }}
                          numberOfLines={1}
                        >
                          {s.name}
                        </Text>
                      </View>
                      <Ionicons
                        name={checked ? "checkbox" : "square-outline"}
                        size={18}
                        color={checked ? "#E4D2AC" : "rgba(255,255,255,0.6)"}
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          <View style={styles.rowBetween}>
            <View style={styles.row}>
              <Text style={styles.label}>Çarkta Kullan</Text>
            </View>
            <Switch
              value={values.wheelEnabled}
              onValueChange={(v) => patchValues({ wheelEnabled: v })}
            />
          </View>

          {values.wheelEnabled && (
            <LabeledInput
              label="Çark Ağırlığı"
              value={values.wheelWeight}
              onChangeText={(t) => patchValues({ wheelWeight: t })}
              keyboardType="numeric"
              placeholder="Örn: 10"
            />
          )}

          <View style={styles.rowBetween}>
            <View style={styles.row}>
              <Text style={styles.label}>Aktif</Text>
            </View>
            <Switch
              value={values.active}
              onValueChange={(v) => patchValues({ active: v })}
            />
          </View>

          <TouchableOpacity
            onPress={onSubmit}
            activeOpacity={0.85}
            style={styles.submitBtn}
            disabled={isWorking}
          >
            <Ionicons name="save" size={18} color="#121212" />
            <Text style={styles.submitText}>
              {editingCampaign
                ? updateCampaign.isPending
                  ? "Güncelleniyor..."
                  : "Kampanyayı Güncelle"
                : createCampaign.isPending
                ? "Kaydediliyor..."
                : "Kampanya Oluştur"}
            </Text>
          </TouchableOpacity>

          {editingCampaign && (
            <TouchableOpacity
              onPress={handleDelete}
              activeOpacity={0.85}
              style={styles.deleteBtn}
              disabled={deleteCampaign.isPending}
            >
              <Ionicons name="trash" size={18} color="#FECACA" />
              <Text style={styles.deleteText}>
                {deleteCampaign.isPending ? "Siliniyor..." : "Kampanyayı Sil"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Campaign List (özet) */}
        <View style={styles.listCard}>
          <Text style={styles.cardTitle}>Mevcut Kampanyalar</Text>
          {isLoading ? (
            <Spinner />
          ) : !campaigns || campaigns.length === 0 ? (
            <Text style={styles.emptyText}>Bu işletme için kampanya yok.</Text>
          ) : (
            <FlatList
              data={campaigns as CampaignForAdmin[]}
              keyExtractor={(item) => String(item.id)}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.campaignRow}
                  activeOpacity={0.8}
                  onPress={() => startEdit(item)}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.campaignName}>{item.name}</Text>
                    {item.description && (
                      <Text style={styles.campaignDesc} numberOfLines={2}>
                        {item.description}
                      </Text>
                    )}
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <Text style={styles.campaignBadge}>
                      {item.active ? "Aktif" : "Pasif"}
                    </Text>
                    <Text style={styles.campaignMeta}>
                      {item.discountType === 1 ||
                      item.discountType === "PERCENTAGE"
                        ? `%${Number(item.discountValue) || 0}`
                        : `${Number(item.discountValue) || 0}₺ indirim`}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type LabeledInputProps = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
  multiline?: boolean;
};

function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false,
}: LabeledInputProps) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.4)"
        keyboardType={keyboardType}
        multiline={multiline}
        style={[
          styles.input,
          multiline && { height: 80, textAlignVertical: "top" },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: myColors.mainBackground,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 16,
    gap: 10,
  },
  listCard: {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "transparent",
  },
  chipActive: {
    backgroundColor: "#E4D2AC",
    borderColor: "#E4D2AC",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
  chipTextActive: {
    color: "#121212",
  },
  submitBtn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#E4D2AC",
  },
  submitText: {
    color: "#121212",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  campaignRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  campaignName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  campaignDesc: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
  campaignBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#121212",
    backgroundColor: "#E4D2AC",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  headerAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(228,210,172,0.5)",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  headerActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#E4D2AC",
  },
  deleteBtn: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.5)",
  },
  deleteText: {
    color: "#FECACA",
    fontSize: 13,
    fontWeight: "700",
  },
  campaignMeta: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "500",
  },
});

