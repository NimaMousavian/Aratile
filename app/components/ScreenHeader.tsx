import { LinearGradient } from "expo-linear-gradient";
import React, { ReactNode } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import colors from "../config/colors";
import AppText from "./Text";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../StackNavigator";

interface IProps {
  title: string;
  isProfilePage?: boolean;
  isFieldMarketerPage?: boolean;
  rightComponent?: ReactNode;
}

const ScreenHeader: React.FC<IProps> = ({
  title,
  isProfilePage = false,
  isFieldMarketerPage = false,
  rightComponent
}) => {
  const navigation = useNavigation<AppNavigationProp>();

  const textColor = isProfilePage ? colors.white : colors.dark;
  const iconColor = isProfilePage ? "white" : colors.secondary;

  // Determine background color based on page type
  let backgroundColor;
  if (isProfilePage) {
    backgroundColor = 'transparent';
  } else if (isFieldMarketerPage) {
    backgroundColor = colors.white;
  } else {
    backgroundColor = colors.background;
  }

  return (
    <View style={[
      styles.header,
      { backgroundColor }
    ]}>
      <TouchableOpacity style={styles.icon} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-forward-ios" size={24} color={iconColor} />
      </TouchableOpacity>
      <AppText style={[styles.headerText, { color: textColor }]}>{title}</AppText>

      {rightComponent && (
        <View style={styles.rightComponentContainer}>
          {rightComponent}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 45,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    height: 110,
    backgroundColor: colors.background,
  },
  headerText: {
    fontFamily: "Yekan_Bakh_Fat",
    fontSize: 23,
    color: colors.dark,
  },
  icon: {
    position: "absolute",
    right: 12,
    top: 63,
  },
  rightComponentContainer: {
    position: "absolute",
    left: 12,
    top: 63,
  }
});

export default ScreenHeader;