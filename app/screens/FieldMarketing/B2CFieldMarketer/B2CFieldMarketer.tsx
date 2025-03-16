import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import colors from "../../../config/colors";
import AppTextInput from "../../../components/TextInput";
import AppButton from "../../../components/Button";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../../../StackNavigator";

const B2CFieldMarketer = () => {
  const navigation = useNavigation<AppNavigationProp>();
  return (
    <View style={styles.container}>
      <View
        style={{
          flexDirection: "row-reverse",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <AppTextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          placeholder="جستجو کنید..."
          onChangeText={() => {}}
          width={"78%"}
          containerStyle={{ marginBottom: 0 }}
        ></AppTextInput>
        <AppButton title="جستجو" onPress={() => {}} />
      </View>
      <TouchableOpacity
        style={styles.addIconContainer}
        onPress={() => navigation.navigate("AddNewProject")}
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

export default B2CFieldMarketer;
