import { StatusBar } from "expo-status-bar";
import { I18nManager, StyleSheet, View, AppState } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";
import * as Font from "expo-font";
import { useState, useEffect, useCallback, useRef } from "react";
import * as SplashScreen from "expo-splash-screen";
import HomeScreen from "./app/screens/HomeScreen";
import IssuingNewInvoice from "./app/screens/IssuingNewInvoice/IssuingNewInvoice";
import StackNavigator from "./app/StackNavigator";
import { PaperProvider } from "react-native-paper";
import navigationTheme from "./app/config/navigationTheme";
import { AuthProvider } from "./app/screens/AuthContext";

// تابع برای اجبار LTR
const forceLayoutDirection = () => {
  try {
    if (I18nManager.isRTL) {
      I18nManager.forceRTL(false);
      I18nManager.allowRTL(false);
    }
  } catch (error) {
    console.warn("Error forcing layout direction:", error);
  }
};

// اجبار اولیه
forceLayoutDirection();

SplashScreen.preventAutoHideAsync();

type RootStackParamList = {
  Home: undefined;
  IssuingNewInvoice: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App(): JSX.Element {
  const [appIsReady, setAppIsReady] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<any>(null);

  // Hook برای مدیریت RTL
  const useRTLManager = () => {
    useEffect(() => {
      // اجرای اولیه
      forceLayoutDirection();

      // تنظیم interval برای چک مداوم هر 500 میلی‌ثانیه
      intervalRef.current = setInterval(() => {
        forceLayoutDirection();
      }, 500);

      // listener برای تغییرات AppState
      const handleAppStateChange = (nextAppState: string) => {
        if (nextAppState === 'active') {
          forceLayoutDirection();
        }
      };

      appStateRef.current = AppState.addEventListener('change', handleAppStateChange);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        if (appStateRef.current) {
          appStateRef.current.remove();
        }
      };
    }, []);
  };

  // استفاده از hook
  useRTLManager();

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
      // اطمینان از LTR قبل از نمایش
      forceLayoutDirection();
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // تمیز کردن منابع هنگام unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (appStateRef.current) {
        appStateRef.current.remove();
      }
    };
  }, []);

  if (!appIsReady) {
    return null as unknown as JSX.Element;
  }

  return (
    <AuthProvider>
      <PaperProvider>
        <View style={styles.container} onLayout={onLayoutRootView}>
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
    // اضافه کردن direction برای اطمینان
    flexDirection: 'column',
    writingDirection: 'ltr',
  },
});