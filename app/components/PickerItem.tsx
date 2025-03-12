import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";

import AppText from "./Text";
import colors from "../config/colors";

export interface PickerItemType {
  label: string;
  value: number | string;
  [key: string]: any; // Allow additional properties
}

interface PickerItemProps {
  item: PickerItemType;
  onPress: () => void;
}

function PickerItem({ item, onPress }: PickerItemProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <AppText style={styles.text}>{item.label}</AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.primary,
    marginVertical: 10,
  },
  text: {
    padding: 20,
  },
});

export default PickerItem;
