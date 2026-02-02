import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function CustomerTabLayout () {
    const colorScheme = useColorScheme();

    const TabIcon = ({ iosName, androidName, size = 28, color = "#D9C9A3" }: { iosName: any; androidName: any; size?: number; color?: string }) =>
        Platform.OS === "ios" ? (
            <IconSymbol size={size} name={iosName} color={color} />
        ) : (
            <Ionicons size={size=22} name={androidName} color={color} />
        );

    return (
        <Tabs
        screenOptions={{
            headerShown: false,
            tabBarStyle: {
                borderTopWidth: 0.2,
                borderTopColor: "rgba(209, 196, 178, 0.2)",
                paddingTop: 0,
                backgroundColor: Colors[colorScheme ?? "dark"].background,
                height: "auto",                 
                position: "absolute",
                overflow: "hidden",                          
                elevation: 0,                   
            },
            tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
            tabBarButton: HapticTab,
        }}
        >
            <Tabs.Screen
            name="[slug]/home"
            options={{
                title: "Ana Sayfa",
                tabBarIcon: () => <TabIcon iosName="house.fill" androidName="home" />,
            }}
            />

            <Tabs.Screen
            name="[slug]/create-appointments"
            options={{
                title: "Randevu Oluştur",
                tabBarIcon: () =>
                Platform.OS === "ios" ? (
                    <IconSymbol
                    style={{ transform: [{ rotate: "270deg" }], marginBottom: 0 }}
                    size={32}
                    name="scissors"
                    color="#D9C9A3"
                    />
                ) : (
                    <Ionicons
                    style={{ transform: [{ rotate: "270deg" }], marginBottom: 0 }}
                    size={30}
                    name="cut"
                    color="#D9C9A3"
                    />
                ),
            }}
            />

            <Tabs.Screen
                name="profile"
                options={{ href: null }}
            />
            <Tabs.Screen
                name="change-password"
                options={{ href: null }}
            />
            
            <Tabs.Screen
                name="appointments"
                options={{
                    title: 'Randevularım',
                    tabBarIcon: () => <TabIcon iosName="comb.fill" androidName="calendar" />,
                }}
            />
        </Tabs>
    );
}
