import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import colors from "../config/colors";

// تعریف تایپ‌های مورد نیاز
export interface ModalButton {
  id: string;
  text: string;
  color: string;
  icon?: React.ComponentProps<typeof MaterialIcons>["name"];
  onPress: (inputValues: Record<string, string>) => void;
}

export interface ModalInput {
  id: string;
  label: string;
  placeholder: string;
  show: boolean;
  secureTextEntry?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

export interface ModalMessage {
  text: string;
  icon?: React.ComponentProps<typeof MaterialIcons>["name"];
  iconColor?: string;
}

export interface ModalHeaderConfig {
  title: string;
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  colors: string[];
}

interface ReusableModalProps {
  visible: boolean;
  onClose: () => void;
  headerConfig: ModalHeaderConfig;
  messages?: ModalMessage[];
  inputs?: ModalInput[];
  buttons: ModalButton[];
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

const ReusableModal: React.FC<ReusableModalProps> = ({
  visible,
  onClose,
  headerConfig,
  messages = [],
  inputs = [],
  buttons,
}) => {
  // استیت برای نگه داشتن مقادیر ورودی‌ها
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  // تابع برای تغییر مقادیر ورودی‌ها
  const handleInputChange = (id: string, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // تابع برای بستن مدال و ریست کردن ورودی‌ها
  const handleClose = () => {
    setInputValues({});
    onClose();
  };

  // تابع برای فراخوانی اکشن دکمه‌ها
  const handleButtonPress = (button: ModalButton) => {
    button.onPress(inputValues);
    setInputValues({});
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
      presentationStyle="overFullScreen"
      supportedOrientations={["portrait", "landscape"]}
      avoidKeyboard={true} // 👈 مهم: کیبورد روی مدال باز میشه
    >
      <View style={styles.rootContainer}>
        {/* پس‌زمینه نیمه‌شفاف */}
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          {/* بدنه مدال */}
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContainer}
            onPress={(e) => e.stopPropagation()} // جلوگیری از بسته شدن مدال با کلیک داخلش
          >
            {/* هدر مدال */}
            <LinearGradient
              colors={headerConfig.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalHeader}
            >
              <View style={styles.headerContent}>
                <MaterialIcons
                  name={headerConfig.icon}
                  size={24}
                  color="white"
                />
                <Text style={styles.headerTitle}>{headerConfig.title}</Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="white" />
              </TouchableOpacity>
            </LinearGradient>

            {/* بدنه اصلی */}
            <ScrollView style={styles.modalBody}>
              {/* پیام‌ها */}
              {messages.map((message, index) => (
                <View key={index} style={styles.messageContainer}>
                  {message.icon && (
                    <MaterialIcons
                      name={message.icon}
                      size={20}
                      color={message.iconColor || colors.medium}
                      style={styles.messageIcon}
                    />
                  )}
                  <Text style={styles.messageText}>{message.text}</Text>
                </View>
              ))}

              {/* ورودی‌ها */}
              {inputs.filter((input) => input.show).map((input) => (
                <View key={input.id} style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{input.label}</Text>
                  <TextInput
                    style={[
                      styles.input,
                      input.multiline && {
                        height: input.numberOfLines
                          ? input.numberOfLines * 24
                          : 100,
                      },
                    ]}
                    placeholder={input.placeholder}
                    value={inputValues[input.id] || ""}
                    onChangeText={(text) => handleInputChange(input.id, text)}
                    secureTextEntry={input.secureTextEntry}
                    multiline={input.multiline}
                    numberOfLines={input.numberOfLines}
                    textAlign="right"
                    placeholderTextColor={colors.medium}
                  />
                </View>
              ))}
            </ScrollView>

            {/* دکمه‌ها */}
            <View style={styles.buttonContainer}>
              {buttons.map((button) => (
                <TouchableOpacity
                  key={button.id}
                  style={[styles.button, { backgroundColor: button.color }]}
                  onPress={() => handleButtonPress(button)}
                >
                  {button.icon && (
                    <MaterialIcons
                      name={button.icon}
                      size={20}
                      color="white"
                      style={styles.buttonIcon}
                    />
                  )}
                  <Text style={styles.buttonText}>{button.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    ...Platform.select({
      ios: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      },
    }),
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: "hidden",
    maxHeight: "90%",
    zIndex: 1002,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 1003,
  },
  headerContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    color: colors.white,
    marginRight: 8,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "bold"),
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  messageContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
  },
  messageIcon: {
    marginLeft: 8,
  },
  messageText: {
    flex: 1,
    fontSize: 15,
    color: colors.dark,
    textAlign: "right",
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    color: colors.dark,
    marginBottom: 6,
    textAlign: "right",
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    textAlign: "right",
    color: colors.dark,
  },
  buttonContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  button: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    margin: 4,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
});

export default ReusableModal;
