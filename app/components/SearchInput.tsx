import React, { useRef, useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  Platform,
  Animated,
  LayoutAnimation,
  LayoutChangeEvent,
  UIManager,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import colors from "../config/colors";
import Accordion from "./Accordion";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void;
  onClear?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  buttonStyle?: ViewStyle;
  buttonTextStyle?: TextStyle;
  filterItems?: React.ReactNode;
  headerStyle?: ViewStyle; // Custom styles for default header
  contentStyle?: ViewStyle;
  hasFilter?: boolean;
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
  onClear,
  containerStyle,
  inputStyle,
  buttonStyle,
  buttonTextStyle,
  filterItems,
  headerStyle,
  contentStyle,
  hasFilter = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const animation = useRef<Animated.Value>(new Animated.Value(0)).current;

  const toggleAccordion = () => {
    // Configure LayoutAnimation for smooth transitions
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const toValue = isExpanded ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setIsExpanded(!isExpanded);
  };

  const animatedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight],
  });

  const onContentLayout = (event: LayoutChangeEvent) => {
    // Dynamically measure content height
    const { height } = event.nativeEvent.layout;
    setContentHeight(height);
  };

  return (
    <>
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
            onPress={() => {
              onClear?.();
              onChangeText("");
            }}
            style={styles.clearButton}
          >
            <Feather name="x" size={20} color="#999" />
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          style={[styles.searchButton, buttonStyle]}
          onPress={onSearch}
        >
          <Feather name="search" size={22} color="#fff" />
        </TouchableOpacity>
        {hasFilter && (
          <TouchableOpacity
            onPress={toggleAccordion}
            style={[styles.header, headerStyle]}
          >
            <MaterialIcons
              name="filter-list-alt"
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>
        )}
      </View>
      <Animated.View
        style={[
          styles.content,
          contentStyle,
          { height: animatedHeight, overflow: "hidden" },
        ]}
      >
        <View onLayout={onContentLayout} style={styles.innerContent}>
          {filterItems}
        </View>
      </Animated.View>
    </>
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
    elevation: 1,
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
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    width: 42,
    height: 42,
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    width: 42,
    height: 42,
    marginLeft: 5,
  },
  headerText: {
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.primary,
  } as TextStyle,
  arrow: {
    fontSize: 16,
  } as TextStyle,
  content: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 1,
  },
  innerContent: {
    padding: 15,
    paddingBottom: 0,
    position: "absolute",
    width: "100%",
  },
});

export default SearchInput;
