import { Button, FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useBarberStore } from "@/src/store/barberStore";
import { useGetBarbers } from "@/src/hooks/useBarberQuery";
import { useLocalSearchParams, useRouter } from "expo-router";
import Spinner from "@/components/ui/Spinner";
import BarberList from "@/components/customer/BarberList";
import Barbers from "@/components/appointments/Barbers";
import { useRef } from "react";

export default function SelectBarber() {
    const router = useRouter();
    const { slug } = useLocalSearchParams<{ slug: string }>();
    const { data: barbers, isLoading, refetch, error } = useGetBarbers(slug);
    const { barberId, setBarberId } = useBarberStore();
    
    const hideIdsRef = useRef<number>(barberId);

    const onCancel = () => {
        setBarberId(hideIdsRef.current);
        router.back();
    };
    const onSelect = (id: number) => {
        setBarberId(id);
        router.back();
    };

    if (isLoading || !barbers) return <Spinner size={"large"}/>

    return (
        <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: "#121212" }}>
            
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={() => {refetch()}}
                    />
                }
            >
            <Barbers 
                barbers={barbers} 
                loading={isLoading} 
                selectedBarber={barberId ?? undefined} 
                onSelect={onSelect} 
            />
            
            </ScrollView>

                <TouchableOpacity
                    onPress={onCancel}
                    style={{ marginTop: 10, padding: 14, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.12)" }}
                >
                    <Text style={{ color: "#fff", textAlign: "center", fontWeight: "700" }}>
                    İptal
                    </Text>
                </TouchableOpacity>

            <View style={{ padding: 30 }}>

            </View>
            
        </SafeAreaView>
    )

}