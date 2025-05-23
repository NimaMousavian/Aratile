import { StatusBar } from "expo-status-bar";
import { I18nManager, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import * as Font from "expo-font";
import { useState, useEffect, useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import HomeScreen from "./app/screens/HomeScreen";
import IssuingNewInvoice from "./app/screens/IssuingNewInvoice/IssuingNewInvoice";
import StackNavigator from "./app/StackNavigator";
import { PaperProvider } from "react-native-paper";
import navigationTheme from "./app/config/navigationTheme";
import { AuthProvider } from "./app/screens/AuthContext";
import 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();

type RootStackParamList = {
  Home: undefined;
  IssuingNewInvoice: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App(): JSX.Element {
  const [appIsReady, setAppIsReady] = useState<boolean>(false);

  useEffect(() => {
    async function loadFonts(): Promise<void> {
      try {
        await Font.loadAsync({
          Yekan_Bakh_Regular: require("./assets/fonts/Yekan_Bakh_EN_Regular.ttf"),
          Yekan_Bakh_Bold: require("./assets/fonts/Yekan_Bakh_EN_Bold.ttf"),
          Yekan_Bakh_Fat: require("./assets/fonts/YekanBakhFaNum-ExtraBold.ttf"),
        });
        setAppIsReady(true);
      } catch (error) {
        console.error("Error loading fonts:", error);
        setAppIsReady(true);
      }
    }

    loadFonts();
  }, []);

  const onLayoutRootView = useCallback(async (): Promise<void> => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null as unknown as JSX.Element;
  }

  return (
    <AuthProvider>
      <PaperProvider>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <NavigationContainer theme={navigationTheme}>
            <StackNavigator />
          </NavigationContainer>
          <StatusBar style="auto" />
        </View>
      </PaperProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
});