import {
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterSchema } from "@/src/schemas/register";
import { useRegister } from "@/src/hooks/useUnifiedAuth";
import { AlertModal } from "@/components/ui/AlertModal";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";

export default function Register() {
  const router = useRouter();
  const register = useRegister();
  const { control, handleSubmit, formState: { errors }, reset: controlReset } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", firstName: "", lastName: "", phone: "", password: "", passwordConfirm: "" },
  });

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const nameHandler = (value: string) => {
      return value
      .trim()
      .toLocaleLowerCase('tr-TR')
      .replace(/^./, c => c.toLocaleUpperCase('tr-TR'));
  }

  const onSubmit = handleSubmit((values) => {
    register.mutate(
    {
      ...values,
      firstName: nameHandler(values.firstName),
      lastName: nameHandler(values.lastName),
      phone: values.phone?.trim() ? values.phone.trim() : null,
    },
    {
      onSuccess: () => {
        setAlertTitle("Kayıt Başarılı");
        setAlertMsg("Giriş ekranına dönebilirsiniz.");
        setAlertVisible(true);
        controlReset()
      },
    });
  });


  const apiError = (register.error as any)?.response?.data?.message;
  const zodErrors = Object.values(errors).map((e) => e?.message).filter(Boolean);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#121212", dark: "#121212" }}
        headerImage={
          <LinearGradient
            colors={["#E4D2AC", "#AD8C57"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Image source={require("@/assets/logo/logoForeground.png")} style={styles.logo} />
          </LinearGradient>
        }
      >
        <View style={styles.container}>
          <View style={styles.formWrapper}>
            <Text style={styles.title}>Kayıt Ol</Text>

            {apiError && <Text style={styles.error}>{apiError}</Text>}
            {zodErrors.map((m, i) => (
              <Text key={i} style={styles.error}>{m}</Text>
            ))}
    
            {([
              { name: "firstName", label: "Ad", secure: false, keyboard: "default", maxLength: 50 },
              { name: "lastName", label: "Soyad", secure: false, keyboard: "default", maxLength: 50 },
              { name: "email", label: "Email", secure: false, keyboard: "email-address", maxLength: 50 },
              { name: "phone", label: "Telefon (İsteğe bağlı)", secure: false, keyboard: "phone-pad", maxLength:10 },
              { name: "password", label: "Şifre", secure: true, keyboard: "default", maxLength: 50 },
              { name: "passwordConfirm", label: "Şifre (Tekrar)", secure: true, keyboard: "default", maxLength: 50 },
            ] as const).map((field) => (
              <Controller
                key={field.name}
                control={control}
                name={field.name}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      style={styles.input}
                      placeholder={field.label}
                      placeholderTextColor="#4e4e4e"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={field.secure}
                      autoCapitalize="none"
                      keyboardType={field.keyboard as any}
                      maxLength={field.maxLength as any}
                    />

                    {field.name === "phone" && (
                      <Text style={styles.helperText}>
                        Gerektiğinde sizinle iletişim kurmak için (isteğe bağlı)
                      </Text>
                    )}
                  </>
                )}
              />
              
            ))}
          
            <View style={styles.actions}>
              <TouchableOpacity onPress={onSubmit} style={styles.primaryBtn} disabled={register.isPending}>
                <Text style={styles.primaryText}>
                  {register.isPending ? "Kaydediliyor..." : "Kayıt Ol"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.replace("/login")} activeOpacity={0.7}>
                <Text style={styles.link}>Zaten hesabın var mı? Giriş yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ParallaxScrollView>

      <AlertModal
        visible={alertVisible}
        title={alertTitle}
        message={alertMsg}
        onClose={() => setAlertVisible(false)}
        onConfirm={() => {
          setAlertVisible(false);
          router.replace("/login");
        }}
        confirmText="Tamam"
        cancelText="Kapat"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 14 },
  logo: { width: "100%", height: "100%", resizeMode: "contain" },
  title: { fontSize: 26, fontWeight: "800", color: "#fff", alignSelf: "center", marginBottom: 8 },
  error: { color: "#ff4d4f" },
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
  actions: { alignItems: "center", gap: 16, marginTop: 12 },
  primaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#E4D2AC",
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
  },
  primaryText: { color: "#1e1e1e", fontSize: 16, fontWeight: "bold" },
  link: { color: "#E4D2AC", fontSize: 16, fontWeight: "bold" },
  formWrapper: {
    width: "100%",
    alignSelf: "center",
    maxWidth: 420,
    gap: 12,
  },
  helperText: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: -6,
    marginBottom: 4,
    lineHeight: 16,
  },

});
