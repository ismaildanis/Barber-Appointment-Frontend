import { Service } from "@/src/types/service";
import Spinner from "@/components/ui/Spinner";
import { useCallback, useEffect, useRef, useState, memo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { myColors } from "@/constants/theme";
import { Image } from "react-native";

export type ServiceListProps = {
  services: Service[];
  autoPlay?: boolean;
};

type ServiceCardProps = {
  item: Service;
  cardWidth: number;
  cardHeight: number;
};

const ServiceCard = memo(({ item, cardWidth, cardHeight }: ServiceCardProps) => (
  <View
    style={[styles.card, { width: cardWidth, height: cardHeight }]}
  >
    <Image 
      source={{ uri: item.image, cache: "force-cache" }} 
      style={styles.cardImage}>
    </Image>
    <Text style={styles.cardTitle} numberOfLines={1}>
      {item.name}
    </Text>
    <Text style={styles.cardPrice}>{item.price} ₺</Text>
    <Text style={styles.cardMeta} numberOfLines={2}>
      {item.description}
    </Text>
  </View>
));

export default function ServiceList({ services, autoPlay = true }: ServiceListProps) {
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Service>>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const indexRef = useRef(0);

  const gap = 12;
  const cardWidth = Math.min(Math.max(width * 0.6, 220), 280);
  const cardHeight = Math.min(Math.max(width * 0.33, 360), 400);

  const stopAutoPlay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    if (!autoPlay || !services?.length) return;
    timerRef.current = setInterval(() => {
      const next = indexRef.current + 1 >= services.length ? 0 : indexRef.current + 1;
      indexRef.current = next;
      listRef.current?.scrollToIndex({ index: next, animated: true });
    }, 3000);
  };

  useEffect(() => {
    startAutoPlay();
    return stopAutoPlay;
  }, [services, autoPlay]);

  const handleBeginDrag = () => stopAutoPlay();
  const handleEndDrag = () => startAutoPlay();

  const handleMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const itemWidth = cardWidth + gap;
    indexRef.current = Math.round(offsetX / itemWidth);
  };

  const renderItem = useCallback(
    ({ item }: { item: Service }) => (
      <ServiceCard item={item} cardWidth={cardWidth} cardHeight={cardHeight} />
    ),
    [cardWidth, cardHeight]
  );

  const keyExtractor = useCallback((item: Service) => String(item.id), []);

  if (!services?.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Servisler</Text>
        <Text style={styles.empty}>Henüz servis bulunamadı.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Hizmetlerimiz</Text>
      <FlatList
        bounces={false}
        ref={listRef}
        horizontal
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={5}
        data={services}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, { gap }]}
        getItemLayout={(_, i) => ({
          length: cardWidth + gap,
          offset: (cardWidth + gap) * i,
          index: i,
        })}
        onScrollBeginDrag={handleBeginDrag}
        onScrollEndDrag={handleEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 22,
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#fff" },
  listContent: { gap: 12, paddingBottom: 12 },
  cardImage: {
    width: "100%",
    height: 200,
    borderRadius: 14,
    borderCurve: "continuous",
    resizeMode: "cover", 
    marginBottom: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  card: {
    padding: 30,
    borderRadius: 18,
    justifyContent: "space-between",
    backgroundColor: "#1E1E1E",
    elevation: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#F3F3F3" },
  cardPrice: { marginTop: 4, fontSize: 14, fontWeight: "700", color: "#E8E8E8" },
  cardMeta: { marginTop: 8, fontSize: 12, color: "#CACACA" },
  empty: { fontSize: 14, color: "#fff" },
});
