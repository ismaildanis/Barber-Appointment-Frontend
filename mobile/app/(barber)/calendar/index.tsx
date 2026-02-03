import Spinner from "@/components/ui/Spinner";
import { useGetBarberAppointments } from "@/src/hooks/useAppointmentQuery";
import { Appointment, AppointmentService, statusLabel, statusColor, BarberAppointment } from "@/src/types/appointment";
import { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {LocaleConfig} from "react-native-calendars";

LocaleConfig.locales["tr"] = {
  monthNames: [
    "Ocak","Şubat","Mart","Nisan","Mayıs","Haziran",
    "Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"
  ],
  monthNamesShort: [
    "Oca","Şub","Mar","Nis","May","Haz",
    "Tem","Ağu","Eyl","Eki","Kas","Ara"
  ],
  dayNames: [
    "Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"
  ],
  dayNamesShort: ["Paz","Pts","Sal","Çar","Per","Cum","Cts"],
  today: "Bugün"
};
LocaleConfig.defaultLocale = "tr";

import { Calendar } from "react-native-calendars";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { todayAppointmentsColors } from "@/constants/theme/barber/todayAppt";

type CardProps = { item: BarberAppointment };

const BarberAppointmentCard = ({ item }: CardProps) => {
  const router = useRouter();
  const start = item.appointmentStartAt?.slice(11, 16);
  const end = item.appointmentEndAt?.slice(11, 16);
  const services =
    item.appointmentServices?.map((s: AppointmentService) => s?.name).join(", ") ??
    "Hizmet bilgisi yok";
  const statusBg = statusColor[item.status] || "#a3a3a3";

  return (
    <TouchableOpacity onPress={() => router.replace(`/(barber)/calendar/${item.id}`)} activeOpacity={0.85} style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.time}>{start} - {end}</Text>
        <View style={[styles.badge, { backgroundColor: statusBg }]}>
          <Text style={styles.badgeText}>{statusLabel[item.status] || item.status}</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="person-circle" size={18} color="#d1d5db" />
        <Text style={styles.text} numberOfLines={1}>
          {`${item.customer?.firstName || "Silinmiş"} ${item.customer?.lastName || "Hesap"}`}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="cut-outline" size={18} color="#d1d5db" />
        <Text style={styles.text} numberOfLines={2}>
          {services}
        </Text>
      </View>
      {item.notes ? (
        <View style={styles.infoRow}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fbbf24" />
          <Text style={styles.note} numberOfLines={2}>
            {item.notes}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

export default function BarberCalendar() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const {
    data: appointments,
    isLoading: aLoading,
    isRefetching,
    refetch: refetchAppointments,
  } = useGetBarberAppointments(selectedDate);

  const todayTR = useMemo(
    () =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Istanbul",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(new Date()),
    []
  );

  useEffect(() => {
    if (!selectedDate) setSelectedDate(todayTR);
  }, [selectedDate, todayTR]);

  const keyExtractor = useCallback((item: Appointment) => String(item.id), []);

  if (aLoading) {
    return (
      <View style={styles.loader}>
        <Spinner size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.calendarWrap}>
        <Calendar
          current={selectedDate || todayTR}
          theme={{
            calendarBackground: "#1a1a1a",
            selectedDayBackgroundColor: "#E4D2AC",
            selectedDayTextColor: "#1a1a1a",
            dayTextColor: "#e5e7eb",
            textDisabledColor: "rgba(255,255,255,0.4)",
            monthTextColor: "#f3f3f3",
            arrowColor: "#E4D2AC",
            todayTextColor: "#E4D2AC",
            dotColor: "#E4D2AC",
            textSectionTitleColor: "#9ca3af",
          }}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: "#E4D2AC" },
          }}
        />
      </View>

      <FlatList
        data={appointments}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetchAppointments} />
        }
        keyExtractor={keyExtractor}
        renderItem={({ item }) => <BarberAppointmentCard item={item} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Seçili gün için randevu yok.</Text>
          </View>
        }
        contentContainerStyle={{ paddingVertical: 12, gap: 10 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, padding: 16, justifyContent: "center" },
  container: { flex: 1, padding: 16, backgroundColor: todayAppointmentsColors.containerBackground, marginBottom: 50 },
  calendarWrap: { borderRadius: 16, overflow: "hidden", marginBottom: 12, backgroundColor: "#1a1a1a" },
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
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  text: { color: "#e5e7eb", fontSize: 14, flexShrink: 1 },
  note: { color: "#fbbf24", fontSize: 13, flexShrink: 1 },
  emptyBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
  },
  emptyText: { color: "#ccc" },
});
