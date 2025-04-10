import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import colors from "../../config/colors";

interface UnsavedChangesModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

// تابع برای دریافت فونت مناسب با توجه به پلتفرم
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

const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={styles.modalContainer}>
          {/* هدر مدال */}
          <LinearGradient
            colors={[colors.danger, colors.warning]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.modalHeader}
          >
            <View style={styles.headerContent}>
              <MaterialIcons name="warning" size={24} color="white" />
              <Text style={styles.headerTitle}>تغییرات ذخیره نشده</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.modalBody}>
            {/* پیام اصلی */}
            <View style={styles.messageContainer}>
              <MaterialIcons
                name="info"
                size={24}
                color={colors.warning}
                style={styles.messageIcon}
              />
              <Text style={styles.messageText}>
                آیا مطمئن هستید که می‌خواهید بدون ذخیره تغییرات خارج شوید؟
              </Text>
            </View>

            {/* فضای خالی اضافی برای افزایش ارتفاع */}
            <View style={styles.spacer} />
          </View>

          {/* دکمه‌ها */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.success }]}
              onPress={onConfirm}
            >
              <MaterialIcons
                name="check"
                size={20}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>تایید</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.danger }]}
              onPress={onClose}
            >
              <MaterialIcons
                name="close"
                size={20}
                color="white"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>انصراف</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 500,
    minHeight: 50, // حداقل ارتفاع برای مدال
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",
    // حذف maxHeight برای جلوگیری از محدودیت ارتفاع
  },
  modalHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16, // افزایش ارتفاع هدر
  },
  headerContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    color: colors.white,
    marginRight: 10,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "bold"),
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
    // حذف maxHeight برای جلوگیری از اسکرول
  },
  messageContainer: {
    flexDirection: "row-reverse",
    alignItems: "flex-start", // تغییر به flex-start برای متن‌های بلندتر
    marginBottom: 12,
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
  },
  messageIcon: {
    marginLeft: 12,
    marginTop: 2, // کمی فاصله از بالا برای تراز بهتر با متن
  },
  messageText: {
    flex: 1,
    fontSize: 16,
    color: colors.dark,
    textAlign: "right",
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    lineHeight: 24,
  },
  spacer: {
    height: -10,
    padding: -500, // افزایش ارتفاع فضای خالی برای مدال بلندتر
  },
  buttonContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    padding: 20, // افزایش پدینگ اطراف دکمه‌ها
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  button: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14, // افزایش ارتفاع دکمه‌ها
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    margin: 4,
  },
  buttonIcon: {
    marginLeft: 10,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
});

export default UnsavedChangesModal;
