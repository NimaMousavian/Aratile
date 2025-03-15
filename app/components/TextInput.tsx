import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  Text,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import colors from "../config/colors";

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

interface AppTextInputProps extends TextInputProps {
  icon?: React.ComponentProps<typeof MaterialIcons>["name"];
  width?: string | number;
  height?: string | number;
  label?: string;
  inputId?: string;
  onChangeInput?: (id: string, value: string) => void;
  value?: string;
  style?: any;
  containerStyle?: any;
  inputContainerStyle?: any;
  labelStyle?: any;
}

const AppTextInput: React.FC<AppTextInputProps> = ({
  icon,
  width = "100%",
  height,
  label,
  inputId = "",
  onChangeInput,
  value = "",
  placeholder = "",
  style,
  containerStyle,
  inputContainerStyle,
  labelStyle,
  ...otherProps
}) => {
  return (
    <View
      style={[
        styles.inputContainer,
        width ? { width } : undefined,
        containerStyle,
      ]}
    >
      {label && <Text style={[styles.inputLabel, labelStyle]}>{label}</Text>}
      <View style={[styles.textInputContainer, inputContainerStyle]}>
        {icon && (
          <MaterialIcons
            name={icon as any}
            size={20}
            color={colors.medium}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.textInput, style]}
          placeholder={placeholder}
          value={value}
          onChangeText={(newValue) => {
            if (onChangeInput && inputId) {
              onChangeInput(inputId, newValue);
            }
          }}
          textAlign="right"
          {...otherProps}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
    color: colors.dark,
    marginBottom: 8,
    textAlign: "right",
  },
  textInputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.dark,
    borderRadius: 8,
    backgroundColor: colors.white,
  },
  icon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    padding: 12,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    fontSize: 15,
    color: colors.dark,
    textAlign: "right",
  },
});

export default AppTextInput;
