import React from "react";
import {
  StyleProp,
  StyleSheet,
  StyleSheetProperties,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";

import colors, { ColorKeys } from "../config/colors";
import AppText from "./Text";

interface AppButtonProps extends Omit<TouchableOpacityProps, "style"> {
  title: string;
  onPress: () => void;
  color?: ColorKeys; 
  style?: StyleProp<ViewStyle>;
}

const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  color = "primary",
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors[color] }, style]}
      onPress={onPress}
    >
      <AppText style={styles.text}>{title}</AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    // width: "100%",
    marginVertical: 8,
  },
  text: {
    color: colors.white,
    fontSize: 18,
    textTransform: "uppercase",
    fontFamily: "Yekan_Bakh_Bold",
  },
});

export default AppButton;
