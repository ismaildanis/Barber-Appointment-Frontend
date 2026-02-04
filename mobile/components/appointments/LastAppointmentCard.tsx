import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Appointment } from "@/src/types/appointment";
import Spinner from "../ui/Spinner";
import { myColors } from "@/constants/theme";
import { BlurView } from "expo-blur";


type Props = { lastAppt?: Appointment | null; };

const getInitials = (firstName?: string, lastName?: string) =>
  `${firstName?.[0] ?? "B"}${lastName?.[0] ?? ""}`.toUpperCase();

const formatDate = (dateStr?: string) =>
  dateStr ? dateStr.replace("T", " ").slice(0, 16) : "";

export default function LastAppointmentCard({ lastAppt }: Props) {
  if (!lastAppt) return null;

  const barberName = `${lastAppt.barber?.firstName ?? ""} ${lastAppt.barber?.lastName ?? ""}`.trim();
  const firstService = lastAppt.appointmentServices?.[0];
  const serviceName = firstService?.name ?? "Hizmet";
  const shopName = lastAppt.shop?.name ?? "İşletme";
  const dateLabel = formatDate(lastAppt.appointmentStartAt);
  const initials = getInitials(lastAppt.barber?.firstName, lastAppt.barber?.lastName);

  return (
    <View style={styles.shadowWrapper}>
      <BlurView intensity={40} tint="dark" style={styles.blurContainer}>
        <LinearGradient
          colors={myColors.mainBackgroundGradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          locations={[0, 0.5, 1]}
          style={styles.content}
        >
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={["#C8AA7A", "#E4D2AC"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
          </View>

          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>{barberName}</Text>
            <Text style={styles.meta} numberOfLines={1}>{serviceName}</Text>
            <Text style={styles.meta} numberOfLines={1}>{shopName}</Text>
            <Text style={styles.meta}>{dateLabel}</Text>
          </View>

          <View style={styles.badgeWrapper}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Son Randevu</Text>
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </View>

  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    borderRadius: 18,
    overflow: "visible",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8
  },

  blurContainer: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  content: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  avatarWrapper: {
    borderRadius: 40,
    overflow: "hidden",
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    fontWeight: "800",
    fontSize: 18,
    color: "#1A1A1A",
  },

  info: {
    flex: 1,
    gap: 2,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  meta: {
    fontSize: 13,
    color: "#D0D0D0",
  },

  badgeWrapper: {
    justifyContent: "center",
  },

  badge: {
    backgroundColor: "#D9C9A3",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#D9C9A3",
  },

  badgeText: {
    color: "#2A2A2A",
    fontWeight: "700",
    fontSize: 12,
  },
});
