import { Appointment, AppointmentService, Status, statusColor, statusLabel } from "@/src/types/appointment";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { View, Text, TouchableOpacity, RefreshControl, FlatList, StyleSheet, Platform, TextInput, Modal } from "react-native";
import Spinner from "../ui/Spinner";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { themeColors } from "@/constants/theme";
import FilterModal from "../ui/FilterModal";
import DateTimePickerModal from "react-native-modal-datetime-picker";

type AdminAppointmentProps = {
  appointments: Appointment[] | undefined;
  loading?: boolean;
  isRefetching: boolean;
  refetch: () => void;
  status: Status;
  setStatus: (status: Status) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
};

export default function AdminAppointments({
  appointments,
  loading,
  status,
  setStatus,
  isRefetching,
  refetch,
  selectedDate,
  setSelectedDate,
}: AdminAppointmentProps) {
  const router = useRouter();
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const statusOptions = Object.entries(statusLabel).map(([value, label]) => ({
    value: value as Status,
    label,
  }));

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', { 
      day: '2-digit', 
      month: 'long',
      year: 'numeric' 
    });
  };

  const handleDateConfirm = (date: Date) => {
    setSelectedDate(date);
    setDatePickerVisible(false);
    refetch();
  };

  const handleToday = () => {
    setSelectedDate(new Date());
    refetch();
  };

  if (loading) return <Spinner />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Randevu</Text>
        
        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setDatePickerVisible(true)}
            style={styles.filterButton}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={18} color={themeColors.primary} />
            <Text style={styles.filterText}>
              {formatDate(selectedDate)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleToday}
            style={styles.filterButton}
            activeOpacity={0.7}
          >
            <Text style={styles.filterText}>
              Bugün
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsStatusModalOpen(true)}
            style={styles.filterButton}
            activeOpacity={0.7}
          >
            <Text style={styles.filterText}>
              {statusLabel[status]}
            </Text>
            <Ionicons name="chevron-down" size={20} color={themeColors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <FilterModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Durum Seçin"
        options={statusOptions}
        selectedValue={status}
        onSelect={setStatus}
      />
      {Platform.OS === "web" ? (
        <Modal visible={isDatePickerVisible} transparent onRequestClose={() => setDatePickerVisible(false)}>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "transparent" }}>
            <View style={{ backgroundColor: "#1e1e1e", padding: 60, borderRadius: 12, borderWidth: 1, borderColor: "#444" }}>
              <Text style={{ color: "#fff", marginBottom: 8}}>Tarih seç</Text>
              <input
                type="date"
                value={selectedDate.toISOString().slice(0, 10)}
                onChange={(e) => {
                  const v = (e.target as HTMLInputElement).value;
                  if (v) handleDateConfirm(new Date(v + "T00:00:00"));
                }}
                style={{ backgroundColor: "#E4D2AC", borderWidth: 1, borderColor: "#fff", padding: 8, borderRadius: 6 }}
              />
              <TouchableOpacity onPress={() => setDatePickerVisible(false)} style={{ marginTop: 20, backgroundColor: "#444", padding: 8, borderRadius: 6 }}>
                  <Text style={{ color: "#fff", alignSelf: "center" }}>Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      ) : (
        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleDateConfirm}
          onCancel={() => setDatePickerVisible(false)}
          date={new Date(selectedDate)}
          locale="tr_TR"
          confirmTextIOS="Onayla"
          cancelTextIOS="İptal"
        />
      )}
      <FlatList
        data={appointments}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={themeColors.primary}
            colors={[themeColors.primary]}
          />
        }
        contentContainerStyle={{ paddingBottom: 150 }}
        renderItem={({ item }) => {
          const start = item.appointmentStartAt?.slice(0, 16).replace("T", " ");
          const end = item.appointmentEndAt?.slice(11, 16);
          const services =
            item.appointmentServices
              ?.map((s: AppointmentService) => s.name)
              .join(", ") || "—";

          return (
            <TouchableOpacity
              onPress={() => {
                router.replace({
                pathname: "/(admin)/(tabs)/dashboard/[id]",
                  params: { id: String(item.id) },
                });
              }}
              style={styles.card}
            >
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={styles.cardTitle}>
                  {item.barber?.firstName} {item.barber?.lastName}
                </Text>
                <Text style={styles.meta}>
                  {start} {end ? `- ${end}` : ""}
                </Text>
                <Text style={styles.meta}>
                  Durum:{" "}
                  <Text style={{ color: statusColor[item.status] }}>
                    {statusLabel[item.status] || item.status}
                  </Text>
                </Text>
                {item.status === "CANCELLED" ? (
                  <Text style={styles.note}>
                    İptal sebebi: {item.cancelReason ? item.cancelReason : "Belirtilmedi"}
                  </Text>
                ) : null}
                <Text style={styles.meta}>Hizmetler: {services}</Text>
                {item.notes ? <Text style={styles.note}>Not: {item.notes}</Text> : null}
              </View>
              <View style={styles.detailBadge}>
                <Ionicons name="chevron-forward" size={18} color="#121212" />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#12121245",
    paddingBlockEnd: 105,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: themeColors.text,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: themeColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: themeColors.border,
    flexShrink: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: themeColors.primary,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: themeColors.surface,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: themeColors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: themeColors.text,
  },
  meta: {
    fontSize: 13,
    color: themeColors.textMuted,
  },
  note: {
    marginTop: 3,
    fontSize: 12,
    color: themeColors.warning,
  },
  detailBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: themeColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});