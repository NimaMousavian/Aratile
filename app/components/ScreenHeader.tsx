import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import colors from "../config/colors";
import AppText from "./Text";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../StackNavigator";

interface IProps {
  title: string;
  isProfilePage?: boolean;
}

const ScreenHeader: React.FC<IProps> = ({ title, isProfilePage = false }) => {
  const navigation = useNavigation<AppNavigationProp>();


  const textColor = isProfilePage ? colors.white : colors.dark;
  const iconColor = isProfilePage ? "white" : colors.secondary;

  return (
    <View style={[
      styles.header,
      { backgroundColor: isProfilePage ? 'transparent' : colors.background }
    ]}>
      <TouchableOpacity style={styles.icon} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-forward-ios" size={24} color={iconColor} />
      </TouchableOpacity>
      <AppText style={[styles.headerText, { color: textColor }]}>{title}</AppText>
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
    // borderBottomLeftRadius: 20,
    // borderBottomRightRadius: 20,
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
});

export default ScreenHeader;