import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Modal,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get('window');
const isSmallDevice = width < 375;

type Props = {
  visible: boolean;
  onAccept: () => void;
  isAccepting?: boolean;
};

export function KvkkModal({ visible, onAccept, isAccepting }: Props) {
  const [checked, setChecked] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const insets = useSafeAreaInsets(); 

  const handleAccept = () => {
    if (!checked || isAccepting) return;
    onAccept();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <View style={styles.container}>
        <ScrollView 
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 20 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={isSmallDevice ? 42 : 48} color="#E4D2AC" />
            </View>
            <Text style={styles.title}>KVKK ve Gizlilik Bilgilendirmesi</Text>
          </View>

          <View style={styles.textCard}>
            <Text style={styles.text}>
              Berber Randevum, birden fazla berber/kuaför işletmesinin kendi
              müşterilerine randevu hizmeti sunabildiği hizmet yazılımı tabanlı bir mobil
              uygulamadır. Uygulama kapsamında kişisel verileriniz, yalnızca
              randevu hizmetlerinin sunulabilmesi amacıyla işlenmektedir.
            </Text>

            <Text style={styles.text}>
              Bu kapsamda; ad, soyad ve e-posta adresiniz zorunlu olarak; telefon
              numarası ve profil fotoğrafı ise tamamen isteğe bağlı olarak
              işlenebilir. Telefon numarası, yalnızca kullanıcı ile işletmenin
              iletişim kurabilmesi amacıyla kullanılır.
            </Text>

            <Text style={styles.text}>
              Profil, işletme ve hizmet görselleri güvenli bulut altyapısı
              üzerinden saklanmaktadır. Randevu bildirimleri yalnızca randevu
              oluşturma, iptal veya durum değişiklikleri için gönderilir.
            </Text>

            <Text style={styles.text}>
              Kişisel verileriniz reklam veya pazarlama amacıyla kullanılmaz,
              üçüncü kişilerle paylaşılmaz ve yetkisiz erişime karşı gerekli
              teknik ve idari güvenlik önlemleri alınarak korunur.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => setShowPolicy(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.link}>Gizlilik Politikası'nı görüntüle</Text>
            <Ionicons name="chevron-forward" size={18} color="#E4D2AC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setChecked(!checked)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
              {checked && <Ionicons name="checkmark" size={16} color="#1a1a1a" />}
            </View>
            <Text style={styles.checkboxText}>
              Gizlilik Politikası'nı okudum ve kişisel verilerimin belirtilen
              amaçlar doğrultusunda işlenmesini kabul ediyorum.
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, 20) }
        ]}>
          <TouchableOpacity
            disabled={!checked || isAccepting}
            style={[
              styles.button,
              (!checked || isAccepting) && styles.buttonDisabled,
            ]}
            onPress={handleAccept}
            activeOpacity={0.8}
          >
            {isAccepting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#1a1a1a" size="small" />
                <Text style={styles.loadingText}>İşleniyor...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="checkmark-circle" size={24} color="#1a1a1a" />
                <Text style={styles.buttonText}>Kabul Et ve Devam Et</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* GİZLİLİK POLİTİKASI */}
      <Modal visible={showPolicy} animationType="slide" presentationStyle="fullScreen">
        <View style={styles.container}>
          <View style={[
            styles.policyHeader,
            { paddingTop: insets.top + 16 } 
          ]}>
            <TouchableOpacity 
              onPress={() => setShowPolicy(false)}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={28} color="#E4D2AC" />
            </TouchableOpacity>
            <Text style={styles.policyTitle}>Gizlilik Politikası</Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView 
            contentContainerStyle={[
              styles.policyContent,
              { paddingBottom: Math.max(insets.bottom, 20) + 20 }
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.policyCard}>
              <Text style={styles.text}>Son güncelleme: Ocak 2026</Text>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. Toplanan Kişisel Veriler</Text>
                <Text style={styles.text}>• Ad ve soyad</Text>
                <Text style={styles.text}>• E-posta adresi</Text>
                <Text style={styles.text}>• Telefon numarası (isteğe bağlı)</Text>
                <Text style={styles.text}>• Profil fotoğrafı (isteğe bağlı)</Text>
                <Text style={styles.text}>• Randevu bilgileri ve randevu geçmişi</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. İşlenme Amaçları</Text>
                <Text style={styles.text}>
                  Veriler, kullanıcı hesabının oluşturulması, randevu
                  oluşturulması ve yönetilmesi, randevu bildirimlerinin
                  gönderilmesi amacıyla işlenir.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. Üçüncü Taraf Hizmetler</Text>
                <Text style={styles.text}>
                  • Cloudinary: Görsel barındırma hizmeti
                </Text>
                <Text style={styles.text}>
                  • Expo Push / Firebase: Randevu bildirimleri
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>4. Hesap Silme</Text>
                <Text style={styles.text}>
                  Kullanıcılar hesaplarını uygulama içerisinden kalıcı olarak
                  silebilir. Hesap silindiğinde kişisel veriler silinir; geçmiş
                  randevular sistem bütünlüğü amacıyla anonim hale getirilebilir.
                </Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>5. Kullanıcı Hakları</Text>
                <Text style={styles.text}>
                  Kullanıcılar kişisel verilerine erişme, güncelleme ve silme
                  haklarına sahiptir.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0a0a0a",
  },
  content: { 
    padding: 20,
    paddingBottom: 140,
  },
  header: { 
    alignItems: "center", 
    marginBottom: 32,
    gap: 16,
  },
  iconCircle: {
    width: isSmallDevice ? 84 : 96,
    height: isSmallDevice ? 84 : 96,
    borderRadius: isSmallDevice ? 42 : 48,
    backgroundColor: "rgba(228, 210, 172, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(228, 210, 172, 0.3)",
  },
  title: { 
    fontSize: isSmallDevice ? 20 : 24, 
    fontWeight: "700", 
    color: "#fff", 
    textAlign: "center",
    letterSpacing: 0.3,
    paddingHorizontal: 20,
  },
  textCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: isSmallDevice ? 16 : 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  text: { 
    color: "#d0d0d0", 
    fontSize: isSmallDevice ? 14 : 15, 
    marginBottom: 16, 
    lineHeight: isSmallDevice ? 22 : 24,
  },
  linkContainer: { 
    flexDirection: "row", 
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 16,
    backgroundColor: "rgba(228, 210, 172, 0.08)",
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(228, 210, 172, 0.2)",
  },
  link: { 
    color: "#E4D2AC", 
    fontWeight: "600",
    fontSize: isSmallDevice ? 14 : 15,
  },
  checkboxRow: { 
    flexDirection: "row", 
    padding: isSmallDevice ? 16 : 20,
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  checkbox: { 
    width: 28, 
    height: 28, 
    borderWidth: 2,
    borderColor: "rgba(228, 210, 172, 0.4)",
    marginRight: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  checkboxChecked: { 
    backgroundColor: "#E4D2AC",
    borderColor: "#E4D2AC",
  },
  checkboxText: { 
    color: "#e0e0e0", 
    flex: 1,
    fontSize: isSmallDevice ? 13 : 14,
    lineHeight: isSmallDevice ? 20 : 22,
  },
  footer: { 
    position: "absolute", 
    bottom: 0, 
    left: 0, 
    right: 0,
    padding: 20,
    backgroundColor: "#0a0a0a",
    borderTopWidth: 1,
    borderTopColor: "rgba(228, 210, 172, 0.2)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: -4 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  button: { 
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#E4D2AC",
    minHeight: 56,
    ...Platform.select({
      ios: {
        shadowColor: "#E4D2AC",
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonDisabled: { 
    opacity: 0.5,
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  buttonText: { 
    fontWeight: "700",
    fontSize: 16,
    color: "#1a1a1a",
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  policyHeader: { 
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    backgroundColor: "#0a0a0a",
  },
  backButton: {
    padding: 4,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
  },
  policyTitle: { 
    fontSize: isSmallDevice ? 18 : 20, 
    fontWeight: "700", 
    color: "#fff",
  },
  policyContent: {
    padding: 20,
  },
  policyCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: isSmallDevice ? 16 : 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: { 
    color: "#E4D2AC", 
    fontSize: isSmallDevice ? 16 : 17, 
    fontWeight: "700",
    marginBottom: 12,
  },
});