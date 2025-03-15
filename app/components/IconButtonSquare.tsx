import React from "react";
import { TouchableOpacity, Text, StyleSheet, Platform, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

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

type IconButtonSquareProps = {
  text: string;
  iconName: React.ComponentProps<typeof MaterialIcons>["name"];
  backgroundColor: string;
  textColor?: string;
  iconColor?: string;
  iconSize?: number;
  onPress: () => void;
  style?: object;
  size?: number;
};

const IconButtonSquare: React.FC<IconButtonSquareProps> = ({
  text,
  iconName,
  backgroundColor,
  textColor = "#FFFFFF",
  iconColor = "#FFFFFF",
  iconSize = 24,
  onPress,
  style,
  size = 80
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.actionBtn,
        {
          backgroundColor: backgroundColor,
          width: size,
          height: size
        },
        style
      ]}
      onPress={onPress}
    >
      <View style={styles.buttonContent}>
        <MaterialIcons name={iconName} size={iconSize} color={iconColor} />
        <Text style={[styles.actionBtnText, { color: textColor }]}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionBtn: {
    borderRadius: 9,
    padding: 10,
    margin: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    fontSize: 14,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "600"),
    marginTop: 8,
    textAlign: "center",
  },
});

export default IconButtonSquare;