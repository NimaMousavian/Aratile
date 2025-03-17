import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TextStyle
} from 'react-native';
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../config/colors";
import IconButton from "../components/IconButton"; 
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

interface HeaderConfig {
  title?: string;
  icon?: React.ComponentProps<typeof MaterialIcons>["name"];
  colors?: string[] | readonly string[];
}

interface Button {
  id: string;
  text: string;
  color?: string;
  icon?: React.ComponentProps<typeof MaterialIcons>["name"];
  onPress?: (inputValues: Record<string, string>) => void;
}

interface Input {
  id: string;
  label: string;
  placeholder?: string;
  show?: boolean;
}

interface Message {
  text: string;
  icon?: React.ComponentProps<typeof MaterialIcons>["name"];
  iconColor?: string;
  textStyle?: TextStyle;
}

interface DynamicModalProps {
  visible: boolean;
  onClose: () => void;
  headerConfig?: HeaderConfig;
  inputs?: Input[];
  buttons?: Button[];
  messages?: Message[];
}

const DynamicModal: React.FC<DynamicModalProps> = ({
  visible,
  onClose,
  headerConfig = {
    title: "عنوان مدال",
    icon: "check-circle",
    colors: [colors.success, colors.success]
  },
  inputs = [],
  buttons = [
    {
      id: "confirm",
      text: "تایید",
      color: colors.success,
      icon: "done",
      onPress: () => { }
    },
    {
      id: "cancel",
      text: "انصراف",
      color: colors.medium,
      icon: "close",
      onPress: () => { }
    }
  ],
  messages = []
}) => {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const handleInputChange = (id: string, value: string): void => {
    setInputValues(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleButtonPress = (button: Button): void => {
    if (button.onPress) {
      button.onPress(inputValues);
    }

    setInputValues({});

    if (button.id !== "confirm") {
      onClose();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.centeredView}
        >
          <View style={styles.modalView}>
            <LinearGradient
              // @ts-ignore: type issues with LinearGradient colors prop
              colors={headerConfig.colors || [colors.success, colors.success]}
              style={styles.modalHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <MaterialIcons
                name={headerConfig.icon || "check-circle"}
                size={24}
                color={colors.white}
              />
              <Text style={styles.modalHeaderText}>
                {headerConfig.title || "عنوان مدال"}
              </Text>
            </LinearGradient>

            <View style={styles.modalContent}>
              {messages.map((message, index) => (
                <View key={`msg-${index}`} style={styles.messageContainer}>
                  {message.icon && (
                    <MaterialIcons
                      name={message.icon}
                      size={18}
                      color={message.iconColor || colors.primary}
                      style={styles.messageIcon}
                    />
                  )}
                  <Text
                    style={[
                      styles.messageText,
                      message.textStyle
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>
              ))}

              {inputs.filter(input => input.show !== false).map((input) => (
                <View key={input.id} style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>{input.label}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={input.placeholder || ""}
                    value={inputValues[input.id] || ""}
                    onChangeText={(value) => handleInputChange(input.id, value)}
                    textAlign="right"
                  />
                </View>
              ))}

              <View style={styles.buttonContainer}>
                {buttons.map((button) => (
                  <IconButton
                    key={button.id}
                    text={button.text}
                    iconName={button.icon || (button.id === "confirm" ? "done" : "close")}
                    backgroundColor={button.color || colors.medium}
                    onPress={() => handleButtonPress(button)}
                    style={styles.buttonStyle}
                  />
                ))}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20
  },
  modalView: {
    width: "100%",
    backgroundColor: colors.white,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 1
  },
  modalHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 16,
  },
  modalHeaderText: {
    fontSize: 18,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "600"),
    color: colors.white,
    marginRight: 8
  },
  modalContent: {
    padding: 20
  },
  messageContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 15
  },
  messageIcon: {
    marginLeft: 8
  },
  messageText: {
    fontSize: 16,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    color: colors.dark,
    textAlign: "right"
  },
  inputContainer: {
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 15,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
    color: colors.dark,
    marginBottom: 8,
    textAlign: "right"
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.dark,
    borderRadius: 8,
    padding: 12,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    fontSize: 15,
    backgroundColor: colors.white,
    color: colors.dark
  },
  buttonContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginTop: 10
  },
  buttonStyle: {
    flex: 0.48, 
  }
});

export default DynamicModal;