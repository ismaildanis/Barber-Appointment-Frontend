import { StyleSheet, Text, View } from "react-native";

type SummaryProps = {
  date?: string;          
  time?: string;        
  barberName?: string;
  services?: { name: string; price?: number; duration?: number }[];
  totalPrice?: number;
  totalDuration?: number;
  appliedCampaignName?: string;
  originalTotalPrice?: number;
  discountAmount?: number;
  discountedTotalPrice?: number;
};

export default function AppointmentSummary({
  date,
  time,
  barberName,
  services = [],
  totalPrice,
  totalDuration,
  appliedCampaignName,
  originalTotalPrice,
  discountAmount,
  discountedTotalPrice,
}: SummaryProps) {
    const formatDay = (date: string) => {
        const d = new Date(date);
        const dayNum = d.getDate().toString().padStart(2, "0");
        const weekday = d
            .toLocaleDateString("tr-TR", { weekday: "long" })
            .replace(".", "");
        return { dayNum, weekday };
    };

    const getEndTime = (time?: string, services?: { duration?: number }[]) => {
        if (!time) return undefined;
        const totalDuration = (services ?? []).reduce((sum, s) => sum + (s.duration ?? 0), 0);
        const [h, m] = time.split(":").map(Number);
        if (Number.isNaN(h) || Number.isNaN(m)) return undefined;
        const d = new Date();
        d.setHours(h, m + totalDuration, 0, 0);
        return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    };

    const endTime = getEndTime(time, services);
    const formatMoney = (value?: number) =>
        value != null ? value.toFixed(2) : "0.00";

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Randevu Özeti</Text>

        <View style={styles.row}>
            <Text style={styles.label}>Tarih</Text>
            <Text style={styles.value}>{date || "-"} {`| ${formatDay(date ?? "").weekday}`}</Text>
        </View>

        <View style={styles.row}>
            <Text style={styles.label}>Saat</Text>
            <Text style={styles.value}>{time && endTime ? `${time} - ${endTime}` : "-"}</Text>
        </View>

        <View style={styles.row}>
            <Text style={styles.label}>Berber</Text>
            <Text style={styles.value}>{barberName || "-"}</Text>
        </View>

        <View style={[styles.divider]} />

        <Text style={[styles.label, { marginBottom: 6 }]}>Hizmetler</Text>
        {services.length === 0 ? (
            <Text style={styles.value}>Henüz hizmet seçilmedi</Text>
        ) : (
            services.map((s, i) => (
            <View key={`${s.name}-${i}`} style={styles.row}>
                <Text style={styles.value}>{s.name}</Text>
                <Text style={styles.value}>
                {(s.duration ?? 0)} dk · {(s.price ?? 0)} ₺
                </Text>
            </View>
            ))
        )}

        <View style={[styles.divider, { marginTop: 8 }]} />

        <View style={styles.row}>
            <Text style={styles.label}>Toplam Süre</Text>
            <Text style={styles.value}>{(totalDuration ?? 0)} dk</Text>
        </View>
        <View style={styles.row}>
            <Text style={styles.label}>Toplam Fiyat</Text>
            <Text style={styles.value}>{(totalPrice ?? 0)} ₺</Text>
        </View>

        {appliedCampaignName && (
          <>
            <View style={[styles.divider, { marginTop: 8 }]} />
            <Text style={[styles.label, { marginTop: 4 }]}>
              Uygulanan Kampanya:{" "}
              <Text style={styles.value}>{appliedCampaignName}</Text>
            </Text>
            <View style={styles.row}>
              <Text style={styles.label}>İndirimsiz Fiyat</Text>
              <Text style={styles.value}>{formatMoney(originalTotalPrice)} ₺</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Toplam İndirim</Text>
              <Text style={styles.value}>-{formatMoney(discountAmount)} ₺</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Yeni Fiyat</Text>
              <Text style={styles.value}>{formatMoney(discountedTotalPrice)} ₺</Text>
            </View>
          </>
        )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        padding: 16,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        gap: 4,
    },
    title: { fontSize: 16, fontWeight: "700", color: "#fff", marginBottom: 8 },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    label: { fontSize: 13, color: "rgba(255,255,255,0.72)" },
    value: { fontSize: 14, color: "#fff", fontWeight: "600" },
    divider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.08)",
        marginVertical: 6,
    },
});
