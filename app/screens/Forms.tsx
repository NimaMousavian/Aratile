import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import StackNavigator from "../StackNavigator";
import ScreenHeader from "../components/ScreenHeader";
import colors from "../config/colors";
import { AppNavigationProp } from "../StackNavigator";

const Forms = () => {
  const navigation = useNavigation<AppNavigationProp>();
  return (
    <>
      <ScreenHeader
        title="فرم ها"
    
      />
      <View style={styles.container}>

      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  
  },
  addIconContainer: {
   backgroundColor: colors.success,
      width: 40,
      height: 40,
      marginLeft: 10,
      marginTop:-4,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 12,
    }
});

export default Forms;