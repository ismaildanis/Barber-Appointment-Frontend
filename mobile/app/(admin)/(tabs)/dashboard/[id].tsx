import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Alert, Platform, KeyboardAvoidingView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Spinner from "@/components/ui/Spinner";
import {
  useGetAdminOneAppointment,
  useMarkCanceledAppointment,
  useMarkCompletedAppointment,
  useMarkNoShowAppointment,
} from "@/src/hooks/useAppointmentQuery";
import { statusColor, statusLabel, Status } from "@/src/types/appointment";
import { AlertModal } from "@/components/ui/AlertModal";

export default function DashboardAppointmentDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const numericId = Number(id);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [pendingAction, setPendingAction] = useState<"complete" | "noshow" | "cancel" | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { data: appointment, isLoading, refetch, isRefetching } = useGetAdminOneAppointment(numericId);
  const markCompleted = useMarkCompletedAppointment();
  const markNoShow = useMarkNoShowAppointment();
  const markCanceled = useMarkCanceledAppointment();

  const isWorking =
    isRefetching || markCompleted.isPending || markNoShow.isPending || markCanceled.isPending;

  const openConfirm = (action: "complete" | "noshow" | "cancel") => {
    setPendingAction(action);
    if (action === "complete") {
      setAlertTitle("Randevu tamamlandı mı?");
      setAlertMsg("Bu randevuyu tamamlandı olarak işaretleyeceksin.");
    } else if (action === "noshow") {
      setAlertTitle("Gelinmedi olarak işaretle?");
      setAlertMsg("Müşteri randevuya gelmediyse onayla.");
    } else {
      setAlertTitle("İptal edilsin mi?");
      setAlertMsg("İptal sebebini yazdığından emin ol.");
    }
    setAlertVisible(true);
  };

  const handleConfirm = () => {
    if (!pendingAction || !numericId) {
      setAlertVisible(false);
      return;
    }

    if (pendingAction === "complete") {
      markCompleted.mutate(numericId, {
        onSuccess: () => {
          Alert.alert("Başarılı", "Randevu tamamlandı olarak işaretlendi.");
          refetch();
        },
        onSettled: () => setAlertVisible(false),
      });
    } else if (pendingAction === "noshow") {
      markNoShow.mutate(numericId, {
        onSuccess: () => {
          Alert.alert("Başarılı", "Randevu gelinmedi olarak işaretlendi.");
          refetch();
        },
        onSettled: () => setAlertVisible(false),
      });
    } else if (pendingAction === "cancel") {
      if (!cancelReason.trim()) {
        Alert.alert("İptal sebebi gerekli", "Lütfen bir sebep girin.");
        return;
      }
      markCanceled.mutate(numericId, {
        onSuccess: () => {
          Alert.alert("Başarılı", "Randevu iptal edildi.");
          refetch();
          setCancelReason("");
        },
        onSettled: () => setAlertVisible(false),
      });
    }
  };

  if (isLoading) return <Spinner />;

  const status = appointment?.status as Status | undefined;
  const date = appointment?.appointmentStartAt?.slice(0, 10);
  const start = appointment?.appointmentStartAt?.slice(11, 16).replace("T", " ");
  const end = appointment?.appointmentEndAt?.slice(11, 16).replace("T", " ");
  const totalPrice = appointment?.appointmentServices?.reduce((sum, s) => sum + (Number(s.price) || 0), 0);
  const customer = appointment?.customer
    ? `${appointment.customer.firstName} ${appointment.customer.lastName}`
    : "Silinmiş Hesap";
  const customerContact = appointment?.customer?.phone || "—";
  const customerContact2 = appointment?.customer?.email || "Silinmiş Hesap";

  const canAct = status === "SCHEDULED" || status === "EXPIRED";

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <SafeAreaView style={styles.container}>
        {isWorking && <Spinner />}
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Back Button */}
          <TouchableOpacity 
            onPress={() => router.replace("/(admin)/(tabs)/dashboard")} 
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>Randevu Detayı</Text>

          {/* Main Info Card */}
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>Berber</Text>
              <Text style={styles.value}>
                {appointment?.barber?.firstName} {appointment?.barber?.lastName}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Durum</Text>
              <View style={[styles.statusBadge, { backgroundColor: status ? statusColor[status] : "#888" }]}>
                <Text style={styles.statusText}>{status ? statusLabel[status] : "—"}</Text>
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

            {appointment?.appointmentServices?.map((s: any, index: number) => (
              <View key={index} style={styles.serviceRow}>
                <Text style={styles.serviceName}>{s?.name || "—"}</Text>
                <View style={styles.serviceRight}>
                  <Text style={styles.servicePrice}>₺{s?.price || "0"}</Text>
                  <Text style={styles.serviceDuration}>{s?.duration || "0"} dk</Text>
                </View>
              </View>
            ))}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Toplam</Text>
              <Text style={styles.totalPrice}>₺{totalPrice?.toFixed(2) || "0.00"}</Text>
            </View>
          </View>

          {/* Notes Card */}
          {appointment?.notes && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Not</Text>
              <Text style={styles.noteText}>{appointment.notes}</Text>
            </View>
          )}

          {/* Cancel Reason Card */}
          {appointment?.cancelReason && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>İptal Sebebi</Text>
              <Text style={styles.cancelReasonText}>{appointment.cancelReason}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <ActionButton
              label="Tamamlandı"
              icon="checkmark-circle"
              onPress={() => openConfirm("complete")}
              disabled={!canAct}
            />
            <ActionButton
              label="Gelinmedi"
              icon="close-circle"
              onPress={() => openConfirm("noshow")}
              disabled={!canAct}
            />
          </View>

          {/* Cancel Section */}
          <View style={styles.cancelBox}>
            <Text style={styles.cardTitle}>Randevu İptali</Text>
            <TextInput
              value={cancelReason}
              onChangeText={setCancelReason}
              placeholder="İptal sebebi yazın..."
              placeholderTextColor="#666"
              style={styles.input}
              multiline
              numberOfLines={3}
            />
            <ActionButton
              label="İptal Et"
              icon="trash"
              onPress={() => openConfirm("cancel")}
              disabled={!canAct}
              danger
            />
          </View>
        </ScrollView>

        <AlertModal
          visible={alertVisible}
          title={alertTitle}
          message={alertMsg}
          onClose={() => setAlertVisible(false)}
          onConfirm={handleConfirm}
          confirmText={
            pendingAction === "complete"
              ? "Tamamlandı"
              : pendingAction === "noshow"
              ? "Gelinmedi"
              : "İptal Et"
          }
          cancelText="Kapat"
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

function ActionButton({
  label,
  icon,
  onPress,
  disabled,
  danger,
}: {
  label: string;
  icon: any;
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
});