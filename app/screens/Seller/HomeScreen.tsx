import React, { ReactElement } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import colors from "../../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../StackNavigator";

interface Item {
  id: number;
  name: string;
  screenName?: keyof RootStackParamList;
}

const items: Item[] = [
  {
    id: 1,
    name: "صدور فاکتور جدید",
    screenName: "IssuingNewInvoic",
  },

  {
    id: 2,
    name: "فاکتور های صادر شده",
  },
  {
    id: 3,
    name: "فاکتور های ارجاع شده از صندوق",
  },
  {
    id: 4,
    name: "پیش فاکتور ها",
  },
  {
    id: 5,
    name: "راس گیر چک",
  },
  {
    id: 6,
    name: "ماشین حساب",
  },
  {
    id: 7,
    name: "درخواست تامین",
  },
  {
    id: 8,
    name: "مشاهده درخواست های تامین",
  },
];

const openCalculator = async () => {
  // Example URL scheme (hypothetical, as calculator apps vary by OS and device)
  const calculatorUrl =
    "intent://com.android.calculator2#Intent;scheme=android-app;end";

  try {
    const supported = await Linking.sendIntent(calculatorUrl);
    console.log(supported);

    // if (supported) {
    //   await Linking.openURL(calculatorUrl);
    // } else {
    //   console.log("Calculator app cannot be opened or scheme not supported");
    // }
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

const screenWidth = Dimensions.get("window").width;
const numColumns = 2;
const itemMargin = 10; // Total horizontal margin per item (5 left + 5 right)
const itemWidth = (screenWidth - (numColumns + 1) * itemMargin) / numColumns;

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

const HomeScreen = (): ReactElement => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const renderItem = ({ item }: { item: Item }): ReactElement => {
    return (
      <TouchableOpacity style={styles.gridItem} onPress={openCalculator}>
        <Text style={styles.gridText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={{
          alignContent: "center",
          justifyContent: "center",
          flexDirection: "row",
          paddingTop: 10,
        }}
      >
        <Image
          style={{
            width: 100,
            height: 36,
            alignContent: "center",
            justifyContent: "center",
            flexDirection: "row",
          }}
          source={require("../../../assets/aratile_logo_2.png")}
        />
      </View>
      <View style={styles.headerBox}>
        <View style={styles.infoBox}>
          <MaterialIcons name="person" size={30} color={colors.gray} />
          <Text style={{ marginTop: 7, fontSize: 18 }}>خانم پوردایی</Text>
        </View>
        <MaterialIcons name="edit" size={24} color={colors.gray} />
      </View>
      <FlatList
        data={items}
        numColumns={2}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50 },
  list: {
    padding: itemMargin,
  },
  gridItem: {
    margin: 5,
    padding: 20,
    width: itemWidth,
    height: 150,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.gray,
    borderRadius: 15,
  },
  gridText: {
    textAlign: "center",
    fontSize: 20,
  },
  headerBox: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  infoBox: {
    flexDirection: "row-reverse",
    alignContent: "center",
    gap: 10,
  },
  columnWrapper: {
    flexDirection: "row-reverse",
    justifyContent: "center",
  },
});

export default HomeScreen;
