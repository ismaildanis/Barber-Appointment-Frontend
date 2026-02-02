import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { myColors, themeColors } from "@/constants/theme";
import { Shop } from "@/src/types/shop";
import { useState } from "react";
import { useShopStore } from "@/src/store/useShopStore";

import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import SelectShopModal from "../shops/SelectShopModal";

type ShopHeaderProps = {
  shops: Shop[] | undefined;
};

export default function ShopHeader({ shops }: ShopHeaderProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { activeShopSlug, setActiveShop } = useShopStore();
  
  const selectedShop = activeShopSlug 
    ? shops?.find(s => s.slug === activeShopSlug) 
    : null;

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Shop Selector */}
          <TouchableOpacity
            style={styles.shopSelector}
            onPress={() => setIsModalOpen(true)}
            activeOpacity={0.7}
          >
            <View style={styles.shopDisplay}>
              {selectedShop?.image ? (
                <Image
                  source={{ uri: selectedShop.image }}
                  style={styles.shopImage}
                  contentFit="cover"
                />
              ) : (
                <LinearGradient
                  colors={["#C8AA7A", "#E4D2AC"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.shopImagePlaceholder}
                >
                  <Text style={styles.placeholderText}>
                    {selectedShop?.name?.[0]?.toUpperCase() ?? "?"}
                  </Text>
                </LinearGradient>
              )}
              
              <View style={styles.shopTextContainer}>
                <Text style={styles.shopName} numberOfLines={1}>
                  {selectedShop?.name ?? "İşletme Seç"}
                </Text>
                {selectedShop && (
                  <Text style={styles.shopLocation} numberOfLines={1}>
                    {selectedShop.district}, {selectedShop.city}
                  </Text>
                )}
              </View>

              <Ionicons 
                name="chevron-down" 
                size={20} 
                color="#E4D2AC" 
                style={styles.chevron}
              />
            </View>
          </TouchableOpacity>

          {/* Profile Button */}
          <TouchableOpacity 
            onPress={() => router.push("/profile")}
            style={styles.profileButton}
          >
            <Ionicons name="person" size={24} color="#E4D2AC" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Shop Selection Modal */}
      <SelectShopModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="İşletme Seç"
        shops={shops ?? []}
        selectedShop={selectedShop ?? undefined}
        onSelectShop={setActiveShop}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "transparent",
    overflow: "hidden",
  },

  container: {
    backgroundColor: "transparent",
    borderBottomColor: '#E4D2AC',
    borderBottomWidth: 2,
    shadowOpacity: 0.45,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  shopSelector: {
    flex: 1,
  },

  shopDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  shopImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },

  shopImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1A1A1A",
  },

  shopTextContainer: {
    flex: 1,
    gap: 2,
  },

  shopName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  shopLocation: {
    fontSize: 12,
    fontWeight: "500",
    color: "#D0D0D0",
  },

  chevron: {
    marginLeft: 4,
  },

  profileButton: {
    padding: 8,
  },
});