import Dates from "@/components/appointments/Dates";
import Hours from "@/components/appointments/Hours";
import Space from "@/components/appointments/Space";
import Spinner from "@/components/ui/Spinner";
import { myColors } from "@/constants/theme";
import { FontAwesome5  } from "@expo/vector-icons";
import { useAvailableDatesForAppointment, useAvailableHoursForAppointment, useCreateAppointment } from "@/src/hooks/useAppointmentQuery";
import { useGetBarbers } from "@/src/hooks/useBarberQuery";
import { useGetServices } from "@/src/hooks/useServiceQuery";
import { useBarberStore } from "@/src/store/barberStore";
import { useServiceStore } from "@/src/store/serviceStore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { RefreshControl, TouchableOpacity, ScrollView, Text, ImageBackground, Image, View, TextInput, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppointmentSummary from "@/components/appointments/AppointmentSummary";
import { AlertModal } from "@/components/ui/AlertModal";
import { useShopStore } from "@/src/store/useShopStore";

type AlertMode = "confirm" | "info-success" | "info-error";

export default function CreateAppointments() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const { barberId, setBarberId } = useBarberStore();
  const { serviceIds, setServiceIds } = useServiceStore();
  
  const [selectedDate, setSelectedDate] = useState<string>();
  const [selectedHour, setSelectedHour] = useState<string>();
  const { activeShopSlug } = useShopStore();

  const safeBarberId = barberId ?? undefined;
  const { data: services, isLoading: sLoading, refetch: refetchServices } = useGetServices(activeShopSlug ?? ""); 
  const { data: barbers, isLoading: bLoading, refetch: refetchBarbers } = useGetBarbers(activeShopSlug ?? "");

  const { data: availableDates, isLoading: adLoading, refetch: refetchAvailableDates } = useAvailableDatesForAppointment();
  const { data: availableHours, isLoading: ahLoading, refetch: refetchAvailableHours } = useAvailableHoursForAppointment(safeBarberId, selectedDate);
  const createAppointment = useCreateAppointment();

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMode, setAlertMode] = useState<AlertMode>("info-success");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [notes, setNotes] = useState<string>();
  const loading = sLoading || bLoading  || adLoading || ahLoading; 

  useEffect(() => {
    barbers?.forEach(b => Image.prefetch(b.image as string));
  }, [barbers]);

  useEffect(() => {
    setBarberId(null);
  }, [activeShopSlug]);

  useEffect(() => {
    if (!selectedDate && availableDates?.length) {
      setSelectedDate(availableDates[0]);
    }
    
  }, [availableDates, selectedDate]);

  useEffect(() => {
    if (!barberId && barbers?.length) {
      setBarberId(barbers[0].id)
    }
  }, [barbers, barberId]);

  const onSelect = () => {
    setSelectedHour(undefined);
    router.push(`/(customer)/${activeShopSlug}/create-appointments/select-service`);
  }

  const onClick = () => {
    setAlertTitle("Uyarı");
    setAlertMsg("Randevu oluşturmak istediğinizden emin misiniz?");
    setAlertMode("confirm");
    setAlertVisible(true);
  };

  const onSubmit = () => {
    if (!selectedDate || !barberId || !serviceIds || !selectedHour) return alert("Lütfen gerekli alanları doldurun.");
    createAppointment.mutate({ 
      barberId,
      serviceIds,
      notes,
      appointmentStartAt: `${selectedDate}T${selectedHour}`,
    }, {
      onSuccess: (data) => { ;
        setSelectedDate(undefined);
        setBarberId(null);
        setServiceIds([]);
        setSelectedHour(undefined);
        setNotes(undefined);
        setAlertTitle("Randevunuz Oluşturuldu");
        setAlertMsg("Randevunuz oluşturuldu. Randevu detaylarını Randevularım sayfasından kontrol edebilirsiniz.");
        setAlertMode("info-success");
        setAlertVisible(true);
        
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message || err?.message || "Randevu oluşturulamadı.";
        setAlertTitle("Hata");
        setAlertMsg(msg);
        setAlertMode("info-error");
        setAlertVisible(true);
      },
    }
   );

  };


  const selectedServices = services?.filter((s) => serviceIds.includes(s.id)) ?? [];
  const totalDuration = selectedServices.reduce((sum, s) => sum + (s.duration ?? 0), 0);
  const totalPrice = selectedServices.reduce((sum, s) => sum + parseFloat((s.price ?? 0)), 0);

  const selected = barbers?.find((b) => b.id === barberId);
  const others = barbers?.filter((b) => b.id !== barberId) ?? [];
  const display = [
    ...(selected ? [selected] : []),
    ...others.slice(0, 1), 
  ];
  const remaining = others.length - 1;
  const onSelectDate = (date: string) => {
    setSelectedHour(undefined);
    setSelectedDate(date);
  }
  const toggleHours = (hour: any) =>
    setSelectedHour((prev) => (prev === hour) ? undefined : hour);
    
  const hero = barbers?.find((b) => b.id === barberId)?.image;
  const heroSource = hero ? { uri: hero, cache: "force-cache" } : require("@/assets/images/default-service.png"); 

  if (!availableDates) return <Spinner />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#121212" }}>
     
      {/* Hero foto */}
      <View style={{ height: height * 0.3, width: '100%' }}>
        <ImageBackground 
          source={heroSource}
          style={{ flex: 1, marginHorizontal: 20 }}
          resizeMode="contain"
        >
          <TouchableOpacity
            onPress={() => router.push(`/(customer)/${activeShopSlug}/create-appointments/select-barber`)}
            activeOpacity={0.9}
            style={{
              position: 'absolute',
              bottom: 15,
              right: 15,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(18, 18, 18, 0.75)',
              padding: 6,
              paddingLeft: 12,
              borderRadius: 25,
              borderWidth: 1,
              borderColor: '#D1C4B2',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ paddingLeft: 4 }}>
                <FontAwesome5 name="sync-alt" size={15} color="#D1C4B2" />
              </View>
              
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
                {remaining > 0 && (
                  <View style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#D1C4B2',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: '#121212',
                    marginLeft: -12,
                    zIndex: 1,
                    elevation: 3,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 2,
                  }}>
                    <Text style={{ color: '#121212', fontSize: 11, fontWeight: '800' }}>
                      +{remaining}
                    </Text>
                  </View>
                )}

                {display?.map((b, index) => (
                  <View 
                    key={b.id} 
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor: '#121212',
                      marginLeft: index === display.length - 1 ? 0 : -12,
                      overflow: 'hidden',
                      backgroundColor: '#1C1E22',
                      zIndex: (display.length - index) + 2,
                    }}
                  >
                    <Image 
                      source={{ uri: b.image }} 
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover" 
                    />
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </ImageBackground>
      </View>

        <View
          style={{
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            padding: 20,
            paddingTop: 32,        
            backgroundColor: "#121212",
          }}
        >
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={loading}
                onRefresh={() => {
                  refetchServices();
                  refetchBarbers();
                  refetchAvailableDates();
                  refetchAvailableHours();
                }}
              />
            }
            contentContainerStyle={{ paddingBottom: height * 0.25 }}
            showsVerticalScrollIndicator={false}
          > 

          
            <View style={{ flexDirection: "row", justifyContent:"space-between", alignItems: "center", gap: 8, paddingHorizontal: 8 }}>
              <Text style={{ fontWeight: "700", fontSize: 28, color: "#fff" }}>Berber:</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Text style={{ fontWeight: "700", fontSize: 28, color: "#fff" }}>{`${selected?.firstName}`}</Text>
                <Text style={{ fontWeight: "700", fontSize: 28, color: "#fff" }}>{`${selected?.lastName}`}</Text>
              </View>
            </View>

            <View
              style={{
                marginTop: 12,
                height: 1,
                backgroundColor: "#E4D2AC",
                width: "100%",
                opacity: 0.7,
              }}
            />

            <Dates
              dates={availableDates ?? []}
              loading={adLoading}
              selectedDate={selectedDate}
              onSelect={onSelectDate}
            />

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onSelect}
              style={{ marginTop: 20, borderRadius: 16, overflow: "hidden" }}
            >
              <LinearGradient
                colors={myColors.mainBackgroundGradient2}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "#E4D2AC",
                }}
              >
                <Text style={{ color: "#1b1b1b", fontSize: 16, fontWeight: "700" }}>Hizmet Seç</Text>
                {selectedServices.length === 0 ? (
                  <Text style={{ color: "rgba(27,27,27,0.75)", marginTop: 6 }}>Henüz hizmet seçilmedi</Text>
                ) : (
                  <>
                    <Text style={{ color: "#1b1b1b", marginTop: 6 }}>
                      {selectedServices.length} hizmet · {totalDuration} dk · {totalPrice} ₺
                    </Text>
                    {selectedServices.slice(0, 3).map((s) => (
                      <Text key={s.id} style={{ color: "rgba(27,27,27,0.85)", marginTop: 4 }}>
                        • {s.name} ({s.duration} dk)
                      </Text>
                    ))}
                    {selectedServices.length > 3 && (
                      <Text style={{ color: "rgba(27,27,27,0.65)", marginTop: 4 }}>
                        +{selectedServices.length - 3} daha
                      </Text>
                    )}
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>


            <Hours
              hours={availableHours ?? []}
              durationMinutes={totalDuration}
              loading={ahLoading}
              selectedHour={selectedHour}
              onSelect={toggleHours}
            />

            {selectedServices.length > 0 && selectedHour && barberId && (
              <View
                style={{
                  marginTop: 20,
                  padding: 12,
                  borderRadius: 16,
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderColor: "rgba(255,255,255,0.12)",
                  borderWidth: 1,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#fff", marginBottom: 8 }}>
                  Not (isteğe bağlı)
                </Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  placeholder="Berber için not bırakabilirsiniz"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  style={{
                    fontSize: 15,
                    color: "#f3f3f3",
                    minHeight: 80,
                    textAlignVertical: "top",
                  }}
                />
              </View>
            )}
          {selectedServices.length > 0 && selectedHour && barberId &&
            <AppointmentSummary
              date={selectedDate}
              time={selectedHour}
              barberName={`${barbers?.find(b => b.id === barberId)?.firstName} ${barbers?.find(b => b.id === barberId)?.lastName}`}
              services={selectedServices.map(s => ({ name: s.name, price: Number(s.price), duration: s.duration }))}
              totalPrice={totalPrice}
              totalDuration={totalDuration}
            />
          }
          {selectedServices.length > 0 && selectedHour && barberId &&
          <TouchableOpacity
            onPress={onClick}
            activeOpacity={0.8}
            disabled={createAppointment.isPending}
            style={{
              marginTop: 20,
              borderRadius: 24,
              overflow: "hidden",
              opacity: createAppointment.isPending ? 0.7 : 1
            }}
          >
            <LinearGradient
              colors={
                createAppointment.isPending 
                ? ["rgba(210, 201, 163, 0.7)", "rgba(228, 210, 172, 0.7)"] 
                : ["#C8AA7A", "#E4D2AC"]
              }
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                paddingVertical: 20,
                paddingHorizontal: 20,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#121212",
                  textAlign: "center",
                  fontWeight: "800",
                  fontSize: 16,
                  letterSpacing: 0.5,
                }}
              >
                {createAppointment.isPending ? "Randevu Oluşturuluyor..." : "Randevu Oluştur"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          }
            <Space />
        </ScrollView>
        </View>
        <AlertModal
          visible={alertVisible}
          title={alertTitle}
          message={alertMsg}
          onClose={() => {
            setAlertVisible(false);
            if (alertMode === "info-success") router.replace("/(customer)/appointments");
          }}
          onConfirm={() => {
            if (alertMode === "confirm") {
              setAlertVisible(false);
              onSubmit();
            } else {
              setAlertVisible(false);
              if (alertMode === "info-success") router.push("/(customer)/appointments");
            }
          }}
        confirmText={
          alertMode === "confirm"
            ? "Oluştur"
            : alertMode === "info-success"
            ? "Randevularıma Git"
            : "Tamam"
        }          
        cancelText="Kapat"
        />
    </SafeAreaView>
  );
}

