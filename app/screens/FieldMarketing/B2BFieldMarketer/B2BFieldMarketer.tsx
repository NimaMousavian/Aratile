import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import AppTextInput from "../../../components/TextInput";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../../../StackNavigator";
import IconButton from "../../../components/IconButton";
import colors from "../../../config/colors";
import AppButton from "../../../components/Button";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const B2BFieldMarketer = () => {
  const navigation = useNavigation<AppNavigationProp>();
  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row-reverse",
          justifyContent: "space-between",
        }}
      >
        <AppTextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          placeholder="جستجو کنید..."
          onChangeText={() => {}}
          width={"78%"}
        ></AppTextInput>
        <AppButton
          title="جستجو"
          onPress={() => navigation.navigate("CustomerInfo")}
        />
      </View>
      <TouchableOpacity
        style={styles.addIconContainer}
        onPress={() => navigation.navigate("AddNewShop")}
      >
        <MaterialIcons name="add" size={35} color={"white"} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, padding: 20 },
  addIconContainer: {
    backgroundColor: colors.secondary,
    borderRadius: "100%",
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 10,
    bottom: 10,
  },
});

export default B2BFieldMarketer;
