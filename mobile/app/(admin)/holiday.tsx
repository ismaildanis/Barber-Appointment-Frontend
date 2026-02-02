import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  useGetHolidays,
  useCreateHoliday,
  useDeleteHoliday,
} from "@/src/hooks/useHolidayQuery";
import { HolidayDate } from "@/src/types/holiday";
import Spinner from "@/components/ui/Spinner";
import { useNavigation } from "expo-router";

export default function Holiday() {
  const navigation = useNavigation<any>();
  const { data: holidays, isLoading, isRefetching, refetch } = useGetHolidays();

  const createHoliday = useCreateHoliday();
  const deleteHoliday = useDeleteHoliday();

  const [showFormModal, setShowFormModal] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isWorking = createHoliday.isPending || deleteHoliday.isPending || isRefetching;

  const resetForm = () => {
    setReason("");
    setSelectedDate(new Date());
    setShowFormModal(false);
  };

  const onSubmit = () => {
    if (!reason.trim()) {
      Alert.alert("Eksik Bilgi", "Tatil sebebi zorunludur.");
      return;
    }

    const formattedDate = selectedDate.toLocaleDateString('en-CA');

    createHoliday.mutate(
      {
        reason: reason.trim(),
        date: formattedDate,
      },
      {
        onSuccess: () => {
          Alert.alert("Başarılı", "Tatil günü eklendi!");
          resetForm();
          refetch();
        },
        onError: () => {
          Alert.alert("Hata", "Tatil günü eklenemedi.");
        },
      }
    );
  };

  const onDelete = (id: number, itemReason: string, date: string) => {
    Alert.alert(
      "Tatil Gününü Sil",
      `"${itemReason}" (${formatDate(date)}) tarihini silmek istediğinizden emin misiniz?`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: () => {
            deleteHoliday.mutate(id, {
              onSuccess: () => {
                Alert.alert("Başarılı", "Tatil günü silindi.");
                refetch();
              },
            });
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDayName = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { weekday: 'long' });
  };

  const filteredHolidays = (holidays || []).filter((item) =>
    item.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
    formatDate(item.date).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedHolidays = [...filteredHolidays].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const onDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const renderItem = ({ item }: { item: HolidayDate }) => {
    const isPast = new Date(item.date) < new Date();
    
    return (
      <View style={[styles.holidayCard, isPast && styles.pastHolidayCard]}>
        <View style={styles.dateCircle}>
          <Text style={styles.dateDay}>
            {new Date(item.date).getDate()}
          </Text>
          <Text style={styles.dateMonth}>
            {new Date(item.date).toLocaleDateString('tr-TR', { month: 'short' }).toUpperCase()}
          </Text>
        </View>

        <View style={styles.holidayInfo}>
          <Text style={[styles.holidayReason, isPast && styles.pastText]}>
            {item.reason}
          </Text>
          <View style={styles.holidayMeta}>
            <View style={styles.metaRow}>
              <Ionicons 
                name="calendar-outline" 
                size={14} 
                color={isPast ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.6)"} 
              />
              <Text style={[styles.metaText, isPast && styles.pastText]}>
                {formatDate(item.date)}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons 
                name="time-outline" 
                size={14} 
                color={isPast ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.6)"} 
              />
              <Text style={[styles.metaText, isPast && styles.pastText]}>
                {getDayName(item.date)}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(item.id, item.reason, item.date)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) return <Spinner />;

  return (
    <SafeAreaView style={styles.container}>
      {isWorking && <Spinner />}

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tatil Günleri</Text>
          <Text style={styles.subtitle}>
            {sortedHolidays.length} tatil günü kayıtlı
          </Text>
        </View>
        <View style={{ flexDirection: "row" , gap: 16}}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowFormModal(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="#121212" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.openDrawer()}
            activeOpacity={0.8}
          >
            <Ionicons name="menu-sharp" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Tatil ara..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={sortedHolidays}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="rgba(255,255,255,0.2)" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? "Tatil bulunamadı" : "Henüz tatil günü eklenmemiş"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "Farklı bir arama terimi deneyin"
                : "Yeni tatil günü eklemek için + butonuna tıklayın"}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={showFormModal}
        animationType={Platform.OS === "android" ? "none" : "slide"}
        transparent={true}
        onRequestClose={resetForm}
        statusBarTranslucent
        hardwareAccelerated
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }} 
        >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Yeni Tatil Günü Ekle</Text>
                <Text style={styles.modalSubtitle}>
                  Tatil bilgilerini girin
                </Text>
              </View>
              <TouchableOpacity onPress={resetForm} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Tatil Sebebi <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  value={reason}
                  onChangeText={setReason}
                  placeholder="Örn. Ramazan Bayramı"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  style={styles.input}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Tarih <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar-outline" size={20} color="#E4D2AC" />
                  <Text style={styles.datePickerText}>
                    {formatDate(selectedDate.toISOString())}
                  </Text>
                  <Text style={styles.dayName}>
                    {getDayName(selectedDate.toISOString())}
                  </Text>
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  minimumDate={new Date()}
                />
              )}

              {Platform.OS === 'ios' && showDatePicker && (
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.doneButtonText}>Tamam</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={resetForm}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={onSubmit}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark" size={20} color="#121212" />
                <Text style={styles.submitButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212", padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4 },
  addButton: { paddingHorizontal: 16, paddingVertical: 16, borderRadius: 24, backgroundColor: "#E4D2AC", alignItems: "center", justifyContent: "center" },
  menuButton: { paddingHorizontal: 16, paddingVertical: 16, borderRadius: 24, alignItems: "center", justifyContent: "center", shadowColor: "#E4D2AC" },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#121212", borderRadius: 12, paddingHorizontal: 12, marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)" },
  searchInput: { flex: 1, color: "#fff", fontSize: 15, paddingVertical: 12, paddingHorizontal: 8 },
  listContent: { paddingBottom: 20 },
  holidayCard: { backgroundColor: "#121212", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", flexDirection: "row", alignItems: "center" },
  pastHolidayCard: { opacity: 0.5 },
  dateCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(173, 140, 87, 0.2)", borderWidth: 2, borderColor: "#E4D2AC", alignItems: "center", justifyContent: "center", marginRight: 16 },
  dateDay: { fontSize: 22, fontWeight: "800", color: "#E4D2AC" },
  dateMonth: { fontSize: 10, fontWeight: "600", color: "#E4D2AC", marginTop: 2 },
  holidayInfo: { flex: 1 },
  holidayReason: { fontSize: 16, fontWeight: "700", color: "#fff", marginBottom: 6 },
  holidayMeta: { gap: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { fontSize: 13, color: "rgba(255,255,255,0.7)" },
  pastText: { color: "rgba(255,255,255,0.3)" },
  deleteButton: { width: 40, height: 40, borderRadius: 10, backgroundColor: "rgba(244, 67, 54, 0.15)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(244, 67, 54, 0.3)" },
  emptyContainer: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "rgba(255,255,255,0.5)", marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: "rgba(255,255,255,0.3)", marginTop: 8, textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#1a1a1a", borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: "rgba(173, 140, 87, 0.2)" },
  modalHeader: { flexDirection: "row", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)" },
  modalTitle: { fontSize: 22, fontWeight: "700", color: "#fff" },
  modalSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4 },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center" },
  modalBody: { padding: 20 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.9)", marginBottom: 8 },
  required: { color: "#F44336" },
  input: { backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 14, color: "#fff", fontSize: 15 },
  datePickerButton: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.05)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 14 },
  datePickerText: { flex: 1, fontSize: 15, fontWeight: "600", color: "#fff" },
  dayName: { fontSize: 13, color: "rgba(255,255,255,0.6)", fontStyle: "italic" },
  doneButton: { backgroundColor: "#E4D2AC", borderRadius: 12, padding: 12, alignItems: "center", marginTop: 12 },
  doneButtonText: { fontSize: 16, fontWeight: "700", color: "#121212" },
  modalFooter: { flexDirection: "row", gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" },
  cancelButtonText: { fontSize: 16, fontWeight: "600", color: "rgba(255,255,255,0.8)" },
  submitButton: { flex: 1, flexDirection: "row", gap: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: "#E4D2AC", alignItems: "center", justifyContent: "center" },
  submitButtonText: { fontSize: 16, fontWeight: "700", color: "#121212" },
});