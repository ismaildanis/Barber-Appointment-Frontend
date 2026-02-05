import { FlatList, StyleSheet, TouchableOpacity, View, Text } from "react-native";
import Spinner from "../ui/Spinner";
import { LinearGradient } from "expo-linear-gradient";
import { myColors } from "@/constants/theme";

export type DatesProps = {
  dates: string[];
  loading: boolean;
  selectedDate?: string;
  onSelect?: (date: string) => void;
};

const formatDay = (dateStr: string) => {
  const d = new Date(dateStr);
  const dayNum = d.getDate().toString().padStart(2, "0");
  const weekday = d
    .toLocaleDateString("tr-TR", { weekday: "short" })
    .toLocaleUpperCase()
    .replace(".", "");
  return { dayNum, weekday };
};

export default function Dates({ dates, loading, selectedDate, onSelect }: DatesProps) {
  if (loading) {
    return (
      <View style={styles.container}>
        <Spinner size="small" />
      </View>
    );
  }

  if (!dates || dates.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Günler</Text>
        <Text style={styles.empty}>Günler bulunamadı.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={dates}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 14 }}
        renderItem={({ item }) => {
          const { dayNum, weekday } = formatDay(item);
          const isSelected = selectedDate === item;

          const a = myColors.mainBackgroundGradient

          return (
            <TouchableOpacity
              onPress={() => onSelect?.(item)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={a}
                start={{ x: 0.1, y: 0 }}
                end={{ x: 0, y: 1.3 }}
                style={[styles.pill, isSelected && styles.pillSelected]}
              >
                <Text style={styles.weekday}>{weekday}</Text>

                {isSelected ? (
                  <View style={styles.dayCircle}>
                    <Text style={styles.dayNumSelected}>{dayNum}</Text>
                  </View>
                ) : (
                  <Text style={styles.dayNum}>{dayNum}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingVertical: 8,
    backgroundColor: "transparent",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  pill: {
    width: 62,
    height: 90,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",

    shadowColor: "#ffffffff",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  pillSelected: {
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.18)",
  },
  weekday: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  dayNum: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },

  dayCircle: {
    marginTop: 2,
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: "#F3E1BC",
    alignItems: "center",
    justifyContent: "center",
  },
  dayNumSelected: {
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
  },
  empty: {
    fontSize: 14,
    color: "#fff",
  },
});
