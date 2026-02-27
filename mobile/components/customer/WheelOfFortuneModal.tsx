import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Easing } from "react-native";
import { Svg, G, Path, Text as SvgText } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { useQueryClient } from "@tanstack/react-query";

import { useGetCampaignsForShop } from "@/src/hooks/useCampaignQuery";
import { useGetLastSpin, useSpinWheel } from "@/src/hooks/useGameQuery";
import { Campaign } from "@/src/types/campaign";
import { myColors } from "@/constants/theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  shopSlug: string | null;
};

type WheelSegment = {
  campaign: Campaign;
  startAngle: number;
  endAngle: number;
  midAngle: number;
};

const WHEEL_SIZE = 260;
const WHEEL_RADIUS = WHEEL_SIZE / 2;

const SEGMENT_COLORS = [
  "#E4D2AC",
  "#C8AA7A",
  "#F5E6C5",
  "#B38C5A",
  "#FFF4DA",
  "#8C6B3F",
];

const formatRemaining = (ms: number) => {
  if (ms <= 0) return "0s";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}g ${hours}sa ${minutes}dk ${seconds}sn`;
  if (hours > 0) return `${hours}sa ${minutes}dk ${seconds}sn`;
  if (minutes > 0) return `${minutes}dk ${seconds}sn`;
  return `${seconds}sn`;
};

export function WheelOfFortuneModal({ visible, onClose, shopSlug }: Props) {
  const [result, setResult] = useState<Campaign | null>(null);
  const rotation = useRef(new Animated.Value(0)).current;
  const [tickSound, setTickSound] = useState<Audio.Sound | null>(null);
  const [isSpinningInternal, setIsSpinningInternal] = useState(false);
  const [remainingMs, setRemainingMs] = useState(0);
  const lastTickIndexRef = useRef<number | null>(null);
  const queryClient = useQueryClient();

  const {
    data: lastSpin,
  } = useGetLastSpin(shopSlug ?? "");

  const {
    data: campaigns,
    isLoading,
    isError,
    refetch,
  } = useGetCampaignsForShop(shopSlug ?? "");

  const {
    mutateAsync: spinAsync,
    isPending: isSpinning,
  } = useSpinWheel(shopSlug ?? "");

  // Kalan süreyi dinamik olarak hesapla (nextPlayAt - now)
  useEffect(() => {
    if (!lastSpin?.nextPlayAt) {
      setRemainingMs(0);
      return;
    }

    const target = new Date(lastSpin.nextPlayAt).getTime();

    const update = () => {
      const now = Date.now();
      const diff = target - now;
      setRemainingMs(diff > 0 ? diff : 0);
    };

    update();
    const id = setInterval(update, 1000);

    return () => clearInterval(id);
  }, [lastSpin?.nextPlayAt]);

  // Modal kapanınca last-spin query'sini sıfırla ki bir sonraki açılışta taze veri gelsin
  useEffect(() => {
    if (!visible && shopSlug) {
      queryClient.removeQueries({ queryKey: [["game"], shopSlug, "last-spin"] });
      setRemainingMs(0);
    }
  }, [visible, shopSlug, queryClient]);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("@/assets/sounds/244774__door15studio__spin-tick.mp3")
        );
        await sound.setStatusAsync({ volume: 0.8, isLooping: false });
        if (isMounted) {
          setTickSound(sound);
        } else {
          await sound.unloadAsync();
        }
      } catch (e) {
        console.warn("Tick sound yüklenemedi:", e);
      }
    })();

    return () => {
      isMounted = false;
      if (tickSound) {
        tickSound.unloadAsync().catch(() => {});
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playTick = () => {
    if (!tickSound) return;
    tickSound
      .playFromPositionAsync(0)
      .catch(() => {
        /* ignore */
      });
  };

  useEffect(() => {
    if (!visible) {
      setResult(null);
      rotation.setValue(0);
      lastTickIndexRef.current = null;
    }
  }, [visible, rotation]);

  const wheelCampaigns = useMemo(
    () => (campaigns ?? []).filter((c) => c.wheelEnabled),
    [campaigns]
  );

  const segments: WheelSegment[] = useMemo(() => {
    if (!wheelCampaigns.length) return [];

    const segmentAngle = 360 / wheelCampaigns.length;
    let currentAngle = 0;
    return wheelCampaigns.map((campaign) => {
      const startAngle = currentAngle;
      const endAngle = currentAngle + segmentAngle;
      const midAngle = startAngle + segmentAngle / 2;
      currentAngle = endAngle;

      return { campaign, startAngle, endAngle, midAngle };
    });
  }, [wheelCampaigns]);

  const findSegmentForCampaign = (campaignId: number) => {
    return segments.find((s) => s.campaign.id === campaignId) ?? null;
  };

  const handleSpin = async () => {
    if (!shopSlug) {
      Alert.alert("İşletme seçilemedi", "Lütfen önce bir işletme seçin.");
      return;
    }

    if (!segments.length) {
      Alert.alert(
        "Aktif çark kampanyası yok",
        "Bu işletme için aktif bir çark kampanyası bulunamadı."
      );
      return;
    }

    if (isSpinning || isSpinningInternal) return;

    try {
      setResult(null);
      setIsSpinningInternal(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const campaign = await spinAsync();
      if (!campaign) return;

      const segment = findSegmentForCampaign(campaign.id);

      // Eğer segment bulunamazsa sadece görsel bir spin yap.
      const baseRotations = 4 * 360;

      let targetRotation = baseRotations;
      if (segment) {
        // Pointer'ı (yukarıyı) segmentin ortasına getirecek şekilde açı hesapla
        const pointerAngle = 0; // üst nokta ile aynı referans sistemi
        const segmentCenter = segment.midAngle;
        const offset = pointerAngle - segmentCenter;
        targetRotation = baseRotations + offset;
      }

      Animated.timing(rotation, {
        toValue: targetRotation,
        duration: 2600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(async () => {
        setResult(campaign);
        setIsSpinningInternal(false);
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
      });
    } catch (error: any) {
      Alert.alert(
        "Çark çevrilemedi",
        error?.response?.data?.message ??
          "Çark çevrilirken bir hata oluştu, lütfen tekrar deneyin."
      );
      setIsSpinningInternal(false);
    }
  };

  // Pointer her segment sınırını geçtiğinde ses çal
  useEffect(() => {
    if (!segments.length) return;

    const segmentAngle = 360 / segments.length;
    lastTickIndexRef.current = null;

    const id = rotation.addListener(({ value }) => {
      const index = Math.floor(value / segmentAngle);
      if (lastTickIndexRef.current === null) {
        lastTickIndexRef.current = index;
        return;
      }
      if (index !== lastTickIndexRef.current) {
        lastTickIndexRef.current = index;
        playTick();
      }
    });

    return () => {
      rotation.removeListener(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segments.length]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.infoText}>Kampanyalar yükleniyor...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.infoText}>
            Kampanyalar yüklenirken bir hata oluştu.
          </Text>
          <Pressable style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Tekrar dene</Text>
          </Pressable>
        </View>
      );
    }

    if (!segments.length) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.infoText}>
            Bu işletme için aktif bir çark kampanyası bulunamadı.
          </Text>
        </View>
      );
    }

    const isOnCooldown = remainingMs > 0;

    return (
      <>
        <View style={styles.wheelWrapper}>
          <View style={styles.pointer} />
          <Animated.View
            style={{
              transform: [
                {
                  rotate: rotation.interpolate({
                    inputRange: [0, 360],
                    outputRange: ["0deg", "360deg"],
                  }),
                },
              ],
            }}
          >
            <WheelSvg segments={segments} />
          </Animated.View>
        </View>

        <Pressable
          style={[
            styles.spinButton,
            (isSpinning || isOnCooldown) && styles.spinButtonDisabled,
          ]}
          onPress={handleSpin}
          disabled={isSpinning || isOnCooldown}
        >
          <Text style={styles.spinButtonText}>
            {isOnCooldown
              ? `Tekrar için: ${formatRemaining(remainingMs)}`
              : isSpinning
              ? "Çark dönüyor..."
              : "Çarkı Çevir"}
          </Text>
        </Pressable>

        <Text style={styles.rulesText}>
          Çarkı her işletme için haftada yalnızca 1 kez çevirebilirsiniz. Süresi dolmamış veya
          kullanılmamış bir ödülünüz varken yeni bir çevirme hakkınız olmaz.
        </Text>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>Tebrikler!</Text>
            <Text style={styles.resultName}>{result.name}</Text>
            {result.description ? (
              <Text style={styles.resultDescription}>{result.description}</Text>
            ) : null}
          </View>
        )}
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouchable} onPress={onClose} />
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Şans Çarkı</Text>
            <Pressable hitSlop={8} onPress={onClose}>
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.modalBody}>{renderContent()}</View>
        </View>
      </View>
    </Modal>
  );
}

type WheelSvgProps = {
  segments: WheelSegment[];
};

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function createArcPath(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    `M ${x} ${y}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

const WheelSvg = ({ segments }: WheelSvgProps) => {
  return (
    <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
      <G x={0} y={0}>
        {segments.map((segment, index) => {
          const path = createArcPath(
            WHEEL_RADIUS,
            WHEEL_RADIUS,
            WHEEL_RADIUS,
            segment.startAngle,
            segment.endAngle
          );

          // Yazıyı segmentin orta hattında, merkezden dışa doğru hizala
          const innerRadius = WHEEL_RADIUS * 0.35;
          const outerRadius = WHEEL_RADIUS * 0.9;
          const labelRadius = (innerRadius + outerRadius) / 2;
          const labelPos = polarToCartesian(
            WHEEL_RADIUS,
            WHEEL_RADIUS,
            labelRadius,
            segment.midAngle
          );

          const rawLabel = segment.campaign.name ?? "";
          const label =
            rawLabel.length > 16
              ? rawLabel.slice(0, 15).trimEnd() + "…"
              : rawLabel;

          const color =
            SEGMENT_COLORS[index % SEGMENT_COLORS.length] ?? "#E4D2AC";

          return (
            <G key={segment.campaign.id}>
              <Path d={path} fill={color} stroke="#1A1A1A" strokeWidth={2} />
              <SvgText
                x={labelPos.x}
                y={labelPos.y}
                fill="#1A1A1A"
                fontSize={9}
                fontWeight="600"
                // Metni, dilimin orta hattına göre döndür ve merkezden dışa doğru ortala
                textAnchor="middle"
                transform={`rotate(${segment.midAngle} ${labelPos.x} ${labelPos.y})`}
              >
                {label}
              </SvgText>
            </G>
          );
        })}
      </G>
    </Svg>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  backdropTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    backgroundColor: myColors?.mainBackground ?? "#111111",
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(228,210,172,0.35)",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalBody: {
    paddingVertical: 8,
  },
  centerContent: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    color: "#E4D2AC",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E4D2AC",
  },
  retryButtonText: {
    color: "#E4D2AC",
    fontWeight: "600",
  },
  wheelWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  pointer: {
    position: "absolute",
    top: 0,
    zIndex: 10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 18,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#1e1e1e",
  },
  spinButton: {
    marginTop: 8,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#E4D2AC",
  },
  spinButtonDisabled: {
    opacity: 0.7,
  },
  spinButtonText: {
    color: "#1A1A1A",
    fontWeight: "700",
    fontSize: 14,
  },
  resultCard: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(228,210,172,0.08)",
    borderWidth: 1,
    borderColor: "rgba(228,210,172,0.35)",
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#E4D2AC",
    marginBottom: 4,
  },
  resultName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  resultDescription: {
    fontSize: 12,
    color: "#D0D0D0",
  },
  rulesText: {
    marginTop: 10,
    paddingHorizontal: 12,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 16,
    color: "#B8B8B8",
  },
});

