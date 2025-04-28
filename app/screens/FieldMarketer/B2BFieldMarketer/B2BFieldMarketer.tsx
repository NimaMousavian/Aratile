import React from "react";
import { StyleSheet, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../../../StackNavigator";
import colors from "../../../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ScreenHeader from "../../../components/ScreenHeader";
import SearchInput from "../../../components/SearchInput";

const B2BFieldMarketer = () => {
  const navigation = useNavigation<AppNavigationProp>();
  return (
    <>
      <ScreenHeader
        title="بازاریابی میدانی B2B"
        rightComponent={
          <View style={styles.headerIconContainer}>
            <MaterialIcons
              name="add"
              size={24}
              color="white"
              onPress={() => navigation.navigate("AddNewShop")}
            />
          </View>
        }
      />
      <View style={styles.container}>
        <SearchInput
          value=""
          onChangeText={() => { }}
          onSearch={() => navigation.navigate("CustomerInfo")}
        />
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
  headerIconContainer: {
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

export default B2BFieldMarketer;