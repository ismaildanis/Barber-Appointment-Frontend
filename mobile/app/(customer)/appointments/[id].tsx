import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useGetCustomerOneAppointment,
  useCancelCustomerAppointment,
} from "@/src/hooks/useAppointmentQuery";
import { statusLabel, statusColor, AppointmentService } from "@/src/types/appointment";
import Spinner from "@/components/ui/Spinner";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { AlertModal } from "@/components/ui/AlertModal";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { myColors } from "@/constants/theme";

type AlertMode = "confirm" | "info-success" | "info-error";

export default function AppointmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const apptId = Number(id);
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useGetCustomerOneAppointment(apptId);
  const cancelMutation = useCancelCustomerAppointment(apptId);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMode, setAlertMode] = useState<AlertMode>("info-success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  if (isLoading) return <View style={styles.container}><Spinner size="large" /></View>;
  if (isError || !data) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Randevu yükleme hatası. Lütfen sayfayı yenileyiniz.
        </Text>
      </View>
    );
  }
  const services = data.appointmentServices?.map((s: AppointmentService) => s?.name) || [];
  const totalPrice = data.appointmentServices?.reduce((sum, s) => sum + parseFloat(s.price), 0) || 0;
  const totalDuration = data.appointmentServices?.reduce((sum, s) => sum + s.duration, 0) || 0;
  
  const fmtTR = (iso?: string, withTime = true) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("tr-TR", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: withTime ? "2-digit" : undefined,
      minute: withTime ? "2-digit" : undefined,
    });
  };
  const startFull = data.appointmentStartAt.slice(11, 16).replace("T", " ");
  const endOnly = data.appointmentEndAt?.slice(11, 16);
  const fullDate = data.appointmentStartAt.slice(0, 10);
  const created = fmtTR(data.createdAt);
  const updated = fmtTR(data.updatedAt);
  const canCancel = data.status === "SCHEDULED";

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] ?? "B"}${lastName?.[0] ?? ""}`.toUpperCase();
  };

  const onClick = () => {
    setAlertTitle("Uyarı");
    setAlertMsg("Randevunuzu iptal etmek istediğinizden emin misiniz?");
    setAlertMode("confirm");
    setAlertVisible(true);
  };

  const onSubmit = () => {
    cancelMutation.mutate(undefined, {
      onSuccess: () => {
        setAlertTitle("Randevu İptali Başarılı");
        setAlertMsg("Randevunuzu iptal ettiniz. Yeni randevunuzu Randevu Oluştur sayfasından alabilirsiniz");
        setAlertMode("info-success");
        setAlertVisible(true);
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || "Randevu İptal Edilemedi.";
        setAlertTitle("Hata");
        setAlertMsg(msg);
        setAlertMode("info-error");
        setAlertVisible(true);
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace("/(customer)/appointments")}
        >
          <Ionicons name="arrow-back" size={22} color="#E4D2AC" />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Randevu Detayı</Text>

        {/* Barber Card */}
        <View style={styles.cardShadow}>
          <BlurView intensity={40} tint="dark" style={styles.cardBlur}>
            <LinearGradient
              colors={myColors.mainBackgroundGradient}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.barberCard}
            >
              {/* Avatar */}
              <LinearGradient
                colors={["#C8AA7A", "#E4D2AC"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {getInitials(data.barber?.firstName, data.barber?.lastName)}
                </Text>
              </LinearGradient>

              {/* Barber Info */}
              <View style={styles.barberInfo}>
                <Text style={styles.barberName}>
                  {data.barber?.firstName} {data.barber?.lastName}
                </Text>
                <Text style={styles.shopName}>{data.shop?.name}</Text>
              </View>

              {/* Status Badge */}
              <View style={[styles.statusBadge, { backgroundColor: statusColor[data.status] }]}>
                <Text style={styles.statusText}>{statusLabel[data.status] || data.status}</Text>
              </View>
            </LinearGradient>
          </BlurView>
        </View>

        {/* Date & Time Card */}
        <View style={styles.cardShadow}>
          <BlurView intensity={40} tint="dark" style={styles.cardBlur}>
            <View style={styles.infoCard}>
              <Text style={styles.infoHeaderText}>Tarih ve Saat</Text>
              
              <View style={styles.dateTimeRow}>
                <View style={styles.dateTimeItem}>
                  <Text style={styles.dateTimeLabel}>TARİH</Text>
                  <Text style={styles.dateTimeValue}>{fullDate}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.dateTimeItem}>
                  <Text style={styles.dateTimeLabel}>SAAT</Text>
                  <Text style={styles.dateTimeValue}>
                    {startFull} - {endOnly}
                  </Text>
                </View>
              </View>

              <Text style={styles.durationText}>Süre: {totalDuration} dakika</Text>
            </View>
          </BlurView>
        </View>

        {/* Services Card */}
        <View style={styles.cardShadow}>
          <BlurView intensity={40} tint="dark" style={styles.cardBlur}>
            <View style={styles.infoCard}>
              <Text style={styles.infoHeaderText}>Hizmetler</Text>

              {services.map((service, index) => (
                <View key={index} style={styles.serviceItem}>
                  <View style={styles.serviceBullet} />
                  <View style={styles.serviceContent}>
                    <Text style={styles.serviceName}>{service}</Text>
                    <View style={styles.serviceDetails}>
                      <Text style={styles.servicePrice}>
                        ₺{data.appointmentServices?.[index]?.price}
                      </Text>
                      <Text style={styles.serviceDuration}>
                        {data.appointmentServices?.[index]?.duration} dk
                      </Text>
                    </View>
                  </View>
                </View>
              ))}

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Toplam Tutar</Text>
                <Text style={styles.totalPrice}>₺{totalPrice.toFixed(2)}</Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Notes Card */}
        {data.notes && (
          <View style={styles.cardShadow}>
            <BlurView intensity={40} tint="dark" style={styles.cardBlur}>
              <View style={styles.infoCard}>
                <Text style={styles.infoHeaderText}>Not</Text>
                <Text style={styles.noteText}>{data.notes}</Text>
              </View>
            </BlurView>
          </View>
        )}

        {/* Cancel Reason Card */}
        {data.status === "CANCELLED" && data.cancelReason && (
          <View style={styles.cardShadow}>
            <BlurView intensity={40} tint="dark" style={styles.cardBlur}>
              <View style={styles.infoCard}>
                <Text style={styles.infoHeaderText}>İptal Sebebi</Text>
                <Text style={styles.cancelReasonText}>{data.cancelReason}</Text>
              </View>
            </BlurView>
          </View>
        )}

        {/* Metadata Card */}
        <View style={styles.metaCard}>
          <Text style={styles.metaText}>Oluşturulma: {created}</Text>
          <Text style={styles.metaText}>Güncellenme: {updated}</Text>
        </View>

        {/* Cancel Button */}
        {canCancel && (
          <TouchableOpacity
            onPress={onClick}
            style={styles.btnDanger}
            disabled={cancelMutation.isPending}
          >
            <Text style={styles.btnText}>
              {cancelMutation.isPending ? "İptal ediliyor..." : "Randevuyu İptal Et"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMsg}
        onClose={() => setAlertVisible(false)}
        onConfirm={() => {
          if (alertMode === "confirm") {
            setAlertVisible(false);
            onSubmit();
          } else {
            setAlertVisible(false);
            if (alertMode === "info-success") router.back();
          }
        }}
        confirmText={
          alertMode === "confirm"
            ? "Randevuyu iptal Et"
            : alertMode === "info-success"
            ? "Randevularım"
            : "Tamam"
        }
        cancelText="Kapat"
      />
    </SafeAreaView>
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
    gap: 16,
  },

  backBtn: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#1e1e1e",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.3,
    marginBottom: 4,
  },

  errorText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    padding: 20,
  },

  // Card Styles
  cardShadow: {
    borderRadius: 18,
    overflow: "visible",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },

  cardBlur: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  // Barber Card
  barberCard: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
  },

  barberInfo: {
    flex: 1,
    gap: 4,
  },

  barberName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },

  shopName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#D9C9A3",
  },

  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },

  statusText: {
    color: "#0f0f0f",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.3,
  },

  // Info Card
  infoCard: {
    padding: 16,
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  infoHeaderText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(217, 201, 163, 0.2)",
  },

  // Date & Time
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  dateTimeItem: {
    flex: 1,
    gap: 6,
  },

  dateTimeLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#A8A8A8",
    letterSpacing: 0.8,
  },

  dateTimeValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },

  divider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(217, 201, 163, 0.2)",
  },

  durationText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#B0B0B0",
  },

  // Services
  serviceItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 8,
  },

  serviceBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D9C9A3",
    marginTop: 8,
  },

  serviceContent: {
    flex: 1,
    gap: 4,
  },

  serviceName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },

  serviceDetails: {
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
    color: "#A8A8A8",
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(217, 201, 163, 0.2)",
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },

  totalPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: "#D9C9A3",
    letterSpacing: 0.3,
  },

  // Notes
  noteText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#E0E0E0",
    lineHeight: 20,
  },

  cancelReasonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ff9999",
    lineHeight: 20,
  },

  // Metadata
  metaCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    gap: 6,
  },

  metaText: {
    fontSize: 12,
    color: "#A8A8A8",
    fontWeight: "500",
  },

  // Cancel Button
  btnDanger: {
    marginTop: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#ef4444",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  btnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});