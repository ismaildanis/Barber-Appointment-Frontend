import { FlatList, RefreshControl, StyleSheet, View, TouchableOpacity, Alert } from "react-native";
import ShopHeader from "@/components/customer/ShopHeader";
import ServiceList from "@/components/customer/ServiceList";
import BarberList from "@/components/customer/BarberList";
import Spinner from "@/components/ui/Spinner";
import { useGetServices } from "@/src/hooks/useServiceQuery";
import { useGetBarbers } from "@/src/hooks/useBarberQuery";
import { useUnifiedMe } from "@/src/hooks/useUnifiedAuth";
import { SafeAreaView } from "react-native-safe-area-context";
import LastAppointmentCard from "@/components/appointments/LastAppointmentCard";
import { useGetCustomerLastAppointment, useGetCustomerScheduledAppointment } from "@/src/hooks/useAppointmentQuery";
import { myColors } from "@/constants/theme";
import { useEffect, useState } from "react";
import ScheduledAppointment from "@/components/appointments/ScheduledAppointment";
import { useRouter } from "expo-router";
import { useGetShops } from "@/src/hooks/useShopQuery";
import { useShopStore } from "@/src/store/useShopStore";


export default function CustomerHome() {
  const router = useRouter();
  const { data: shops, isLoading: lLoading, refetch: refetchShops } = useGetShops();
  const { activeShopSlug, setActiveShop } = useShopStore();

  useEffect(() => {
    if (!activeShopSlug && shops && shops.length > 0) {
      const defaultSlug = shops[0].slug;
      setActiveShop(defaultSlug);
      router.replace(`/(customer)/${defaultSlug}/home`);
    } else if (shops?.length === 0){
      Alert.alert("Henüz bir işletme yok", "Şuan bir işletme yok. En yakın zamanda bir işletme eklenecektir.", [
        { text: "Kapat", onPress: () => router.replace(`/(auth)/login`) },
        { text: "Tamam", onPress: () => router.replace(`/(auth)/login`) },
      ]);
    }
  }, [shops, activeShopSlug]);

  const safeSlug = activeShopSlug ?? ""

  const { data: services, isLoading: sLoading, refetch: refetchServices } = useGetServices(safeSlug);
  const { data: barbers, isLoading: bLoading, refetch: refetchBarbers } = useGetBarbers(safeSlug);
  const { data: me, isLoading: meLoading, refetch: refetchMe } = useUnifiedMe();
  const { data: lastAppt, isLoading: lastLoading, refetch: refetchLastAppt } = useGetCustomerLastAppointment();
  const { data: ScheduledAppt, isLoading: ScheduledLoading, refetch: refetchScheduledAppt } = useGetCustomerScheduledAppointment();

  const loading = sLoading || bLoading || meLoading || lastLoading || ScheduledLoading || lLoading;
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  if (!me) return <Spinner />;

  const onRefresh = () => {
    refetchServices();
    refetchBarbers();
    refetchMe();
    refetchLastAppt();
    refetchScheduledAppt();
    refetchShops();
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: myColors.mainBackground }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ShopHeader shops={shops} />

        <FlatList
          data={["spacer"]}
          keyExtractor={(item) => item}
          renderItem={() => null}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
          ListHeaderComponent={
            loading ? (
              <Spinner />
            ) : (
              <View style={styles.container}>
                <TouchableOpacity onPress={() => router.push(`/(customer)/appointments/${ScheduledAppt?.id}`)}>
                  <ScheduledAppointment scheduledAppt={ScheduledAppt} loading={lastLoading} />
                </TouchableOpacity>
                <LastAppointmentCard lastAppt={lastAppt} loading={lastLoading} />
                <ServiceList services={services ?? []} loading={sLoading} />
                <BarberList barbers={barbers ?? []} loading={bLoading} />
              </View>
            )
          }
        />
      </SafeAreaView>
    </View>
  );
}
export const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 40,
    overflow: "hidden",
  }
});