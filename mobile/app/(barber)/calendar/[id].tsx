import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Spinner from "@/components/ui/Spinner";
import { useCancelBarberAppointment, useGetBarberOneAppointment, useMarkCompletedBarber, useMarkNoShowBarber } from "@/src/hooks/useAppointmentQuery";
import { statusLabel, statusColor, AppointmentService } from "@/src/types/appointment";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

export default function CalendarDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const apptId = Number(id);
  const router = useRouter();
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState("");
  const { data, isLoading, isError, refetch, isRefetching } = useGetBarberOneAppointment(apptId);
  const cancelMutation = useCancelBarberAppointment(apptId);
  const completedMutation = useMarkCompletedBarber();
  const noShowMutation = useMarkNoShowBarber();

  const isWorking = isRefetching || cancelMutation.isPending || completedMutation.isPending || noShowMutation.isPending;

  if (isLoading) return <Spinner />;

  if (isError || !data) return (
    <View style={styles.container}>
      <Text style={styles.empty}>Randevu yüklenemedi.</Text>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/(barber)/calendar")}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const date = data.appointmentStartAt?.slice(0, 10);
  const start = data.appointmentStartAt?.slice(11, 16).replace("T", " ");
  const end = data.appointmentEndAt?.slice(11, 16);
  const originalTotalPrice =
    data.appointmentServices?.reduce((sum, s) => sum + (Number(s.price) || 0), 0) || 0;
  const discountedTotalPrice =
    data.appointmentServices?.reduce(
      (sum, s) =>
        sum +
        (s.discountedPrice != null
          ? Number(s.discountedPrice)
          : Number(s.price) || 0),
      0
    ) || 0;
  const customer = data.customer ? `${data.customer.firstName} ${data.customer.lastName}` : "Silinmiş Hesap";
  const customerContact = data.customer?.phone || "—";
  const customerContact2 = data.customer?.email || "—";
  const canAct = data.status === "SCHEDULED" || data.status === "EXPIRED";

  const handleMarkCompleted = () => {
    Alert.alert(
      "Randevuyu Tamamlandı Olarak İşaretle",
      "Bu işlemi yapmak istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { text: "Evet", onPress: markCompletedConfirmed },
      ]
    );
  };

  const markCompletedConfirmed = () => {
    completedMutation.mutate(apptId, {
      onSuccess: () => {
        Alert.alert("Başarılı", "Randevu tamamlandı olarak işaretlendi.");
        refetch();
      },
    });
  };

  const handleMarkNoShow = () => {
    Alert.alert(
      "Randevuyu Gelinmedi Olarak İşaretle",
      "Bu işlemi yapmak istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { text: "Evet", onPress: markNoShowConfirmed },
      ]
    );
  };

  const markNoShowConfirmed = () => {
    noShowMutation.mutate(apptId, {
      onSuccess: () => {
        Alert.alert("Başarılı", "Randevu gelinmedi olarak işaretlendi.");
        refetch();
      },
    });
  };

  const handleMarkCancel = () => {
    Alert.alert(
      "Randevuyu İptal Et",
      "Bu işlemi yapmak istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { text: "Evet", onPress: markCancelConfirmed },
      ]
    );
  };

  const markCancelConfirmed = () => {
    const payload = reason.trim() ? { cancelReason: reason.trim() } : {};
    cancelMutation.mutate(payload, {
      onSuccess: () => {
        Alert.alert("Başarılı", "Randevu iptal edildi.");
        setReason("");
        refetch();
      },
    });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <SafeAreaView style={styles.container}>
        {isWorking && <Spinner />}

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => router.replace("/(barber)/calendar")} 
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>Randevu Detayı</Text>

          {/* Main Info Card */}
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Durum</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor[data.status] || "#888" }]}>
                <Text style={styles.statusText}>{statusLabel[data.status] || data.status}</Text>
              </View>
            </View>
          </View>

          {/* Customer Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Müşteri Bilgileri</Text>
            
            <View style={styles.row}>
              <Text style={styles.label}>Ad Soyad</Text>
              <Text style={styles.value}>{customer}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Telefon</Text>
              <Text style={styles.value}>{customerContact}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{customerContact2}</Text>
            </View>
          </View>

          {/* Date & Time Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Tarih ve Saat</Text>
            
            <View style={styles.row}>
              <Text style={styles.label}>Tarih</Text>
              <Text style={styles.value}>{date}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Saat</Text>
              <Text style={styles.value}>{start} - {end || "—"}</Text>
            </View>
          </View>

          {/* Services Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hizmetler</Text>

            {data.appointmentServices?.map((s: any, index: number) => (
              <View key={index} style={styles.serviceRow}>
                <Text style={styles.serviceName}>{s?.name || "—"}</Text>
                <View style={styles.serviceRight}>
                  <Text style={styles.servicePrice}>
                    {s?.discountedPrice != null ? (
                      <>
                        <Text style={styles.servicePriceStrike}>₺{s?.price || "0"}</Text>{" "}
                        ₺{s?.discountedPrice}
                      </>
                    ) : (
                      <>₺{s?.price || "0"}</>
                    )}
                  </Text>
                  <Text style={styles.serviceDuration}>{s?.duration || "0"} dk</Text>
                </View>
              </View>
            ))}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Toplam</Text>
              <Text style={styles.totalPrice}>
                {data.reward ? (
                  <>
                    <Text style={styles.servicePriceStrike}>
                      ₺{originalTotalPrice.toFixed(2)}
                    </Text>{" "}
                    ₺{discountedTotalPrice.toFixed(2)}
                  </>
                ) : (
                  <>₺{originalTotalPrice.toFixed(2)}</>
                )}
              </Text>
            </View>
          </View>

          {/* Reward / Campaign Card */}
          {data.reward && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Uygulanan Kampanya</Text>
              <Text style={styles.serviceName}>
                {data.reward.campaign?.name}
              </Text>
              <Text style={styles.value}>
                İndirimsiz Fiyat: ₺{originalTotalPrice.toFixed(2)}
              </Text>
              <Text style={styles.value}>
                İndirimli Fiyat: ₺{discountedTotalPrice.toFixed(2)}
              </Text>
            </View>
          )}

          {/* Notes Card */}
          {data.notes && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Not</Text>
              <Text style={styles.noteText}>{data.notes}</Text>
            </View>
          )}

          {/* Cancel Reason Card */}
          {data.cancelReason && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>İptal Sebebi</Text>
              <Text style={styles.cancelReasonText}>{data.cancelReason}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <ActionButton
              label="Tamamlandı"
              onPress={handleMarkCompleted}
              disabled={!canAct}
            />
            <ActionButton
              label="Gelinmedi"
              onPress={handleMarkNoShow}
              disabled={!canAct}
            />
          </View>

          {/* Cancel Section */}
          <View style={styles.cancelBox}>
            <Text style={styles.cardTitle}>Randevu İptali</Text>
            {canAct && (
              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder="İptal sebebi yazın (Opsiyonel)..."
                placeholderTextColor="#666"
                style={styles.input}
                multiline
                numberOfLines={3}
              />
            )}
            <ActionButton
              label="İptal Et"
              onPress={() => {
                if (!canAct) return;
                handleMarkCancel();
              }}
              disabled={!canAct}
              danger
            />
          </View>
          
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function ActionButton({
  label,
  onPress,
  disabled,
  danger,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.actionBtn,
        danger ? styles.actionBtnDanger : null,
        disabled ? styles.actionBtnDisabled : null,
      ]}
    >
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0f0f0f",
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 14,
  },

  backBtn: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
  },

  // Card
  card: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 12,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },

  // Row
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
  },

  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    textAlign: "right",
  },

  // Status
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  statusText: {
    color: "#0f0f0f",
    fontWeight: "800",
    fontSize: 12,
  },

  // Services
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },

  serviceName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },

  serviceRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  servicePrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },

  serviceDuration: {
    fontSize: 13,
    fontWeight: "500",
    color: "#888",
  },
  servicePriceStrike: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
    textDecorationLine: "line-through",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },

  totalPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },

  // Notes
  noteText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ccc",
    lineHeight: 20,
  },

  cancelReasonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ff9999",
    lineHeight: 20,
  },

  // Actions
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 6,
  },

  actionBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  actionBtnDanger: {
    backgroundColor: "#ef4444",
  },

  actionBtnDisabled: {
    opacity: 0.3,
  },

  actionText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  // Cancel Box
  cancelBox: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 12,
    color: "#fff",
    backgroundColor: "rgba(0,0,0,0.3)",
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: "top",
  },

  empty: {
    color: "#ccc",
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
});