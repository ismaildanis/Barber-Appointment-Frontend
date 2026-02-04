import { Image, StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { Barber } from "@/src/types/barber";
import Spinner from "@/components/ui/Spinner";

const formatTRPhone = (phone?: string) => {
  if (!phone) return "—";
  return `0${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 8)} ${phone.slice(8, 10)}`;
};

type BarberListProps = {
  barbers: Barber[];
  selectedId?: number | null;
  onSelect?: (id: number) => void;
};

export default function BarberList({
  barbers,
  selectedId,
  onSelect,
}: BarberListProps) {

  if (!barbers || barbers.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Berberlerimiz</Text>
        <Text style={styles.empty}>Henüz berber bulunamadı.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Berberlerimiz</Text>

      {barbers.map((item) => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.85}
          onPress={() => onSelect?.(item.id)}
          style={[
            styles.touchable,
            selectedId === item.id && styles.selectedCard,
          ]}
        >
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.infoContainer}>
              <Text style={styles.name}>
                {item.firstName} {item.lastName}
              </Text>

              <Text style={styles.phone}>
                {formatTRPhone(item.phone ?? "")}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#121212",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
    color: "#fff",
  },
  touchable: {
    borderRadius: 18,
    marginBottom: 12,
  },
  selectedCard: {
    borderColor: "#4ade80",
    borderWidth: 2,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: "#1E1E1E",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    padding: 12,
    gap: 12,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 32,
    resizeMode: "cover",
    backgroundColor: "#222",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
  },
  phone: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  empty: {
    fontSize: 14,
    color: "#9CA3AF",
  },
});
