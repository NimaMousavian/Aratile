import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Platform,
  Modal,
  ViewStyle,
  TextStyle,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../config/colors";
import { toPersianDigits } from "../utils/converters";

const getFontFamily = (baseFont: string, weight: string): string => {
  if (Platform.OS === "android") {
    switch (weight) {
      case "700":
      case "bold":
        return "Yekan_Bakh_Bold";
      case "500":
      case "600":
      case "semi-bold":
        return "Yekan_Bakh_Bold";
      default:
        return "Yekan_Bakh_Regular";
    }
  }

  return baseFont;
};

const toFarsiDigits = (str: string | number): string => {
  if (!str) return "";
  return str.toString().replace(/[0-9]/g, function (w) {
    const persian = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return persian[parseInt(w)];
  });
};

const persianMonths: string[] = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

interface CustomStyles {
  modalOverlay?: ViewStyle;
  modalContent?: ViewStyle;
  pickerContainer?: ViewStyle;
  pickerHeader?: ViewStyle;
  pickerTitle?: TextStyle;
  dateSelectors?: ViewStyle;
  pickerColumn?: ViewStyle;
  pickerLabel?: TextStyle;
  pickerScroll?: ViewStyle;
  pickerItem?: ViewStyle;
  selectedItem?: ViewStyle;
  pickerItemText?: TextStyle;
  selectedItemText?: TextStyle;
  pickerActions?: ViewStyle;
  pickerButton?: ViewStyle;
  confirmButton?: ViewStyle;
  cancelButton?: ViewStyle;
  confirmButtonText?: TextStyle;
  cancelButtonText?: TextStyle;
  infoItem?: ViewStyle;
  infoLabel?: TextStyle;
  infoValue?: TextStyle;
  valueContainer?: ViewStyle;
  editButton?: ViewStyle;
}

interface PersianDatePickerProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (date: number[]) => void;
  initialDate?: number[];
  startYear?: number;
  yearCount?: number;
  customStyles?: CustomStyles;
  confirmButtonText?: string;
  cancelButtonText?: string;
  headerTitle?: string;
}

export const PersianDatePicker: React.FC<PersianDatePickerProps> = ({
  isVisible,
  onClose,
  onConfirm,
  initialDate = [1404, 1, 1],
  startYear = 1390,
  yearCount = 21,
  customStyles = {},
  confirmButtonText = "تأیید",
  cancelButtonText = "انصراف",
  headerTitle = "انتخاب تاریخ",
}) => {
  const [selectedYear, setSelectedYear] = useState(initialDate[0]);
  const [selectedMonth, setSelectedMonth] = useState(initialDate[1]);
  const [selectedDay, setSelectedDay] = useState(initialDate[2]);

  const years = Array.from({ length: yearCount }, (_, i) => startYear + i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    name: persianMonths[i],
  }));
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const handleConfirm = () => {
    onConfirm([selectedYear, selectedMonth, selectedDay]);
    onClose();
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      ...customStyles.modalOverlay,
    },
    modalContent: {
      width: "90%",
      backgroundColor: "white",
      borderRadius: 20,
      padding: 20,
      maxHeight: "80%",
      ...customStyles.modalContent,
    },
    pickerContainer: {
      backgroundColor: "white",
      ...customStyles.pickerContainer,
    },
    pickerHeader: {
      borderBottomWidth: 1,
      borderBottomColor: "#E5E7EB",
      paddingBottom: 15,
      marginBottom: 15,
      ...customStyles.pickerHeader,
    },
    pickerTitle: {
      fontSize: 18,
      fontFamily: getFontFamily("Yekan_Bakh_Bold", "700"),
      color: "#1F2937",
      textAlign: "center",
      ...customStyles.pickerTitle,
    },
    dateSelectors: {
      flexDirection: "row",
      justifyContent: "space-between",
      height: 200,
      ...customStyles.dateSelectors,
    },
    pickerColumn: {
      flex: 1,
      marginHorizontal: 5,
      ...customStyles.pickerColumn,
    },
    pickerLabel: {
      fontSize: 14,
      fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
      color: "#6B7280",
      textAlign: "center",
      marginBottom: 10,
      ...customStyles.pickerLabel,
    },
    pickerScroll: {
      flex: 1,
      ...customStyles.pickerScroll,
    },
    pickerItem: {
      padding: 10,
      alignItems: "center",
      justifyContent: "center",
      ...customStyles.pickerItem,
    },
    selectedItem: {
      backgroundColor: "#F3F4F6",
      borderRadius: 8,
      ...customStyles.selectedItem,
    },
    pickerItemText: {
      fontSize: 16,
      fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
      color: "#374151",
      ...customStyles.pickerItemText,
    },
    selectedItemText: {
      color: "#1F2937",
      fontFamily: getFontFamily("Yekan_Bakh_Bold", "700"),
      ...customStyles.selectedItemText,
    },
    pickerActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
      gap: 10,
      ...customStyles.pickerActions,
    },
    pickerButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
      ...customStyles.pickerButton,
    },
    confirmButton: {
      backgroundColor: colors.success,
      ...customStyles.confirmButton,
    },
    cancelButton: {
      backgroundColor: colors.danger,
      ...customStyles.cancelButton,
    },
    confirmButtonText: {
      color: "white",
      fontSize: 16,
      fontFamily: getFontFamily("Yekan_Bakh_Bold", "700"),
      ...customStyles.confirmButtonText,
    },
    cancelButtonText: {
      color: "white",
      fontSize: 16,
      fontFamily: getFontFamily("Yekan_Bakh_Bold", "700"),
      ...customStyles.cancelButtonText,
    },
  });

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{headerTitle}</Text>
            </View>

            <View style={styles.dateSelectors}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>سال</Text>
                <ScrollView style={styles.pickerScroll}>
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.pickerItem,
                        selectedYear === year && styles.selectedItem,
                      ]}
                      onPress={() => setSelectedYear(year)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedYear === year && styles.selectedItemText,
                        ]}
                      >
                        {toFarsiDigits(year)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>ماه</Text>
                <ScrollView style={styles.pickerScroll}>
                  {months.map((month) => (
                    <TouchableOpacity
                      key={month.number}
                      style={[
                        styles.pickerItem,
                        selectedMonth === month.number && styles.selectedItem,
                      ]}
                      onPress={() => setSelectedMonth(month.number)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedMonth === month.number &&
                            styles.selectedItemText,
                        ]}
                      >
                        {month.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>روز</Text>
                <ScrollView style={styles.pickerScroll}>
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.pickerItem,
                        selectedDay === day && styles.selectedItem,
                      ]}
                      onPress={() => setSelectedDay(day)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedDay === day && styles.selectedItemText,
                        ]}
                      >
                        {toFarsiDigits(day)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.pickerActions}>
              <TouchableOpacity
                style={[styles.pickerButton, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>{cancelButtonText}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.pickerButton, styles.confirmButton]}
                onPress={handleConfirm}
              >
                <Text style={styles.confirmButtonText}>
                  {confirmButtonText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface DatePickerFieldProps {
  label: string;
  date: string;
  onDateChange: (date: string) => void;
  datePickerProps?: Partial<PersianDatePickerProps>;
  customStyles?: CustomStyles;
  error?: string;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  date,
  onDateChange,
  datePickerProps = {},
  customStyles = {},
  error,
}) => {
  const [isPickerVisible, setPickerVisible] = useState(false);
  const dateArray = date.split("/").map(Number);

  const handleConfirm = (selectedDate: number[]) => {
    onDateChange(selectedDate.join("/"));
  };

  const styles = StyleSheet.create({
    infoItem: {
      flex: 1,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.gray,
      flexDirection: "row-reverse",
      alignItems: "center",
      marginBottom: 16,
      padding: 12,
      ...customStyles.infoItem,
    },
    infoLabel: {
      color: colors.medium,
      fontSize: 15,
      fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
      textAlign: "right",
      marginRight: 10,
      ...customStyles.infoLabel,
    },
    infoValue: {
      color: "#111827",
      fontSize: 16,
      fontFamily: getFontFamily("Yekan_Bakh_Bold", "700"),
      fontWeight: Platform.OS === "ios" ? "700" : "normal",
      textAlign: "right",
      ...customStyles.infoValue,
    },
    valueContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 8,
      ...customStyles.valueContainer,
    },
    editButton: {
      padding: 4,
      ...customStyles.editButton,
    },
    errorText: {
      /* Added error text style */ color: colors.danger,
      fontSize: 12,
      marginTop: 5,
      textAlign: "right",
      fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    },
  });

  return (
    <>
      <TouchableOpacity
        style={styles.infoItem}
        onPress={() => setPickerVisible(true)}
      >
        <MaterialIcons name="calendar-month" size={20} color="#6B7280" />
        <Text style={styles.infoLabel}>
          {date ? toPersianDigits(date) : label}
        </Text>
        <View style={styles.valueContainer}>
          {/* <TouchableOpacity
          onPress={() => setPickerVisible(true)}
          style={styles.editButton}
        ></TouchableOpacity> */}
          {/* <Text style={styles.infoValue}>{toFarsiDigits(date)}</Text> */}
        </View>

        <PersianDatePicker
          isVisible={isPickerVisible}
          onClose={() => setPickerVisible(false)}
          onConfirm={handleConfirm}
          // initialDate={dateArray}
          {...datePickerProps}
        />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </>
  );
};

export { toFarsiDigits, persianMonths, getFontFamily };
