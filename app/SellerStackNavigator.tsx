import React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  CardStyleInterpolators,
  StackNavigationOptions,
  StackScreenProps,
} from "@react-navigation/stack";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import AppSelectionScreen from "./screens/AppSelectionScreen";
import HomeScreen from "./screens/Seller/HomeScreen";
import IssuingNewInvoice from "./screens/Seller/IssuingNewInvoice/IssuingNewInvoice";
import BarcodeScanner from "./screens/Seller/IssuingNewInvoice/BarcodeScanner";
import { MarketerHomeScreen } from "./screens/MarketerHome/MarketerHomeScreen";
import CashierHomeScreen from "./screens/Cashier/CashierHomeScreen";
import ReceiveNewInvoiceScreen from "./screens/Cashier/ReceiveNewInvoiceScreen/ReceiveNewInvoiceScreen";

import styles from "./config/styles";
import colors from "./config/colors";
import CustomerInfo from "./screens/Seller/IssuingNewInvoice/CustomerInfo";
import ProductProperties from "./screens/Seller/IssuingNewInvoice/ProductProperties";
import { IProduct } from "./config/types";
import SupplyRequest from "./screens/Seller/SupplyRequest";

export type RootStackParamList = {
  AppSelection: undefined;
  Home: undefined;
  IssuingNewInvoic: undefined;
  BarCodeScanner: undefined;
  CustomerInfo: undefined;
  ProductProperties: undefined;
  SupplyRequest: undefined;
};
export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Stack = createStackNavigator<RootStackParamList>();

const SellerStackNavigator: React.FC = () => {
  type NavigationProps = StackScreenProps<RootStackParamList>;
  const navigation = useNavigation<NavigationProps["navigation"]>();
  return (
    <Stack.Navigator
      initialRouteName="AppSelection"
      screenOptions={{
        headerShown: false,
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
        name="AppSelection"
        component={AppSelectionScreen}
        options={{ headerShown: false }}
      />

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
      <Stack.Screen
        name="CustomerInfo"
        component={CustomerInfo}
        options={{
          headerTitleAlign: "center",
          headerTitleStyle: styles.headerTitleStyle,
          headerStyle: styles.headerStyle,
          title: "مشخصات خریدار",
        }}
      />
      <Stack.Screen name="SupplyRequest" component={SupplyRequest} />
    </Stack.Navigator>
  );
};

export default SellerStackNavigator;
