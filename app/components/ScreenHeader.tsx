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
  const iconColor = isProfilePage ? "white" : "black";

  return (
    <View style={styles.header}>
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
    paddingHorizontal: 55,
    alignItems: "flex-end",
    justifyContent: "flex-end",
    height: 110,
    // borderBottomLeftRadius: 20,
    // borderBottomRightRadius: 20,
  },
  headerText: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 24,
    color: colors.dark, 
  },
  icon: {
    position: "absolute",
    right: 20,
    top: 65,
  },
});

export default ScreenHeader;