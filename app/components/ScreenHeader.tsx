import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View } from "react-native";
import colors from "../config/colors";
import AppText from "./Text";

interface IProps {
  title: string;
}

const ScreenHeader: React.FC<IProps> = ({ title }) => {
  return (
    <LinearGradient
      colors={[colors.secondary, colors.primary]}
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <AppText style={styles.headerText}>{title}</AppText>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "flex-end",
    height: 110,
    // borderBottomLeftRadius: 20,
    // borderBottomRightRadius: 20,
  },
  headerText: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 24,
    color: colors.white,
  },
});

export default ScreenHeader;
