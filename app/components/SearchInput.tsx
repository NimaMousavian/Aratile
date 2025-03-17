import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import colors from "../config/colors";

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  buttonStyle?: ViewStyle;
  buttonTextStyle?: TextStyle;
}

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

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "جستجو...",
  value,
  onChangeText,
  onSearch,
  containerStyle,
  inputStyle,
  buttonStyle,
  buttonTextStyle,
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={[styles.input, inputStyle]}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        textAlign="right"
        allowFontScaling={false}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {value ? (
        <TouchableOpacity
          onPress={() => onChangeText("")}
          style={styles.clearButton}
        >
          <Feather name="x" size={20} color="#999" />
        </TouchableOpacity>
      ) : null}

      <TouchableOpacity
        style={[styles.searchButton, buttonStyle]}
        onPress={onSearch}
      >
        <Feather name="search" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 3,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  input: {
    flex: 1,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    fontSize: 14,
    padding: 8,
    height: 40,
  },
  clearButton: {
    padding: 5,
  },
  searchButton: {
    backgroundColor: colors.primary ,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});

export default SearchInput;