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
import styles from "./config/styles";
import colors from "./config/colors";
import { IProduct } from "./config/types";
import AppText from "./components/Text";
import LogingScreen from "./screens/LogingScreen";
import ProfileScreen from "./screens/ProfileScreen";
import B2BFieldMarketer from "./screens/B2BFieldMarketer/B2BFieldMarketer";
import B2CFieldMarketer from "./screens/B2CFieldMarketer/B2CFieldMarketer";
import AddNewShop from "./screens/B2BFieldMarketer/AddNewShop";
import VoiceRecordingScreen from "./screens/B2BFieldMarketer/VoiceRecording";
import AddNewProject from "./screens/B2CFieldMarketer/AddNewProject";
import ReceiveNewInvoiceScreen from "./screens/ReceiveNewInvoiceScreen/ReceiveNewInvoiceScreen";
import StatusFilterScreen from "./screens/ReceiveNewInvoiceScreen/StatusFilterScreen";
import HomeScreen from "./screens/HomeScreen";
import IssuingNewInvoice from "./screens/IssuingNewInvoice/IssuingNewInvoice";
import BarcodeScanner from "./screens/IssuingNewInvoice/BarcodeScanner";
import CustomerInfo from "./screens/IssuingNewInvoice/CustomerInfo";
import SupplyRequest from "./screens/SupplyRequest";
import SupplyRequestList from "./screens/SupplyRequestList";
import IssuedInvoices from "./screens/IssuedInvoices";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";
import AddNewColleague from "./screens/IssuingNewInvoice/AddNewColleague";

export type RootStackParamList = {
  AppSelection: undefined;
  Login: undefined;
  Profile: undefined;
  ChangePassword: undefined;

  Home: undefined;

  IssuingNewInvoice: { scannedCode?: string };
  BarCodeScanner: undefined;
  CustomerInfo: undefined;
  AddNewColleague: undefined;
  ProductProperties: undefined;
  SupplyRequest: undefined;
  SupplyRequestList: undefined;
  IssuedInvoices: undefined;

  CashierHome: undefined;
  ReceiveNewInvoice: undefined;
  CanceledInvoices: undefined;
  ClosedInvoices: undefined;
  SuspendedInvoices: undefined;
  CheckCalculator: undefined;
  StatusFilterScreen: undefined;

  MarketerHome: undefined;
  B2BFieldMarketer: undefined;
  B2CFieldMarketer: undefined;
  AddNewShop: undefined;
  VoiceRecording: undefined;
  AddNewProject: undefined;
};
export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Stack = createStackNavigator<RootStackParamList>();

const StackNavigator: React.FC = () => {
  type NavigationProps = StackScreenProps<RootStackParamList>;
  const navigation = useNavigation<NavigationProps["navigation"]>();
  return (
    <Stack.Navigator
      initialRouteName="Home"
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
      <Stack.Screen name="Login" component={LogingScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />

      {/* Seller Screens */}

      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="IssuingNewInvoice" // This is correct
        component={IssuingNewInvoice}
        options={{ headerShown: false }}
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
      <Stack.Screen
        name="AddNewColleague"
        component={AddNewColleague}
        options={{
          headerTitleAlign: "center",
          headerTitleStyle: styles.headerTitleStyle,
          headerStyle: styles.headerStyle,
          title: "ثبت معرف جدید",
        }}
      />
      <Stack.Screen name="SupplyRequest" component={SupplyRequest} />
      <Stack.Screen name="SupplyRequestList" component={SupplyRequestList} />

      <Stack.Screen
        name="IssuedInvoices"
        component={IssuedInvoices}
        options={{
          headerShown: false,
          // title: "فاکتور های صادر شده",
          // headerTitleAlign: "center",
          // headerTitleStyle: styles.headerTitleStyle,
          // headerStyle: styles.headerStyle,
        }}
      />

      {/* Cashier Screens */}

      {/* <Stack.Screen
        name="CashierHome"
        component={CashierHomeScreen}
        options={{
          headerShown: false,
          // title: "صفحه اصلی صندوقدار",
          // headerTitleAlign: "center",
        }}
      /> */}

      <Stack.Screen
        name="ReceiveNewInvoice"
        component={ReceiveNewInvoiceScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="StatusFilterScreen"
        component={StatusFilterScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />

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
      {/* FieldMarketing Screens */}
      <Stack.Screen name="B2BFieldMarketer" component={B2BFieldMarketer} />
      <Stack.Screen name="B2CFieldMarketer" component={B2CFieldMarketer} />
      <Stack.Screen name="AddNewShop" component={AddNewShop} />
      <Stack.Screen name="VoiceRecording" component={VoiceRecordingScreen} />
      <Stack.Screen name="AddNewProject" component={AddNewProject} />
    </Stack.Navigator>
  );
};

// Temporary placeholder component for screens not yet implemented
const PlaceholderScreen: React.FC = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <AppText style={{ fontSize: 18, textAlign: "center" }}>
        این صفحه در حال توسعه است
      </AppText>
    </View>
  );
};

export default StackNavigator;
