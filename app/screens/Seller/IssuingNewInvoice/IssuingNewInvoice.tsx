import React, { useState } from "react";
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import colors from "../../../config/colors";
import Button from "../../../components/Button";
import TextInput from "../../../components/TextInput";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  AppNavigationProp,
  RootStackParamList,
} from "../../../SellerStackNavigator";
import { IProduct } from "../../../config/types";
import ProductItem from "../../../components/ProductItem";
import AppButton from "../../../components/Button";
import ProductPreview from "../../../components/ProductPreview";

const sampleProducts: IProduct[] = [
  {
    id: 1,
    name: "محصول اول",
    accountableInventory: "1574",
    physicalInventory: "1484",
    grade: "یک",
    price: 3659000,
  },
  {
    id: 2,
    name: "محصول دوم",
    accountableInventory: "1574",
    physicalInventory: "1484",
    grade: "یک",
    price: 3659000,
  },
  {
    id: 3,
    name: "محصول سوم",
    accountableInventory: "1574",
    physicalInventory: "1484",
    grade: "یک",
    price: 3659000,
  },
  {
    id: 4,
    name: "محصول چهارم",
    accountableInventory: "1574",
    physicalInventory: "1484",
    grade: "یک",
    price: 3659000,
  },
];

const IssuingNewInvoice = () => {
  const [showProductCodeModal, setShowProductCodeModal] =
    useState<boolean>(false);
  const [showProductNameModal, setShowProductNameModal] =
    useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<IProduct[]>([
    {
      id: 1,
      name: "محصول اول",
      accountableInventory: "1574",
      physicalInventory: "1484",
      grade: "یک",
      price: 3659000,
    },
    {
      id: 2,
      name: "محصول دوم",
      accountableInventory: "1574",
      physicalInventory: "1484",
      grade: "یک",
      price: 3659000,
    },
    {
      id: 3,
      name: "محصول سوم",
      accountableInventory: "1574",
      physicalInventory: "1484",
      grade: "یک",
      price: 3659000,
    },
    {
      id: 4,
      name: "محصول سوم",
      accountableInventory: "1574",
      physicalInventory: "1484",
      grade: "یک",
      price: 3659000,
    },
  ]);
  const navigation = useNavigation<AppNavigationProp>();
  return (
    <View style={{ flex: 1, padding: 10, paddingTop: 50 }}>
      {/* <TouchableOpacity
        style={styles.addNewCustomerBox}
        onPress={() => setShowCustomerModal(true)}
      >
        <MaterialIcons name="add-circle" size={35} color={colors.primary} />
        <Text style={{ fontSize: 18 }}>افزودن خریدار جدید</Text>
      </TouchableOpacity> */}
      <View
        style={{
          flexDirection: "row-reverse",
          justifyContent: "space-between",
        }}
      >
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          placeholder="جستجوی خریدار"
          onChangeText={() => {}}
          width={"75%"}
        ></TextInput>
        <Button
          title="جستجو"
          onPress={() => navigation.navigate("CustomerInfo")}
        />
      </View>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="default"
        placeholder="توضیحات فاکتور"
        onChangeText={() => {}}
        numberOfLines={4}
        multiline={true}
        style={{ width: "100%", height: 100 }}
      ></TextInput>
      <FlatList
        data={selectedProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductPreview
            title={item.name}
            orderCount={item.accountableInventory}
          />
        )}
      />
      <View>
        <View style={styles.buttonsBox}>
          <Button
            title="دوربین"
            onPress={() => navigation.navigate("BarCodeScanner")}
            style={{ width: "30%" }}
          />
          <Button
            title="کد کالا"
            onPress={() => setShowProductCodeModal(true)}
            style={{ width: "30%" }}
          />
          <Button
            title=" نام کالا"
            onPress={() => setShowProductNameModal(true)}
            style={{ width: "30%" }}
          />
        </View>
        <View style={styles.buttonsBox}>
          <Button
            title="ثبت"
            onPress={() => {}}
            style={{ width: "100%" }}
            color="success"
          />
          {/* <Button
            title="انصراف"
            onPress={() => {}}
            style={{ width: "30%" }}
            color="info"
          />
          <Button
            title="خروج"
            onPress={() => navigation.goBack()}
            style={{ width: "30%" }}
            color="danger"
          /> */}
        </View>
      </View>

      <Modal visible={showProductCodeModal} animationType="slide">
        <View style={{ padding: 20 }}>
          <Button
            title="بستن"
            onPress={() => setShowProductCodeModal(false)}
            color="danger"
          />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
            placeholder="کد کالا را وارد کنید"
            onChangeText={() => {}}
            style={{ width: "100%" }}
          ></TextInput>
          <AppButton title="جستجو" onPress={() => {}} color="success" />
          <FlatList
            data={sampleProducts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <ProductItem product={item} />}
          />
        </View>
      </Modal>
      <Modal visible={showProductNameModal} animationType="slide">
        <View style={{ padding: 20, flex: 1 }}>
          <Button
            title="بستن"
            onPress={() => setShowProductNameModal(false)}
            color="danger"
          />
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
            placeholder="نام کالا را وارد کنید"
            onChangeText={() => {}}
            style={{ width: "100%" }}
          ></TextInput>
          <AppButton title="جستجو" onPress={() => {}} color="success" />
          <FlatList
            data={sampleProducts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <ProductItem product={item} />}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  addNewCustomerBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 15,
    padding: 10,
    marginHorizontal: 80,
    marginVertical: 20,
  },
  buttonsBox: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
});

export default IssuingNewInvoice;
