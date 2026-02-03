import { BarberAppointment } from "@/src/types/appointment";
import { useRouter } from "expo-router";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Spinner from "@/components/ui/Spinner";
import { statusLabel, statusColor, AppointmentService } from "@/src/types/appointment";
import { Ionicons } from "@expo/vector-icons";

type Today = {
    todayAppointments?: BarberAppointment[] | null
    loading?: boolean 
}

export default function TodayAppointmentCard({ todayAppointments, loading }: Today) {
    
    const router = useRouter();
    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Spinner size="large" />
            </View>
        );
    }

    if (!todayAppointments?.length) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Text style={styles.empty}>Bugün için randevu bulunamadı.</Text>
            </View>
        );
    }
    return (
        <View style={{ flex: 1, gap: 16, marginBottom: 40 }}>

        {todayAppointments!.map((item) => {
            const timeRange = `${item.appointmentStartAt?.slice(11, 16)} - ${item.appointmentEndAt?.slice(11, 16)}`;
            const services =
              item.appointmentServices?.map((s: AppointmentService) => s?.name).join(", ") || "Hizmet bilgisi yok";

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() =>
                  router.push({
                    pathname: "/(barber)/calendar/[id]",
                    params: { id: String(item.id) },
                  })
                }
                style={styles.card}
                activeOpacity={0.8}
              >
                <View style={styles.rowBetween}>
                  <Text style={styles.time}>{timeRange}</Text>
                  <View style={[styles.badge, { backgroundColor: statusColor[item.status] || "#a3a3a3" }]}>
                    <Text style={styles.badgeText}>{statusLabel[item.status] || item.status}</Text>
                  </View>
                </View>
                <Text style={styles.name} numberOfLines={1}>
                  {`${item.customer?.firstName || "Silinmiş"} ${item.customer?.lastName || "Hesap"}`}
                </Text>
                <Text style={styles.meta} numberOfLines={2}>
                  {services}
                </Text>
                {item.notes ? <Text style={styles.note}>Not: {item.notes}</Text> : null}
                <View style={styles.detailRow}>
                  <Text style={styles.detailText}>Detay</Text>
                  <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
                </View>
              </TouchableOpacity>
            );
          })
        }
        </View>
    );
}


const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: "#0f0f0f", justifyContent: "center" },
  empty: { color: "#ccc" },
  summary: {
    flexDirection: "row",
    gap: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  summaryText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  card: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    gap: 6,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  time: { fontSize: 16, fontWeight: "700", color: "#fff" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgeText: { color: "#0f0f0f", fontWeight: "800", fontSize: 12 },
  name: { fontSize: 15, fontWeight: "700", color: "#fff" },
  meta: { fontSize: 13, color: "rgba(255,255,255,0.85)" },
  note: { fontSize: 12, color: "#fbbf24" },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  detailText: { color: "#d1d5db", fontSize: 13, fontWeight: "700" },
});