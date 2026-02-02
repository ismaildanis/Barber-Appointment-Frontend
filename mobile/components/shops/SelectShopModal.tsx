import { themeColors, myColors } from "@/constants/theme";
import { Shop } from "@/src/types/shop";
import { Image } from "expo-image";
import { Modal, Pressable, Text, TouchableOpacity, View, ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

type SelectShopModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    shops: Shop[];
    selectedShop: Shop | undefined;
    onSelectShop: (slug: string) => void;
};

export default function SelectShopModal({ 
    isOpen, onClose, title, shops, selectedShop, onSelectShop 
}: SelectShopModalProps) {

    const handleSelectShop = (shop: Shop) => {
        onSelectShop(shop.slug);
        onClose();
    };

    return (
        <Modal
            visible={isOpen}
            onRequestClose={onClose}
            transparent
            animationType="fade"
        >
            <Pressable
                onPress={onClose}
                style={styles.overlay}
            >
                <Pressable
                    onPress={(e) => e.stopPropagation()}
                    style={styles.modalContainer}
                >
                    <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
                        <LinearGradient
                            colors={myColors.mainBackgroundGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientWrapper}
                        >
                            {/* Header */}
                            <View style={styles.header}>
                                <Text style={styles.title}>{title}</Text>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Ionicons name="close" size={26} color="#E4D2AC" />
                                </TouchableOpacity>
                            </View>

                            {/* Shop List */}
                            <ScrollView 
                                style={styles.scrollView}
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                            >
                                {shops.map((shop) => {
                                    const isSelected = selectedShop?.slug === shop.slug;
                                    const fullAddress = `${shop.address}, ${shop.neighborhood}, ${shop.district}/${shop.city}`;
                                    
                                    return (
                                        <TouchableOpacity
                                            key={shop.slug}
                                            onPress={() => handleSelectShop(shop)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.shopItemShadow}>
                                                <BlurView intensity={40} tint="dark" style={styles.shopItemBlur}>
                                                    <LinearGradient
                                                        colors={isSelected 
                                                            ? ["rgba(217, 201, 163, 0.25)", "rgba(200, 170, 122, 0.15)"]
                                                            : ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.04)"]
                                                        }
                                                        start={{ x: 0, y: 0.5 }}
                                                        end={{ x: 1, y: 0.5 }}
                                                        style={styles.shopItem}
                                                    >
                                                        {/* Left: Shop Image */}
                                                        <View style={styles.shopImageWrapper}>
                                                            {shop.image ? (
                                                                <Image
                                                                    source={{ uri: shop.image }}
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
                                                                        {shop.name[0].toUpperCase()}
                                                                    </Text>
                                                                </LinearGradient>
                                                            )}
                                                        </View>

                                                        {/* Right: Shop Details */}
                                                        <View style={styles.rightSection}>
                                                            {/* Shop Name */}
                                                            <Text style={styles.shopName} numberOfLines={1}>
                                                                {shop.name}
                                                            </Text>

                                                            {/* Location */}
                                                            <Text style={styles.locationText} numberOfLines={1}>
                                                                {shop.district}, {shop.city}
                                                            </Text>

                                                            {/* Full Address */}
                                                            <Text style={styles.addressText} numberOfLines={2}>
                                                                {fullAddress}
                                                            </Text>

                                                            {/* Phone */}
                                                            {shop.phone && (
                                                                <Text style={styles.phoneText}>
                                                                    {shop.phone}
                                                                </Text>
                                                            )}
                                                        </View>

                                                        {/* Selected Indicator */}
                                                        {isSelected && (
                                                            <View style={styles.selectedIndicator}>
                                                                <Ionicons name="checkmark-circle" size={24} color="#D9C9A3" />
                                                            </View>
                                                        )}
                                                    </LinearGradient>
                                                </BlurView>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </LinearGradient>
                    </BlurView>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },

    modalContainer: {
        width: "95%",
        maxWidth: 700,
        maxHeight: "75%",
        borderRadius: 24,
        overflow: "hidden",
    },

    blurContainer: {
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 1.5,
        borderColor: "rgba(228, 210, 172, 0.3)",
    },

    gradientWrapper: {
        padding: 20,
    },

    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1.5,
        borderBottomColor: "rgba(228, 210, 172, 0.25)",
    },

    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: 0.3,
    },

    closeButton: {
        padding: 6,
    },

    scrollView: {
        maxHeight: 450,
    },

    scrollContent: {
        gap: 12,
        paddingBottom: 8,
    },

    shopItemShadow: {
        borderRadius: 16,
        overflow: "visible",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },

    shopItemBlur: {
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.08)",
    },

    shopItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        gap: 14,
        minHeight: 100,
    },

    shopImageWrapper: {
        borderRadius: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },

    shopImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },

    shopImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },

    placeholderText: {
        fontSize: 32,
        fontWeight: "800",
        color: "#1A1A1A",
    },

    rightSection: {
        flex: 1,
        gap: 4,
        justifyContent: "center",
    },

    shopName: {
        fontSize: 17,
        fontWeight: "700",
        color: "#FFFFFF",
        letterSpacing: 0.2,
        marginBottom: 2,
    },

    locationText: {
        fontSize: 14,
        color: "#D9C9A3",
        fontWeight: "600",
    },

    addressText: {
        fontSize: 12,
        color: "#B0B0B0",
        fontWeight: "500",
        lineHeight: 16,
    },

    phoneText: {
        fontSize: 12,
        color: "#999",
        fontWeight: "500",
        marginTop: 2,
    },

    selectedIndicator: {
        marginLeft: 12,
    },
});