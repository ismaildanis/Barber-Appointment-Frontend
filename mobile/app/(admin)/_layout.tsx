import { Drawer } from "expo-router/drawer";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
} from "@react-navigation/drawer";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { themeColors } from "@/constants/theme";

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 12,
        backgroundColor: themeColors.background,
      }}
    >
      <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
        <Text style={{ 
          color: themeColors.text, 
          fontSize: 20, 
          fontWeight: "800",
          marginBottom: 4,
        }}>
          Menü
        </Text>
        <Text style={{ 
          color: themeColors.textMuted,
          fontSize: 14,
        }}>
          Yönetici paneli
        </Text>
      </View>

      <DrawerItem
        label="Profil"
        icon={({ color, size }) => (
          <Ionicons name="person" color={themeColors.textOnPrimary} size={size} />
        )}
        labelStyle={{ 
          color: themeColors.textOnPrimary, 
          fontWeight: "700",
          fontSize: 15,
        }}
        style={{ 
          backgroundColor: themeColors.primary, 
          borderRadius: 12, 
          marginHorizontal: 12,
          marginBottom: 8,
        }}
        onPress={() => props.navigation.navigate("profile")}
      />
      
      <DrawerItem
        label="Tatil Günleri"
        icon={({ color, size }) => (
          <Ionicons name="calendar" color={color} size={size} />
        )}
        labelStyle={{ 
          color: themeColors.textSecondary, 
          fontWeight: "600",
          fontSize: 15,
        }}
        style={{ 
          marginHorizontal: 12, 
          borderRadius: 12,
          backgroundColor: themeColors.surface,
          marginBottom: 8,
        }}
        inactiveTintColor={themeColors.textSecondary}
        activeBackgroundColor={themeColors.primary}
        activeTintColor={themeColors.textOnPrimary}
        onPress={() => props.navigation.navigate("holiday")}
      />

      <DrawerItem
        label="İşletme Ayarları"
        icon={({ color, size }) => (
          <Ionicons name="settings" color={color} size={size} />
        )}
        labelStyle={{ 
          color: themeColors.textSecondary, 
          fontWeight: "600",
          fontSize: 15,
        }}
        style={{ 
          marginHorizontal: 12, 
          borderRadius: 12,
          backgroundColor: themeColors.surface,
          marginBottom: 8,
        }}
        inactiveTintColor={themeColors.textSecondary}
        activeBackgroundColor={themeColors.primary}
        activeTintColor={themeColors.textOnPrimary}
        onPress={() => props.navigation.navigate("settings")}
      />

      <DrawerItem
        label="Kampanyalar"
        icon={({ color, size }) => (
          <Ionicons name="gift" color={color} size={size} />
        )}
        labelStyle={{ 
          color: themeColors.textSecondary, 
          fontWeight: "600",
          fontSize: 15,
        }}
        style={{ 
          marginHorizontal: 12, 
          borderRadius: 12,
          backgroundColor: themeColors.surface,
          marginBottom: 8,
        }}
        inactiveTintColor={themeColors.textSecondary}
        activeBackgroundColor={themeColors.primary}
        activeTintColor={themeColors.textOnPrimary}
        onPress={() => props.navigation.navigate("(tabs)", { screen: "campaigns" })}
      />

      <View
        style={{
          height: 1,
          backgroundColor: themeColors.border,
          marginHorizontal: 16,
          marginVertical: 16,
        }}
      />

      <TouchableOpacity
        onPress={() => props.navigation.navigate("(tabs)", { screen: "dashboard" })}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginHorizontal: 16,
          padding: 14,
          borderRadius: 12,
          backgroundColor: themeColors.surface,
          borderWidth: 1,
          borderColor: themeColors.border,
        }}
      >
        <Ionicons name="home" size={22} color={themeColors.primary} />
        <Text style={{ 
          color: themeColors.text, 
          fontWeight: "700",
          fontSize: 15,
        }}>
          Ana Sayfa
        </Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

export default function AdminLayout() {
  return (
    <Drawer
      initialRouteName="(tabs)"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: "right",
        drawerType: "front",
        drawerStyle: { 
          width: "75%", 
          backgroundColor: themeColors.background,
        },
        overlayColor: themeColors.blackAlpha[70],
      }}
    >
      <Drawer.Screen name="(tabs)" options={{ drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="profile" options={{ title: "Profil" }} />
      <Drawer.Screen name="holiday" options={{ title: "Tatil Günleri" }} />
    </Drawer>
  );
}