import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Platform,
  Modal,
} from "react-native";
import colors from "../../config/colors";
import { toPersianDigits } from "../../utils/numberConversions";


const getFontFamily = (baseFont, weight) => {
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



const persianMonths = [
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

const ITEM_HEIGHT = 40; 

const MonthYearPicker = ({
  isVisible,
  onClose,
  onConfirm,
  initialDate = [1404, 1],
  startYear = 1300,
  yearCount = 200,
  confirmButtonText = "تأیید",
  cancelButtonText = "انصراف",
  headerTitle = "انتخاب ماه و سال",
}) => {
  const [selectedYear, setSelectedYear] = useState(initialDate[0]);
  const [selectedMonth, setSelectedMonth] = useState(initialDate[1]);

  useEffect(() => {
    setSelectedYear(initialDate[0]);
    setSelectedMonth(initialDate[1]);
  }, [initialDate]);

  const yearScrollRef = useRef(null);
  const monthScrollRef = useRef(null);

  const years = Array.from({ length: yearCount }, (_, i) => startYear + i);
  const months = Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    name: persianMonths[i],
  }));

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => {
        const yearIndex = years.indexOf(selectedYear);
        if (yearIndex !== -1 && yearScrollRef.current) {
          yearScrollRef.current.scrollTo({
            y: yearIndex * ITEM_HEIGHT,
            animated: true,
          });
        }

        const monthIndex = selectedMonth - 1;
        if (monthIndex !== -1 && monthScrollRef.current) {
          monthScrollRef.current.scrollTo({
            y: monthIndex * ITEM_HEIGHT,
            animated: true,
          });
        }
      }, 100); 
    }
  }, [isVisible]); 

  const handleConfirm = () => {
    onConfirm([selectedYear, selectedMonth]);
    onClose();
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: "90%",
      backgroundColor: "white",
      borderRadius: 20,
      padding: 20,
      maxHeight: "80%",
    },
    pickerContainer: {
      backgroundColor: "white",
    },
    pickerHeader: {
      borderBottomWidth: 1,
      borderBottomColor: "#E5E7EB",
      paddingBottom: 15,
      marginBottom: 15,
    },
    pickerTitle: {
      fontSize: 18,
      fontFamily: getFontFamily("Yekan_Bakh_Bold", "700"),
      color: "#1F2937",
      textAlign: "center",
    },
    dateSelectors: {
      flexDirection: "row",
      justifyContent: "space-between",
      height: 200,
    },
    pickerColumn: {
      flex: 1,
      marginHorizontal: 5,
    },
    pickerLabel: {
      fontSize: 14,
      fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
      color: "#6B7280",
      textAlign: "center",
      marginBottom: 10,
    },
    pickerScroll: {
      flex: 1,
    },
    pickerItem: {
      padding: 10,
      alignItems: "center",
      justifyContent: "center",
      height: ITEM_HEIGHT, 
    },
    selectedItem: {
      backgroundColor: "#F3F4F6",
      borderRadius: 8,
    },
    pickerItemText: {
      fontSize: 16,
      fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
      color: "#374151",
    },
    selectedItemText: {
      color: "#1F2937",
      fontFamily: getFontFamily("Yekan_Bakh_Bold", "700"),
    },
    pickerActions: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 20,
      gap: 10,
    },
    pickerButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    confirmButton: {
      backgroundColor: colors.success,
    },
    cancelButton: {
      backgroundColor: colors.danger,
    },
    confirmButtonText: {
      color: "white",
      fontSize: 16,
      fontFamily: getFontFamily("Yekan_Bakh_Bold", "700"),
    },
    cancelButtonText: {
      color: "white",
      fontSize: 16,
      fontFamily: getFontFamily("Yekan_Bakh_Bold", "700"),
    },
  });

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
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
                <ScrollView
                  style={styles.pickerScroll}
                  ref={yearScrollRef}
                >
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
                        {toPersianDigits(year)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>ماه</Text>
                <ScrollView
                  style={styles.pickerScroll}
                  ref={monthScrollRef}
                >
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

export default MonthYearPicker;