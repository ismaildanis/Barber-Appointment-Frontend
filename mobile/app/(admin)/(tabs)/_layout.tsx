import { Tabs } from "expo-router";
import React from "react";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AdminTabLayout() {
  const colorScheme = useColorScheme();

  const TabIcon = ({
    iosName,
    androidName,
    size = 28,
    color = "#D1C4B2",
  }: {
    iosName: any;
    androidName: any;
    size?: number;
    color?: string;
  }) =>
    Platform.OS === "ios" ? (
      <IconSymbol size={size} name={iosName} color={color} />
    ) : (
      <Ionicons size={size} name={androidName} color={color} />
    );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 20,
          backgroundColor: Colors[colorScheme ?? "dark"].background,
          height: "auto",
          position: "absolute",
          overflow: "hidden",
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Randevular",
          tabBarIcon: () => (
            <TabIcon iosName="calendar.badge.clock" androidName="calendar" />
          ),
        }}
      />

      <Tabs.Screen
        name="barbers"
        options={{
          title: "Berberler",
          tabBarIcon: () => (
            <TabIcon iosName="person.fill" androidName="person" />
          ),
        }}
      />

      <Tabs.Screen
        name="services"
        options={{
          title: "Hizmetler",
          tabBarIcon: () => (
            <TabIcon iosName="comb.fill" androidName="cut" />
          ),
        }}
      />

      <Tabs.Screen
        name="campaigns"
        options={{ href: null }}
      />

      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
