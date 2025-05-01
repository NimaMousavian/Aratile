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
import { getFontFamily } from "./PersianDatePicker"; // Reuse utilities from PersianDatePicker
import { toPersianDigits } from "../utils/converters";

interface CustomStyles {
  modalOverlay?: ViewStyle;
  modalContent?: ViewStyle;
  pickerContainer?: ViewStyle;
  pickerHeader?: ViewStyle;
  pickerTitle?: TextStyle;
  timeSelectors?: ViewStyle;
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

interface PersianTimePickerProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (time: number[]) => void;
  initialTime?: number[];
  customStyles?: CustomStyles;
  confirmButtonText?: string;
  cancelButtonText?: string;
  headerTitle?: string;
}

export const PersianTimePicker: React.FC<PersianTimePickerProps> = ({
  isVisible,
  onClose,
  onConfirm,
  initialTime = [10, 0], // Default to 10:00
  customStyles = {},
  confirmButtonText = "تأیید",
  cancelButtonText = "انصراف",
  headerTitle = "انتخاب زمان",
}) => {
  const [selectedHour, setSelectedHour] = useState(initialTime[0]);
  const [selectedMinute, setSelectedMinute] = useState(initialTime[1]);

  const hours = Array.from({ length: 24 }, (_, i) => i); // 0 to 23
  const minutes = Array.from({ length: 60 }, (_, i) => i); // 0 to 59

  const handleConfirm = () => {
    onConfirm([selectedHour, selectedMinute]);
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
    timeSelectors: {
      flexDirection: "row",
      justifyContent: "space-between",
      height: 200,
      ...customStyles.timeSelectors,
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
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>{headerTitle}</Text>
            </View>

            <View style={styles.timeSelectors}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>ساعت</Text>
                <ScrollView style={styles.pickerScroll}>
                  {hours.map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.pickerItem,
                        selectedHour === hour && styles.selectedItem,
                      ]}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedHour === hour && styles.selectedItemText,
                        ]}
                      >
                        {toPersianDigits(hour.toString().padStart(2, "0"))}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>دقیقه</Text>
                <ScrollView style={styles.pickerScroll}>
                  {minutes.map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.pickerItem,
                        selectedMinute === minute && styles.selectedItem,
                      ]}
                      onPress={() => setSelectedMinute(minute)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedMinute === minute && styles.selectedItemText,
                        ]}
                      >
                        {toPersianDigits(minute.toString().padStart(2, "0"))}
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

interface TimePickerFieldProps {
  label: string;
  time: string; // Format: HH:mm
  onTimeChange: (time: string) => void;
  timePickerProps?: Partial<PersianTimePickerProps>;
  customStyles?: CustomStyles;
  error?: string;
}

export const TimePickerField: React.FC<TimePickerFieldProps> = ({
  label,
  time,
  onTimeChange,
  timePickerProps = {},
  customStyles = {},
  error,
}) => {
  const [isPickerVisible, setPickerVisible] = useState(false);
  const timeArray = time
    ? time.split(":").map(Number)
    : [
        Number(new Date().getHours().toString().padStart(2, "0")),
        Number(new Date().getMinutes().toString().padStart(2, "0")),
      ]; // Default to 10:00 if no time

  const handleConfirm = (selectedTime: number[]) => {
    const formattedTime = `${selectedTime[0]
      .toString()
      .padStart(2, "0")}:${selectedTime[1].toString().padStart(2, "0")}`;
    onTimeChange(formattedTime);
  };

  const styles = StyleSheet.create({
    infoItem: {
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.gray,
      flexDirection: "row-reverse",
      alignItems: "center",
      marginBottom: 16,
      padding: 12,
      backgroundColor: colors.white,
      ...customStyles.infoItem,
    },
    infoLabel: {
      color: colors.dark,
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
      color: colors.danger,
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
        <MaterialIcons name="access-time" size={20} color="#6B7280" />
        <Text style={styles.infoLabel}>
          {time ? toPersianDigits(time) : label}
        </Text>
        <View style={styles.valueContainer} />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <PersianTimePicker
        isVisible={isPickerVisible}
        onClose={() => setPickerVisible(false)}
        onConfirm={handleConfirm}
        initialTime={timeArray}
        {...timePickerProps}
      />
    </>
  );
};
