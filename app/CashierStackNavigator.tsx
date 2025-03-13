import {
  CardStyleInterpolators,
  createStackNavigator,
} from "@react-navigation/stack";
import CashierHomeScreen from "./screens/Cashier/CashierHomeScreen";
import styles from "./config/styles";
import { MarketerHomeScreen } from "./screens/MarketerHome/MarketerHomeScreen";
import ReceiveNewInvoiceScreen from "./screens/Cashier/ReceiveNewInvoiceScreen/ReceiveNewInvoiceScreen";
import { View } from "react-native";
import AppText from "./components/Text";

export type RootStackParamList = {
  CashierHome: undefined;
  MarketerHome: undefined;
  ReceiveNewInvoice: undefined;
  FinalizedInvoices: undefined;
  CanceledInvoices: undefined;
  ClosedInvoices: undefined;
  SuspendedInvoices: undefined;
  CheckCalculator: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const CashierStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="CashierHome"
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
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <AppText style={{ fontSize: 18, textAlign: "center" }}>
        این صفحه در حال توسعه است
      </AppText>
    </View>
  );
};

export default CashierStackNavigator;
