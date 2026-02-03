import {
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRootNavigation, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { useUnifiedLogin, useRegisterNotification } from "@/src/hooks/useUnifiedAuth";
import { loginSchema, type LoginSchema } from "@/src/schemas/auth";
import { CommonActions } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const isIOS = Platform.OS === "ios";

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
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#121212"  }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      {isIOS ? (
        <ParallaxScrollView
          headerBackgroundColor={{ light: "#121212", dark: "#121212" }}
          headerImage={
            <LinearGradient
              colors={["#E4D2AC", "#AD8C57"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
            >
              <Image source={require("@/assets/logo/logoForeground.png")} style={styles.logo} contentFit="contain" />
            </LinearGradient>
          }
        >
          <View style={styles.container}>
            <View style={styles.formWrapper}>
    
              <Text style={styles.title}>Giriş Yap</Text>
              {handleZodError && <Text style={{ color: "red" }}>{handleZodError}</Text>}
              {apiError && <Text style={{ color: "red" }}>{apiError}</Text>}

              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={"#888"}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Şifre"
                      placeholderTextColor="#888"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
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

              <View style={{ flexDirection: "column", alignItems: "flex-end", justifyContent: "center" }}>
                <TouchableOpacity onPress={() => router.replace("/forgot")}>
                  <Text style={{ color: "#fff", fontSize: 16 }}>Şifremi Unuttum</Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: "column", alignItems: "center", gap: 30, marginTop: 20 }}>
                <TouchableOpacity
                  onPress={onSubmit}
                  style={{ paddingVertical: 12, alignItems: "center", paddingHorizontal: 24, backgroundColor: "#E4D2AC", borderRadius: 5 }}
                >
                  <Text style={{ color: "#1e1e1e", fontSize: 16, fontWeight: "bold" }}>
                    {login.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace("/register")} activeOpacity={0.7}>
                  <Text style={{ color: "#E4D2AC", fontSize: 16, fontWeight: "bold" }}>
                    Hesabınız yok mu? Kayıt Ol
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ParallaxScrollView>
          
      ) : (
        <ScrollView style={{ flex: 1, backgroundColor: "#121212"}}>
          <SafeAreaView>
            <LinearGradient
              colors={["#E4D2AC", "#AD8C57"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ height: 220, alignItems: "center", justifyContent: "center" }}
            >
              <Image source={require("@/assets/logo/logoForeground.png")} style={styles.logo} contentFit="contain" />
            </LinearGradient>

            <View style={[styles.container, { flexGrow: 1, backgroundColor: "#121212" }]}>
              <View style={styles.formWrapper}>
                <Text style={styles.title}>Giriş Yap</Text>
                {handleZodError && <Text style={{ color: "red" }}>{handleZodError}</Text>}
                {apiError && <Text style={{ color: "red" }}>{apiError}</Text>}

                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor={"#4e4e4e"}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <View style={styles.passwordWrapper}>
                      <TextInput
                        style={styles.passwordInputFixed}
                        placeholder="Sifre"
                        placeholderTextColor={"#4e4e4e"}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="password"
                      />
                      <TouchableOpacity
                        style={styles.eyeButtonFixed}
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
                

                <View style={{ flexDirection: "column", alignItems: "flex-end", justifyContent: "center" }}>
                  <TouchableOpacity onPress={() => router.replace("/forgot")}>
                    <Text style={{ color: "#fff", fontSize: 16 }}>Şifremi Unuttum</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ flexDirection: "column", alignItems: "center", gap: 30, marginTop: 20 }}>
                  <TouchableOpacity
                    onPress={onSubmit}
                    style={{ paddingVertical: 12, alignItems: "center", paddingHorizontal: 24, backgroundColor: "#E4D2AC", borderRadius: 5 }}
                  >
                    <Text style={{ color: "#1e1e1e", fontSize: 16, fontWeight: "bold" }}>
                      {login.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => router.replace("/register")} activeOpacity={0.7}>
                    <Text style={{ color: "#E4D2AC", fontSize: 16, fontWeight: "bold" }}>
                      Hesabınız yok mu? Kayıt Ol
                    </Text>
                  </TouchableOpacity>

                </View>
              </View>
            </View>
          </SafeAreaView>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    gap: 18,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
    alignSelf: "center",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#1f1f1f",
    fontSize: 16,
    color: "#fff",
  },
  passwordContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    backgroundColor: "#1f1f1f",
    paddingLeft: 14,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    paddingLeft: 0,
    fontSize: 16,
    color: "#fff",
  },
  eyeButton: {
    padding: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  formWrapper: {
    width: "100%",
    alignSelf: "center",
    maxWidth: 420,
    gap: 12,
  },
  passwordWrapper: {
    position: "relative",
    width: "100%",
  },

  passwordInputFixed: {
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingVertical: 14,
    paddingLeft: 14,
    paddingRight: 48,   // 👈 GÖZ için yer
    borderRadius: 12,
    backgroundColor: "#1f1f1f",
    fontSize: 16,
    color: "#fff",
  },

  eyeButtonFixed: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -11 }], // iconSize(22) / 2
    height: 22,
    width: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
