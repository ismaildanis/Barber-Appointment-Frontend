import {
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRootNavigation, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useUnifiedLogin, useRegisterNotification } from "@/src/hooks/useUnifiedAuth";
import { loginSchema, type LoginSchema } from "@/src/schemas/auth";
import { CommonActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Ekran boyutuna göre responsive değerler
const isSmallDevice = SCREEN_WIDTH < 375;
const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 768;
const isTablet = SCREEN_WIDTH >= 768;

// Oval boyutları
const getOvalDimensions = () => {
  if (isTablet) {
    return { width: SCREEN_WIDTH * 0.55, height: SCREEN_HEIGHT * 0.4 };
  } else if (isMediumDevice) {
    return { width: SCREEN_WIDTH * 0.78, height: SCREEN_HEIGHT * 0.32 };
  } else {
    return { width: SCREEN_WIDTH * 0.75, height: SCREEN_HEIGHT * 0.28 };
  }
};

// Logo boyutları
const getLogoDimensions = () => {
  if (isTablet) {
    return { width: 400, height: 400 };
  } else if (isMediumDevice) {
    return { width: 270, height: 270 };
  } else {
    return { width: 200, height: 200 };
  }
};

const ovalDimensions = getOvalDimensions();
const logoDimensions = getLogoDimensions();

export default function LoginScreen() {
  const router = useRouter();
  const notifyRegister = useRegisterNotification();
  const login = useUnifiedLogin();
  const rootNav = useRootNavigation();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const resetToCustomer = () => {
    rootNav?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "(customer)", state: { routes: [{ name: "home" }] } }],
      })
    );
  };

  const resetToBarber = () => {
    rootNav?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "(barber)", state: { routes: [{ name: "todayAppointments" }] } }],
      })
    );
  };

  const resetToAdmin = () => {
    rootNav?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: "(admin)", state: { routes: [{ name: "(tabs)" }, { name: "dashboard" }] } }],
      })
    );
  };

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: (data) => {
        notifyRegister.mutate(undefined, { onError: (e) => console.log("push register err", e) });

        if (data.role === "customer") resetToCustomer();
        else if (data.role === "barber") resetToBarber();
        else resetToAdmin();
      },
    });
  });

  const handleZodError = errors.email ? errors.email.message : errors.password?.message;
  const apiError = (login.error as any)?.response?.data?.message;

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardView} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header: Logo (sol) + Ana Sayfa butonu (sağ) */}
          <View style={styles.header}>
            {/* Sol Üst: Yarım Oval içinde Logo */}
            <View style={styles.logoSection}>
              <LinearGradient
                colors={["#E4D2AC", "#AD8C57"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ovalGradient}
              >
                <Image 
                  source={require("@/assets/logo/AndroidLogo.png")} 
                  style={styles.logoImage} 
                  contentFit="contain" 
                />
              </LinearGradient>
            </View>

            {/* Sağ Üst: Ana Sayfa Butonu */}
            <TouchableOpacity
              style={styles.homeButton}
              onPress={() => router.replace("/(customer)/home")}
              activeOpacity={0.7}
            >
              <Ionicons name="home-outline" size={isTablet ? 28 : 24} color="#E4D2AC" />
              <Text style={styles.homeButtonText}>Ana Sayfa</Text>
            </TouchableOpacity>
          </View>

          {/* Form Bölümü */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Giriş Yap</Text>

            {/* Hata Mesajları */}
            {handleZodError && <Text style={styles.errorText}>{handleZodError}</Text>}
            {apiError && <Text style={styles.errorText}>{apiError}</Text>}

            {/* Email Input */}
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#888"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
              )}
            />

            {/* Password Input */}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Şifre"
                    placeholderTextColor="#888"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="password"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#888"
                    />
                  </TouchableOpacity>
                </View>
              )}
            />

            {/* Şifremi Unuttum */}
            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity onPress={() => router.replace("/forgot")}>
                <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
              </TouchableOpacity>
            </View>

            {/* Butonlar */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={onSubmit}
                style={styles.loginButton}
                disabled={login.isPending}
              >
                <Text style={styles.loginButtonText}>
                  {login.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => router.replace("/register")} 
                activeOpacity={0.7}
              >
                <Text style={styles.registerText}>
                  Hesabınız yok mu? Kayıt Ol
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollContent: {
    flexGrow: 1,
  },
  safeArea: {
    flex: 1,
  },
  // Header: Logo + Ana Sayfa butonu
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingRight: isTablet ? 32 : 16,
    marginBottom: isTablet ? 40 : 20,
  },
  // Sol üst yarım oval - Responsive
  logoSection: {
    width: ovalDimensions.width,
    height: ovalDimensions.height,
  },
  ovalGradient: {
    width: "100%",
    height: "100%",
    borderBottomRightRadius: isTablet ? 400 : 300,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: isTablet ? 20 : isSmallDevice ? 10 : 15,
  },
  logoImage: {
    width: logoDimensions.width,
    height: logoDimensions.height,
  },
  // Sağ üst ana sayfa butonu
  homeButton: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: isTablet ? 24 : 16,
    gap: 4,
  },
  homeButtonText: {
    color: "#E4D2AC",
    fontSize: isTablet ? 14 : 12,
    fontWeight: "600",
  },
  // Form container - Responsive padding
  formContainer: {
    flex: 1,
    paddingHorizontal: isTablet ? 80 : isSmallDevice ? 20 : 24,
    paddingBottom: 32,
    gap: isTablet ? 20 : 16,
    maxWidth: isTablet ? 600 : "100%",
    alignSelf: "center",
    width: "100%",
  },
  title: {
    fontSize: isTablet ? 36 : isSmallDevice ? 24 : 28,
    fontWeight: "800",
    color: "#fff",
    alignSelf: "center",
    marginBottom: isTablet ? 16 : 8,
  },
  errorText: {
    color: "#ff4444",
    fontSize: isTablet ? 16 : 14,
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: isTablet ? 18 : 14,
    paddingHorizontal: isTablet ? 18 : 14,
    borderRadius: isTablet ? 16 : 12,
    backgroundColor: "#1f1f1f",
    fontSize: isTablet ? 18 : 16,
    color: "#fff",
  },
  passwordWrapper: {
    position: "relative",
    width: "100%",
  },
  passwordInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: isTablet ? 18 : 14,
    paddingLeft: isTablet ? 18 : 14,
    paddingRight: isTablet ? 56 : 48,
    borderRadius: isTablet ? 16 : 12,
    backgroundColor: "#1f1f1f",
    fontSize: isTablet ? 18 : 16,
    color: "#fff",
  },
  eyeButton: {
    position: "absolute",
    right: isTablet ? 16 : 12,
    top: "50%",
    transform: [{ translateY: -11 }],
    height: 22,
    width: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
  },
  forgotPasswordText: {
    color: "#fff",
    fontSize: isTablet ? 16 : 14,
  },
  buttonContainer: {
    gap: isTablet ? 24 : 20,
    marginTop: isTablet ? 20 : 12,
    alignItems: "center",
  },
  loginButton: {
    width: "100%",
    paddingVertical: isTablet ? 18 : 14,
    alignItems: "center",
    backgroundColor: "#E4D2AC",
    borderRadius: isTablet ? 16 : 12,
  },
  loginButtonText: {
    color: "#1e1e1e",
    fontSize: isTablet ? 18 : 16,
    fontWeight: "bold",
  },
  registerText: {
    color: "#E4D2AC",
    fontSize: isTablet ? 17 : 15,
    fontWeight: "600",
  },
});