import React from "react";
import { StyleSheet, View } from "react-native";
import AppText from "../../../components/Text";
import AppTextInput from "../../../components/TextInput";
import { getFontFamily } from "../../Cashier/ReceiveNewInvoiceScreen/ReceiveNewInvoiceScreen";
import colors from "../../../config/colors";

const AddNewShop = () => {
  const InputContainer: React.FC<{
    title: string;
    children: React.ReactElement[];
  }> = ({ title, children }) => {
    return (
      <View style={styles.inputContainer}>
        <AppText style={styles.title}>{title}</AppText>
        <View style={styles.divider}></View>
        <View style={styles.gridContainer}>{children.map((item) => item)}</View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <InputContainer title="مشخصات فردی">
        <AppTextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          placeholder="جستجو کنید..."
          onChangeText={() => {}}
        ></AppTextInput>
        <AppTextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          placeholder="جستجو کنید..."
          onChangeText={() => {}}
        ></AppTextInput>
      </InputContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    borderColor: colors.gray,
    padding: 15,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: colors.gray,
    marginVertical: 5,
  },
  gridContainer: {},
  title: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 20,
    textAlign: "center",
    color: colors.secondary,
  },
});

export default AddNewShop;
