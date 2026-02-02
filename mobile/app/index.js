import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import { useRootNavigationState, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useUnifiedMe } from "@/src/hooks/useUnifiedAuth";
import { LinearGradient } from "expo-linear-gradient";
import { Asset } from "expo-asset";


SplashScreen.preventAutoHideAsync();

const ANIMATION_CONFIG = {
  MIN_DISPLAY_TIME: 2500,
  FADE_DURATION: 700,
  SCALE_TENSION: 40,
  SCALE_FRICTION: 6,
  PULSE_DURATION: 900,
};

const logoAsset = require("../assets/logo/adaptive-foreground.png");

export default function Index() {
  const router = useRouter();
  const nav = useRootNavigationState();
  const { data, isLoading, isError } = useUnifiedMe();
  const [canNavigate, setCanNavigate] = useState(false);
  const [splashHidden, setSplashHidden] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const prepare = async () => {
      try {
        await Asset.fromModule(logoAsset).downloadAsync();
      } catch (e) {
        if (__DEV__) console.error("Logo preload failed:", e);
      } finally {
        await SplashScreen.hideAsync();
        setSplashHidden(true);
      }
    };

    prepare();
  }, []);

  // Animasyon başlatma
  useEffect(() => {
    if (!splashHidden) return;

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: ANIMATION_CONFIG.FADE_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: ANIMATION_CONFIG.SCALE_TENSION,
          friction: ANIMATION_CONFIG.SCALE_FRICTION,
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: ANIMATION_CONFIG.PULSE_DURATION,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: ANIMATION_CONFIG.PULSE_DURATION,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ),
    ]);

    animation.start();

    const minTimer = setTimeout(
      () => setCanNavigate(true),
      ANIMATION_CONFIG.MIN_DISPLAY_TIME
    );

    return () => {
      clearTimeout(minTimer);
      animation.stop();
    };
  }, [splashHidden, fadeAnim, scaleAnim, pulseAnim]);

  // Navigasyon yönlendirme
  useEffect(() => {
    if (!nav?.key || isLoading || !canNavigate) return;

    if (isError || !data) {
      router.replace("/(auth)/login");
      return;
    }

    const roleRoutes = {
      customer: "/(customer)/home",
      barber: "/(barber)/todayAppointments",
      admin: "/(admin)/dashboard",
    };

    const route = roleRoutes[data.role] || "/(auth)/login";
    router.replace(route);
  }, [nav?.key, isLoading, isError, data?.role, canNavigate, router]);

  return (
    <LinearGradient
      colors={["#E4D2AC", "#AD8C57"]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.container}
    >
      <Animated.Image
        source={logoAsset}
        style={[
          styles.logo,
          {
            opacity: fadeAnim,
            transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
          },
        ]}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 220,
    height: 220,
  },
});