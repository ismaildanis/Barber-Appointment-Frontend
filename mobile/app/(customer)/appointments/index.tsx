import { useGetCustomerAppointments } from "@/src/hooks/useAppointmentQuery";
import { AppointmentService, Appointment, statusLabel, statusColor, AppointmentRange, rangeLabels } from "@/src/types/appointment";
import Spinner from "@/components/ui/Spinner";
import { FlatList, View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import FilterModal from "@/components/ui/FilterModal";
import { useIsAuthenticated } from "@/src/hooks/useUnifiedAuth";

export default function CustomerAppointments() {
  const [selectedRange, setSelectedRange] = useState<AppointmentRange>("today");
  const [isOpen, setIsOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { isAuthenticated } = useIsAuthenticated();

  const { data, isLoading, isError, isRefetching, refetch } = useGetCustomerAppointments(selectedRange, isAuthenticated);
  const router = useRouter();

  const filterOptions = Object.entries(rangeLabels).map(([value, label]) => ({
    value: value as AppointmentRange,
    label,
  }));

  useEffect(() => {
    if (isError && retryCount >= 3 && selectedRange !== 'today') {
      setSelectedRange('today');
      setRetryCount(0);
    }
  }, [isError, retryCount, selectedRange]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Randevularım</Text>
        <View style={styles.loadingContainer}>
          <Spinner size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Randevularım</Text>
        <ScrollView  refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}>
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="alert-circle-outline" size={40} color="#ff6b6b" />
            </View>
            <Text style={styles.emptyTitle}>Bir Hata Oluştu</Text>
            <Text style={styles.emptyDescription}>
              Randevularınız yüklenirken bir sorun oluştu. Lütfen sayfayı yenileyiniz.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Randevularım</Text>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="lock-closed-outline" size={40} color="#E4D2AC" />
          </View>
          <Text style={styles.emptyTitle}>Giriş Yapın</Text>
          <Text style={styles.emptyDescription}>
            Randevularınızı görmek için lütfen giriş yapın.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.retryButtonText}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!data || data.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Randevularım</Text>
          <TouchableOpacity
            onPress={() => setIsOpen(true)}
            style={styles.filterButton}
            activeOpacity={0.7}
          >
            <Text style={styles.filterButtonText}>
              {rangeLabels[selectedRange]}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#E4D2AC" />
          </TouchableOpacity>
        </View>

        <FilterModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Tarih Aralığı"
          options={filterOptions}
          selectedValue={selectedRange}
          onSelect={setSelectedRange}
        />

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="calendar-outline" size={40} color="#E4D2AC" />
          </View>
          <Text style={styles.emptyTitle}>Randevu Bulunamadı</Text>
          <Text style={styles.emptyDescription}>
            {selectedRange === 'today' 
              ? 'Bugün için randevunuz bulunmuyor.'
              : `${rangeLabels[selectedRange]} aralığında randevunuz bulunmuyor.`}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={18} color="#1E1E1E" />
            <Text style={styles.retryButtonText}>Yenile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Randevularım</Text>
        <TouchableOpacity
          onPress={() => setIsOpen(true)}
          style={styles.filterButton}
          activeOpacity={0.7}
        >
          <Text style={styles.filterButtonText}>
            {rangeLabels[selectedRange]}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#E4D2AC" />
        </TouchableOpacity>
      </View>

      <FilterModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Tarih Aralığı"
        options={filterOptions}
        selectedValue={selectedRange}
        onSelect={setSelectedRange}
      />

      <FlatList
        data={data as Appointment[]}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl 
            refreshing={isRefetching} 
            onRefresh={refetch}
            tintColor="#E4D2AC"
            colors={["#E4D2AC"]}
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => {
          const start = item.appointmentStartAt?.slice(0, 16).replace("T", " ");
          const end = item.appointmentEndAt?.slice(11, 16);
          const services =
            item.appointmentServices
              ?.map((s: AppointmentService) => s?.name)
              .join(", ") || "—";

          return (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(customer)/appointments/[id]",
                  params: { id: String(item.id) },
                })
              }
              style={styles.card}
              activeOpacity={0.8}
            >
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={styles.cardTitle}>
                  {item.barber?.firstName} {item.barber?.lastName}
                </Text>
                <Text style={styles.meta}>
                  {start} {end ? `- ${end}` : ""}
                </Text>
                <Text style={[styles.meta, { color: statusColor[item.status] }]}>
                  Durum: {statusLabel[item.status] || item.status}
                </Text>
                {item.status === "CANCELLED" || item.status === "BARBER_CANCELLED" &&  (
                  <Text style={styles.note}>
                    İptal sebebi: {item.cancelReason || "Belirtilmedi"}
                  </Text>
                )}
                <Text style={styles.meta}>İşletme: {item.shop?.name || "Bilinmiyor"}</Text>
                <Text style={styles.meta}>Hizmetler: {services}</Text>
                {item.notes && <Text style={styles.note}>Not: {item.notes}</Text>}
              </View>
              <View style={styles.detailBadge}>
                <Ionicons name="chevron-forward" size={18} color="#1E1E1E" />
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
    backgroundColor: "#121212",
    paddingHorizontal: 16,
    paddingBottom: 70,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(228, 210, 172, 0.2)",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E4D2AC",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    marginTop: 80,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(228, 210, 172, 0.2)",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#E4D2AC",
    borderRadius: 10,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E1E1E",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  meta: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
  },
  note: {
    fontSize: 12,
    color: "#f3d9a4",
  },
  detailBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E4D2AC",
    alignItems: "center",
    justifyContent: "center",
  },
});