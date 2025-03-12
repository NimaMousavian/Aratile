import React from "react";
import { Text } from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import HomeScreen from "./screens/Seller/HomeScreen";
import IssuingNewInvoice from "./screens/Seller/IssuingNewInvoice/IssuingNewInvoice";
import styles from "./config/styles";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import colors from "./config/colors";
import BarcodeScanner from "./screens/Seller/IssuingNewInvoice/BarcodeScanner";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";

// Define your navigation param list
export type RootStackParamList = {
  Home: undefined;
  IssuingNewInvoic: undefined;
  BarCodeScanner: undefined;
  // Add other screen names here as needed
};

export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Stack = createStackNavigator();

const StackNavigator = () => {
  const navigation = useNavigation();
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        // headerShown: false,
        cardStyle: { backgroundColor: "#FFFFFF" },
        gestureEnabled: true,
        gestureDirection: "horizontal-inverted",
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        transitionSpec: {
          open: {
            animation: "timing",
            config: { duration: 350 },
          },
          close: {
            animation: "timing",
            config: { duration: 350 },
          },
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="IssuingNewInvoic"
        component={IssuingNewInvoice}
        options={{
          headerTitleAlign: "center",
          headerTitleStyle: styles.headerTitleStyle,
          headerStyle: styles.headerStyle,
          title: "ثبت فاکتور جدید",
          headerLeft: ({ canGoBack }) =>
            canGoBack ? (
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.white}
                style={{ marginRight: 15 }}
                onPress={() => navigation.goBack()}
              />
            ) : null,
          headerRight: ({ canGoBack }) =>
            canGoBack ? (
              <Ionicons
                name="arrow-forward"
                size={24}
                color={colors.primary}
                style={{ marginRight: 15 }}
                onPress={() => navigation.goBack()}
              />
            ) : null,
        }}
      />
      <Stack.Screen
        name="BarCodeScanner"
        component={BarcodeScanner}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;
