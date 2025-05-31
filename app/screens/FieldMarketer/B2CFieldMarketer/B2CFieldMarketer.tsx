import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import colors from "../../../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../../../StackNavigator";
import ScreenHeader from "../../../components/ScreenHeader";
import SearchInput from "../../../components/SearchInput";

const B2CFieldMarketer = () => {
  const navigation = useNavigation<AppNavigationProp>();
  return (
    <>
      <ScreenHeader
        title="بازاریابی میدانی B2C"
        rightComponent={
          <TouchableOpacity
            style={styles.addIconContainer}
            onPress={() => navigation.navigate("AddNewProject")}
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
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

export default B2CFieldMarketer;