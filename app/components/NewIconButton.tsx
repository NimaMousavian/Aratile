import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
} from "react-native";
import AppText from "./Text";
import colors from "../config/colors";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface IconButtonProps {
  text: string;
  iconName: any;
  onPress: () => void;
  backgroundColor?: string;
  flex?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  gradient?: boolean;
  iconSize?: number;
  textStyle?: StyleProp<ViewStyle>;
}

const IconButton: React.FC<IconButtonProps> = ({
  text,
  iconName,
  onPress,
  backgroundColor = colors.primary,
  flex,
  disabled = false,
  style,
  gradient = false,
  iconSize = 24,
  textStyle,
}) => {
  const containerStyle = [
    styles.container,
    { backgroundColor },
    flex ? { flex } : {},
    disabled ? styles.disabled : {},
    style,
  ];

  const renderContent = () => (
    <>
      <MaterialIcons name={iconName} color={colors.white} size={iconSize} />
      <AppText style={[styles.text, textStyle]}>{text}</AppText>
    </>
  );

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled}
    >
      {gradient ? (
        <LinearGradient
          colors={[colors.secondary, colors.primary]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {renderContent()}
        </LinearGradient>
      ) : (
        renderContent()
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    marginVertical: 5,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  text: {
    color: colors.white,
    marginRight: 10,
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 16,
  },
  disabled: {
    opacity: 0.6,
  },
  gradient: {
    borderRadius: 15,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    padding: 15,
  },
});

export default IconButton;
