import React from "react";
import { TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import colors from "../config/colors";

type FontWeight = "700" | "600" | "500" | "bold" | "semi-bold" | string;

const getFontFamily = (baseFont: string, weight: FontWeight): string => {
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

type IconButtonProps = {
  text: string;
  iconName: React.ComponentProps<typeof MaterialIcons>["name"];
  backgroundColor: string;
  textColor?: string;
  iconColor?: string;
  iconSize?: number;
  onPress: () => void;
  style?: object;
  flex?: number;
  disabled?: boolean;
  textStyle?: object;
};

const IconButton: React.FC<IconButtonProps> = ({
  text,
  iconName,
  backgroundColor = colors.primary,
  textColor = "#FFFFFF",
  iconColor = "#FFFFFF",
  iconSize = 28,
  onPress,
  style,
  flex = 0.49,
  disabled = false,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      style={[styles.actionBtn, { backgroundColor: backgroundColor }, style]}
      onPress={onPress}
    >
      <MaterialIcons name={iconName} size={iconSize} color={iconColor} />
      <Text style={[styles.actionBtnText, { color: textColor }, textStyle]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionBtn: {
    flexDirection: "row-reverse",
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    // width: "100%",
    marginVertical: 8,
  },
  actionBtnText: {
    fontSize: 20,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "600"),
    marginRight: 8,
  },
});

export default IconButton;
