import React, { useState, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  StyleSheet,
  Platform,
  UIManager,
  ViewStyle,
  TextStyle,
  LayoutChangeEvent,
} from "react-native";
import AppText from "./Text";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import colors from "../config/colors";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Define TypeScript interfaces for props
interface AccordionProps {
  title?: string; // Optional title for default header
  children: React.ReactNode; // Content to render inside accordion
  headerStyle?: ViewStyle; // Custom styles for default header
  contentStyle?: ViewStyle; // Custom styles for content container
  renderHeader?: (props: {
    isExpanded: boolean;
    toggleAccordion: () => void;
  }) => JSX.Element; // Custom header render function
  isInitiallyExpanded?: boolean; // Initial expanded state
  disabled?: boolean; // Disable interaction
}

const Accordion: React.FC<AccordionProps> = ({
  title = "فیلتر اطلاعات",
  children,
  headerStyle,
  contentStyle,
  renderHeader,
  isInitiallyExpanded = false,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(isInitiallyExpanded);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const animation = useRef<Animated.Value>(
    new Animated.Value(isInitiallyExpanded ? 1 : 0)
  ).current;

  const toggleAccordion = () => {
    if (disabled) return;

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
    <View style={styles.container}>
      {/* Header */}
      {renderHeader ? (
        <TouchableOpacity onPress={toggleAccordion} disabled={disabled}>
          {renderHeader({ isExpanded, toggleAccordion })}
        </TouchableOpacity>
      ) : (
        // <TouchableOpacity
        //   onPress={toggleAccordion}
        //   style={[styles.header, headerStyle]}
        //   disabled={disabled}
        // >
        //   <View style={{ flexDirection: "row-reverse", gap: 10 }}>
        //     <MaterialIcons
        //       name="filter-list-alt"
        //       size={24}
        //       color={colors.primary}
        //     />
        //     <AppText style={styles.headerText}>{title}</AppText>
        //   </View>
        //   {isExpanded ? (
        //     <MaterialIcons
        //       name="arrow-drop-up"
        //       size={24}
        //       color={colors.secondary}
        //     />
        //   ) : (
        //     <MaterialIcons
        //       name="arrow-drop-down"
        //       size={24}
        //       color={colors.secondary}
        //     />
        //   )}
        // </TouchableOpacity>
        <TouchableOpacity
          onPress={toggleAccordion}
          style={[styles.header, headerStyle]}
          disabled={disabled}
        >
          <MaterialIcons
            name="filter-list-alt"
            size={24}
            color={colors.white}
          />
        </TouchableOpacity>
      )}

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          contentStyle,
          { height: animatedHeight, overflow: "hidden" },
        ]}
      >
        <View onLayout={onContentLayout} style={styles.innerContent}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    // borderWidth: 1,
    // borderColor: "#ddd",
    // borderRadius: 10,
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    width: 50,
    height: 50,
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
  },
  innerContent: {
    padding: 15,
    position: "absolute",
    width: "100%",
  },
});

export default Accordion;
