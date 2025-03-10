import { StatusBar } from "expo-status-bar";
import { I18nManager, StyleSheet, Text, View } from "react-native";
import HomeScreen from "./app/screens/Seller/HomeScreen";
import { useEffect, useState } from "react";
import Font from "expo-font";
import IssuingNewInvoice from "./app/screens/Seller/IssuingNewInvoice/IssuingNewInvoice";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./app/StackNavigator";

I18nManager.forceRTL(true);

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        Yekan_Bakh_Regular: require("./assets/fonts/Yekan_Bakh_EN_Regular.ttf"),
        Yekan_Bakh_Bold: require("./assets/fonts/Yekan_Bakh_EN_Bold.ttf"),
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  // if (!fontsLoaded) {
  //   return null;
  // }

  return (
    <NavigationContainer>
      {/* <View style={styles.container}> */}
      <StackNavigator />
      {/* </View> */}
    </NavigationContainer>
    //<StatusBar style="auto" /> */}
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
});
