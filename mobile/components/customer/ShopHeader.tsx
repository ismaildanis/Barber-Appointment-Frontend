import { StyleSheet, useWindowDimensions, View, Text, TouchableOpacity, Platform } from "react-native";
import { Customer } from "@/src/types/customerAuth";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { myColors } from "@/constants/theme";

type ShopHeaderProps = {
  customer: Customer;
};

export default function ShopHeader({ customer }: ShopHeaderProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  
  const isTablet = width >= 768;
  
  const headerHeight = isTablet ? 100 : Math.min(Math.max(width * 0.28, 80), 150);
  
  const padH = isTablet ? 24 : Math.min(Math.max(width * 0.05, 16), 24);
  const padV = isTablet ? 16 : padH * 0.7;
  
  const nameSize = isTablet ? 18 : Math.min(Math.max(width * 0.04, 12), 16) + 3;
  const emailSize = isTablet ? 14 : Math.min(Math.max(width * 0.04, 12), 14);
  
  const avatarSize = isTablet ? 56 : 52;
  
  const initials = `${customer.firstName?.[0] ?? "B"}${customer.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <View style={[styles.wrapper, { height: headerHeight }]}>
      <View
        style={[
          styles.container,
          {
            paddingHorizontal: padH,
            paddingVertical: padV,
          },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <LinearGradient 
              colors={myColors.mainBackgroundGradient2}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }} 
              style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
            <View style={{ gap: 2 }}>
              <Text style={[styles.name, { fontSize: nameSize }]}>
                {customer.firstName ?? "Kullanıcı"} {customer.lastName ?? ""}
              </Text>
              <Text style={[styles.email, { fontSize: emailSize }]}>{customer.email}</Text>
            </View>
          </View>
          
          <TouchableOpacity onPress={() => router.push("/profile")}>
            <Ionicons
              name="person"
              size={24}
              color="#E4D2AC"
              style={{ marginLeft: 10 }}
            /> 
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: "transparent", overflow: "hidden" },
  container: { 
    flex: 1, 
    flexDirection: "column", 
    backgroundColor: "transparent", 
    justifyContent: "center", 
    borderBottomColor: '#E4D2AC', 
    borderBottomWidth: 2, 
    shadowOpacity: 0.45,
  },
  logoRow: { alignItems: "center", justifyContent: "center" },
  name: { fontWeight: "600", color: "#fff" },
  email: { color: "#c0c2bdff", fontWeight: "500" },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#1A1A1A", fontWeight: "800", fontSize: 18 },
});