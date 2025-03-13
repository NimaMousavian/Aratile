import React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  CardStyleInterpolators,
  StackNavigationOptions,
  StackScreenProps
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

export type RootStackParamList = {
  AppSelection: undefined;
  Home: undefined;
  IssuingNewInvoic: undefined;
  BarCodeScanner: undefined;
  CashierHome: undefined;
  MarketerHome: undefined;
  ReceiveNewInvoice: undefined;
  FinalizedInvoices: undefined;
  CanceledInvoices: undefined;
  ClosedInvoices: undefined;
  SuspendedInvoices: undefined;
  CheckCalculator: undefined;

};
export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Stack = createStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {
  type NavigationProps = StackScreenProps<RootStackParamList>;
  const navigation = useNavigation<NavigationProps['navigation']>();
  return (
    <Stack.Navigator
      initialRouteName="AppSelection"
      screenOptions={{
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
        name="CashierHome"
        component={CashierHomeScreen}
        options={{
          headerShown: false,
          // title: "صفحه اصلی صندوقدار",
          // headerTitleAlign: "center",
          headerTitleStyle: styles.headerTitleStyle,
          headerStyle: styles.headerStyle,
        }}
      />
      <Stack.Screen
        name="MarketerHome"
        component={MarketerHomeScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* Add the ReceiveNewInvoice screen */}
      <Stack.Screen
        name="ReceiveNewInvoice"
        component={ReceiveNewInvoiceScreen}
        options={{
          headerShown: false, // Using custom header in the component
        }}
      />

      {/* Placeholder for other cashier screens */}
      <Stack.Screen
        name="FinalizedInvoices"
        component={PlaceholderScreen}
        options={{
          headerShown: true,
          title: "فاکتور های نهایی شده",
          headerTitleAlign: "center",
          headerTitleStyle: styles.headerTitleStyle,
          headerStyle: styles.headerStyle,
        }}
      />
      <Stack.Screen
        name="CanceledInvoices"
        component={PlaceholderScreen}
        options={{
          headerShown: true,
          title: "فاکتور های لغو شده",
          headerTitleAlign: "center",
          headerTitleStyle: styles.headerTitleStyle,
          headerStyle: styles.headerStyle,
        }}
      />
      <Stack.Screen
        name="ClosedInvoices"
        component={PlaceholderScreen}
        options={{
          headerShown: true,
          title: "فاکتور های بسته شده",
          headerTitleAlign: "center",
          headerTitleStyle: styles.headerTitleStyle,
          headerStyle: styles.headerStyle,
        }}
      />
      <Stack.Screen
        name="SuspendedInvoices"
        component={PlaceholderScreen}
        options={{
          headerShown: true,
          title: "فاکتور های تعلیق شده",
          headerTitleAlign: "center",
          headerTitleStyle: styles.headerTitleStyle,
          headerStyle: styles.headerStyle,
        }}
      />
      <Stack.Screen
        name="CheckCalculator"
        component={PlaceholderScreen}
        options={{
          headerShown: true,
          title: "راس گیر چک",
          headerTitleAlign: "center",
          headerTitleStyle: styles.headerTitleStyle,
          headerStyle: styles.headerStyle,
        }}
      />
    </Stack.Navigator>
  );
};

// Temporary placeholder component for screens not yet implemented
const PlaceholderScreen: React.FC = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, textAlign: 'center' }}>
        این صفحه در حال توسعه است
      </Text>
    </View>
  );
};

export default StackNavigator;