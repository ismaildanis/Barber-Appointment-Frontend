import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Service } from "@/src/types/service";

type Props = {
  item: Service;
  onEdit: (s: Service) => void;
  onDelete: (id: number, name: string) => void;
};

export function ServiceCard({ item, onEdit, onDelete }: Props) {
  return (
    <View style={styles.card}>
      {item.image ? <Image source={{ uri: item.image, cache: "force-cache" }} style={styles.image} /> : null}

      <View style={styles.content}>
        <Text style={styles.name}>{item.name}</Text>
        {item.description ? (
          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.infoRow}>
            <View style={styles.badge}>
              <Ionicons name="cash-outline" size={16} color="#D1C4B2" />
              <Text style={styles.badgeText}>{item.price} ₺</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="time-outline" size={16} color="#D1C4B2" />
              <Text style={styles.badgeText}>{item.duration} dk</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(item)}>
              <Ionicons name="create-outline" size={18} color="#D1C4B2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.delBtn} onPress={() => onDelete(item.id, item.name)}>
              <Ionicons name="trash-outline" size={18} color="#F44336" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#121212", borderRadius: 16, marginBottom: 12, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  image: { width: "100%", height: 220, backgroundColor: "rgba(255,255,255,0.05)" },
  content: { padding: 14 },
  name: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 4 },
  desc: { fontSize: 14, color: "rgba(255,255,255,0.7)" },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  infoRow: { flexDirection: "row", gap: 12 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(209, 196, 178, 0.15)", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  badgeText: { fontSize: 14, fontWeight: "600", color: "#D1C4B2" },
  actions: { flexDirection: "row", gap: 8 },
  editBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(209, 196, 178, 0.2)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(173,140,87,0.3)" },
  delBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(244,67,54,0.15)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(244,67,54,0.3)" },
});
