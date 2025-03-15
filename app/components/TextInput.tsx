import React from "react";
import { View, TextInput, StyleSheet, TextInputProps } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import defaultStyles from "../config/styles";
import colors from "../config/colors";

interface AppTextInputProps extends TextInputProps {
  icon?: string; // Icon name for MaterialCommunityIcons
  width?: string | number; // Allow both string (e.g., "100%") and number (e.g., 300)
  height?: string | number;
}

const AppTextInput: React.FC<AppTextInputProps> = ({
  icon,
  width = "100%",
  height,
  ...otherProps
}) => {
  return (
    <View style={[styles.container, { width: width as any }]}>
      {icon && (
        <MaterialCommunityIcons
          name={icon as any}
          size={20}
          color={defaultStyles.colors.medium}
          style={styles.icon}
        />
      )}
      <TextInput
        placeholderTextColor={defaultStyles.colors.medium}
        style={[
          defaultStyles.text,
          { textAlign: "right", height: height as any },
        ]}
        textAlign="right"
        {...otherProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: defaultStyles.colors.light,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: "row-reverse",
    padding: 2,
    marginVertical: 10,
  },
  icon: {
    marginLeft: 10,
    marginVertical: "auto",
  },
});

export default AppTextInput;
