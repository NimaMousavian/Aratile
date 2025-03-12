import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // For icons
import colors from "../config/colors"; // Assuming you have a colors config
import AppText from "./Text";

// Define props interface
interface CheckboxProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked = false,
  onChange,
  disabled = false,
}) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handlePress = () => {
    if (!disabled) {
      const newValue = !isChecked;
      setIsChecked(newValue);
      onChange?.(newValue); // Optional chaining for onChange
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        style={styles.checkboxContainer}
      >
        <MaterialCommunityIcons
          name={isChecked ? "checkbox-marked" : "checkbox-blank-outline"}
          size={24}
          color={disabled ? colors.medium : colors.secondary}
        />
      </TouchableOpacity>
      {label && <AppText style={styles.label}>{label}</AppText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
  },
  checkboxContainer: {
    padding: 5,
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.dark,
  },
});

export default Checkbox;
