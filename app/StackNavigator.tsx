import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import {
  createStackNavigator,
  CardStyleInterpolators,
  StackScreenProps,
} from "@react-navigation/stack";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import AppSelectionScreen from "./screens/AppSelectionScreen";
import styles from "./config/styles";
import colors from "./config/colors";
import { IProduct } from "./config/types";
import AppText from "./components/Text";
import LogingScreen from "./screens/LogingScreen";
import ProfileScreen from "./screens/ProfileScreen";
import B2BFieldMarketer from "./screens/FieldMarketer/B2BFieldMarketer/B2BFieldMarketer";
import B2CFieldMarketer from "./screens/FieldMarketer/B2CFieldMarketer/B2CFieldMarketer";
import FieldMarketer from "./screens/FieldMarketer/FieldMarketer";
import AddNewShop from "./screens/FieldMarketer/B2BFieldMarketer/AddNewShop";
import VoiceRecordingScreen from "./screens/FieldMarketer/B2BFieldMarketer/VoiceRecording";
import AddNewProject from "./screens/FieldMarketer/B2CFieldMarketer/AddNewProject";
import ReceiveNewInvoiceScreen from "./screens/ReceiveNewInvoiceScreen/ReceiveNewInvoiceScreen";
import StatusFilterScreen from "./screens/ReceiveNewInvoiceScreen/StatusFilterScreen";
import HomeScreen from "./screens/HomeScreen";
import IssuingNewInvoice, {
  Product,
} from "./screens/IssuingNewInvoice/IssuingNewInvoice";
import BarcodeScanner from "./screens/IssuingNewInvoice/BarcodeScanner";
import CustomerInfo from "./screens/IssuingNewInvoice/CustomerInfo";
import SupplyRequest from "./screens/SupplyRequest";
import SupplyRequestList from "./screens/SupplyRequestList";
import IssuedInvoices from "./screens/IssuedInvoices";
import ChangePasswordScreen from "./screens/ChangePasswordScreen";
import AddNewColleague from "./screens/IssuingNewInvoice/AddNewColleague";
import { Colleague } from "./screens/IssuingNewInvoice/ColleagueSearchModal";
import { useAuth } from "./screens/AuthContext";
import ShowRoom from "./screens/ShowRoom";

export type RootStackParamList = {
  AppSelection: undefined;
  Login: undefined;
  Profile: undefined;
  ChangePassword: undefined;

  Home: undefined;

  IssuingNewInvoice: {
    scannedCode?: string;
    scannedProduct?: Product;
  };

  BarCodeScanner: {
    onReturn?: (product: Product) => void;
  };

  CustomerInfo: { customer?: Colleague };
  AddNewColleague: undefined;
  ProductProperties: undefined;
  SupplyRequest: undefined;
  SupplyRequestList: undefined;
  IssuedInvoices: undefined;

  CashierHome: undefined;
  ReceiveNewInvoice: { invoicId: number };
  CanceledInvoices: undefined;
  ClosedInvoices: undefined;
  SuspendedInvoices: undefined;
  CheckCalculator: undefined;
  StatusFilterScreen: undefined;

  MarketerHome: undefined;
  FieldMarketer: undefined;
  B2BFieldMarketer: undefined;
  B2CFieldMarketer: undefined;
  AddNewShop: undefined;
  VoiceRecording: undefined;
  AddNewProject: undefined;

  ShowRoom: undefined;
};
export type AppNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Stack = createStackNavigator<RootStackParamList>();

const AuthStack = () => (
  <Stack.Navigator
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
    <Stack.Screen name="Login" component={LogingScreen} />
  </Stack.Navigator>
);

const AppStack = () => {
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
      <Stack.Screen name="Profile" component={ProfileScreen} />

      {/* Seller Screens */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="IssuingNewInvoice"
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
        }}
      />

      {/* Cashier Screens */}
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
      <Stack.Screen name="FieldMarketer" component={FieldMarketer} />
      <Stack.Screen name="B2BFieldMarketer" component={B2BFieldMarketer} />
      <Stack.Screen name="B2CFieldMarketer" component={B2CFieldMarketer} />
      <Stack.Screen name="AddNewShop" component={AddNewShop} />
      <Stack.Screen name="VoiceRecording" component={VoiceRecordingScreen} />
      <Stack.Screen name="AddNewProject" component={AddNewProject} />
      <Stack.Screen name="ShowRoom" component={ShowRoom} />
    </Stack.Navigator>
  );
};

const LoadingScreen = () => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.primary,
    }}
  >
    <ActivityIndicator size="large" color={colors.white} />
  </View>
);

const PlaceholderScreen: React.FC = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <AppText style={{ fontSize: 18, textAlign: "center" }}>
        این صفحه در حال توسعه است
      </AppText>
    </View>
  );
};

const StackNavigator: React.FC = () => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return isLoggedIn() ? <AppStack /> : <AuthStack />;
};

export default StackNavigator;
