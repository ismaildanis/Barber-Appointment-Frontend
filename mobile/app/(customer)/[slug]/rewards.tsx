import { useEffect, useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { myColors } from "@/constants/theme";
import { useGetRewardsForCustomer } from "@/src/hooks/useRewardQuery";
import { RewardStatus, Reward } from "@/src/types/reward";

export default function RewardsScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();

  const { data: rewards, isLoading, refetch } = useGetRewardsForCustomer(
    slug ?? "",
    RewardStatus.AVAILABLE
  );

  const sortedRewards = useMemo(
    () =>
      (rewards ?? []).slice().sort((a, b) =>
        a.expiresAt.localeCompare(b.expiresAt)
      ),
    [rewards]
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <Ionicons
          name="chevron-back"
          size={24}
          color="#E4D2AC"
          onPress={() => router.back()}
        />
        <Text style={styles.headerTitle}>Ödüllerim</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.container}>
        {isLoading ? (
          <Text style={styles.infoText}>Ödüllerin yükleniyor...</Text>
        ) : sortedRewards.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="gift-outline" size={36} color="#E4D2AC" />
            <Text style={styles.emptyTitle}>Henüz ödülün yok</Text>
            <Text style={styles.emptyText}>
              Kampanyalı hizmetlerden randevu alarak çarktan ödül
              kazanabilirsin.
            </Text>
          </View>
        ) : (
          <FlatList
            data={sortedRewards}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }) => <RewardCard reward={item} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

type RewardCardProps = {
  reward: Reward;
};

const RewardCard = ({ reward }: RewardCardProps) => {
  const expires = new Date(reward.expiresAt);
  const campaign = reward.campaign;
  const campaignName = campaign?.name ?? "Kampanya";
  const campaignDescription = campaign?.description;

  let discountText: string | null = null;
  if (campaign) {
    const rawType: any = (campaign as any).discountType;
    const rawValue: any = (campaign as any).discountValue;
    if (rawValue != null) {
      if (rawType === "PERCENTAGE" || rawType === 1) {
        discountText = `%${rawValue} indirim`;
      } else {
        discountText = `${rawValue}₺ indirim`;
      }
    }
  }
  const expiresText = expires.toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{campaignName}</Text>
        <Ionicons name="gift-outline" size={20} color="#E4D2AC" />
      </View>
      {campaignDescription ? (
        <Text style={styles.cardDescription} numberOfLines={2}>
          {campaignDescription}
        </Text>
      ) : null}
      <View style={styles.cardFooter}>
        <View style={{ flexDirection: "column", gap: 4 }}>
          {discountText && (
            <Text style={styles.chip}>{discountText}</Text>
          )}
          <Text style={styles.chip}>Son kullanım: {expiresText}</Text>
        </View>
        <Text style={styles.status}>Aktif</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: myColors.mainBackground,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(228,210,172,0.3)",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  infoText: {
    textAlign: "center",
    color: "#E4D2AC",
    marginTop: 32,
  },
  emptyBox: {
    marginTop: 40,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(228,210,172,0.35)",
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    gap: 8,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyText: {
    color: "#C0C0C0",
    fontSize: 13,
    textAlign: "center",
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(228,210,172,0.45)",
    backgroundColor: "rgba(18,18,18,0.9)",
    padding: 14,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  cardDescription: {
    color: "#D0D0D0",
    fontSize: 13,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(228,210,172,0.12)",
    color: "#E4D2AC",
    fontSize: 11,
  },
  status: {
    color: "#6BEF9A",
    fontSize: 12,
    fontWeight: "600",
  },
});

