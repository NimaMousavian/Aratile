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
import { AppNavigationProp, RootStackParamList } from "../../../StackNavigator";
import { IProduct } from "../../../config/types";
import ProductItem from "../../../components/ProductItem";
import AppButton from "../../../components/Button";
import ProductPreview from "../../../components/ProductPreview";
import ProductCard from "../../../components/ProductCard";
import { productData } from "../../Cashier/ReceiveNewInvoiceScreen/ReceiveNewInvoiceScreen";
import ProductProperties from "./ProductProperties";
import IconButton from "../../../components/IconButton";

// const sampleProducts: IProduct[] = [
//   {
//     id: 1,
//     name: "محصول اول",
//     accountableInventory: "1574",
//     physicalInventory: "1484",
//     grade: "یک",
//     price: 3659000,
//   },
//   {
//     id: 2,
//     name: "محصول دوم",
//     accountableInventory: "1574",
//     physicalInventory: "1484",
//     grade: "یک",
//     price: 3659000,
//   },
//   {
//     id: 3,
//     name: "محصول سوم",
//     accountableInventory: "1574",
//     physicalInventory: "1484",
//     grade: "یک",
//     price: 3659000,
//   },
//   {
//     id: 4,
//     name: "محصول چهارم",
//     accountableInventory: "1574",
//     physicalInventory: "1484",
//     grade: "یک",
//     price: 3659000,
//   },
// ];

const IssuingNewInvoice = () => {
  const [showProductCodeModal, setShowProductCodeModal] =
    useState<boolean>(false);
  const [showProductNameModal, setShowProductNameModal] =
    useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<IProduct[]>([]);
  const [productPropertiesShow, setProductPropertiesShow] =
    useState<boolean>(false);
  const [productToShow, setProductToShow] = useState<IProduct | null>(null);
  // {
  //   id: 1,
  //   name: "محصول اول",
  //   accountableInventory: "1574",
  //   physicalInventory: "1484",
  //   grade: "یک",
  //   price: 3659000,
  // },
  // {
  //   id: 2,
  //   name: "محصول دوم",
  //   accountableInventory: "1574",
  //   physicalInventory: "1484",
  //   grade: "یک",
  //   price: 3659000,
  // },
  // {
  //   id: 3,
  //   name: "محصول سوم",
  //   accountableInventory: "1574",
  //   physicalInventory: "1484",
  //   grade: "یک",
  //   price: 3659000,
  // },
  // {
  //   id: 4,
  //   name: "محصول سوم",
  //   accountableInventory: "1574",
  //   physicalInventory: "1484",
  //   grade: "یک",
  //   price: 3659000,
  // },

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
          alignItems: "center",
        }}
      >
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          placeholder="جستجوی خریدار"
          onChangeText={() => {}}
          width={"75%"}
          containerStyle={{ marginBottom: 0 }}
        ></TextInput>
        <Button
          title="جستجو"
          onPress={() => navigation.navigate("CustomerInfo")}
        />
      </View>

      <FlatList
        data={selectedProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductPreview title={item.title} orderCount={item.quantity} />
        )}
      />
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="default"
        placeholder="توضیحات فاکتور"
        onChangeText={() => {}}
        numberOfLines={4}
        multiline={true}
        height={150}
      ></TextInput>
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
          <IconButton
            text="ثبت"
            iconName="done"
            onPress={() => {}}
            backgroundColor={colors.success}
            flex={1}
          />
          {/* <Button
            title="ثبت"
            onPress={() => {}}
            style={{ width: "100%" }}
            color="success"
          /> */}
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
          <View
            style={{
              flexDirection: "row-reverse",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
              placeholder="کد کالا را وارد کنید"
              onChangeText={() => {}}
              width={"75%"}
              containerStyle={{ marginBottom: 0 }}
            ></TextInput>
            <AppButton title="جستجو" onPress={() => {}} color="primaryLight" />
          </View>
          {/* <FlatList
            data={sampleProducts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <ProductItem product={item} />}
          /> */}
          <FlatList
            data={productData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item: product }) => (
              <ProductCard
                key={product.id}
                title={product.title}
                // titleIcon={{
                //   name: "inventory",
                //   color: colors.primary,
                // }}
                fields={[
                  {
                    icon: "qr-code",
                    iconColor: colors.secondary,
                    label: "کد محصول:",
                    value: product.code,
                  },
                  {
                    icon: "straighten",
                    iconColor: colors.secondary,
                    label: "مقدار:",
                    value: product.quantity,
                  },
                  {
                    icon: "palette",
                    iconColor: colors.secondary,
                    label: "طیف رنگی:",
                    value: product.hasColorSpectrum ? "دارد" : "ندارد",
                    valueColor: product.hasColorSpectrum
                      ? colors.success
                      : colors.danger,
                  },
                ]}
                note={product.note}
                noteConfig={{
                  show: !!product.note && product.note !== "-",
                  icon: "notes",
                  iconColor: colors.secondary,
                  label: "توضیحات:",
                }}
                qrConfig={{
                  show: true,
                  icon: "qr-code-2",
                  iconSize: 36,
                  iconColor: colors.secondary,
                }}
              />
            )}
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
          <View
            style={{
              flexDirection: "row-reverse",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
              placeholder="نام کالا را وارد کنید"
              onChangeText={() => {}}
              containerStyle={{ marginBottom: 0 }}
              width={"75%"}
            ></TextInput>
            <AppButton title="جستجو" onPress={() => {}} color="primaryLight" />
          </View>
          {/* <FlatList
            data={sampleProducts}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => <ProductItem product={item} />}
          /> */}
          <FlatList
            data={productData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item: product }) => (
              <ProductCard
                key={product.id}
                title={product.title}
                onPress={() => {
                  setProductToShow(product);
                  setProductPropertiesShow(true);
                }}
                // titleIcon={{
                //   name: "inventory",
                //   color: colors.primary,
                // }}
                fields={[
                  {
                    icon: "qr-code",
                    iconColor: colors.secondary,
                    label: "کد محصول:",
                    value: product.code,
                  },
                  {
                    icon: "straighten",
                    iconColor: colors.secondary,
                    label: "مقدار:",
                    value: product.quantity,
                  },
                  {
                    icon: "palette",
                    iconColor: colors.secondary,
                    label: "طیف رنگی:",
                    value: product.hasColorSpectrum ? "دارد" : "ندارد",
                    valueColor: product.hasColorSpectrum
                      ? colors.success
                      : colors.danger,
                  },
                ]}
                note={product.note}
                noteConfig={{
                  show: !!product.note && product.note !== "-",
                  icon: "notes",
                  iconColor: colors.secondary,
                  label: "توضیحات:",
                }}
                qrConfig={{
                  show: true,
                  icon: "qr-code-2",
                  iconSize: 36,
                  iconColor: colors.secondary,
                }}
              />
            )}
          />
          <Modal visible={productPropertiesShow} animationType="slide">
            {productToShow && (
              <ProductProperties
                product={productToShow}
                onClose={() => setProductPropertiesShow(false)}
              />
            )}
          </Modal>
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
