import React from "react";
import { StyleSheet, View } from "react-native";
import colors from "../config/colors";

const LabelRequest = () => {
  return <View style={styles.container}></View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 0,
    paddingTop: 5,
    backgroundColor: colors.background,
    display: "flex",
    flexDirection: "column",
  },
});

export default LabelRequest;
