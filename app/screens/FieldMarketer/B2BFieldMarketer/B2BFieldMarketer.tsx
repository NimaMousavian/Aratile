import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../../../StackNavigator";
import colors from "../../../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ScreenHeader from "../../../components/ScreenHeader";
import SearchInput from "../../../components/SearchInput";
import { IShopItem } from "../../../config/types";
import axios from "axios";
import appConfig from "../../../../config";
import Toast from "../../../components/Toast";
import AppText from "../../../components/Text";
import ProductCard from "../../../components/ProductCard";
import { toPersianDigits } from "../../../utils/converters";
import { getFontFamily } from "../../IssuedInvoices";
import { Feather } from "@expo/vector-icons";

export const handlePhoneCall = (phoneNumber: string): void => {
  if (phoneNumber) {
    Linking.openURL(`tel:${phoneNumber}`);
  }
};

const B2BFieldMarketer = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const [shopItems, setShopItems] = useState<IShopItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filterShopName, setFilterShopName] = useState<string>("");

  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "warning" | "info"
  >("error");

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "error"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const getShopItems = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<{ Items: IShopItem[] }>(
        `${appConfig.mobileApi}Shop/GetAll?page=1&pageSize=100`
      );

      setShopItems(response.data.Items);
    } catch (error) {
      showToast("خطا در دریافت اطلاعات فروشگاه ها", "error");
    } finally {
      setIsLoading(false);
    }
  };
  const getShopItemsWithFilter = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<{ Items: IShopItem[] }>(
        `${appConfig.mobileApi}Shop/GetAll?page=1&pageSize=100&filterShopName=${filterShopName}`
      );

      setShopItems(response.data.Items);
    } catch (error) {
      showToast("خطا در دریافت اطلاعات فروشگاه ها", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getShopItems();
  }, []);

  const onScreenFocus = useCallback(() => {
    getShopItems();
  }, []);

  // Use useFocusEffect to run the function when the screen is focused
  useFocusEffect(
    useCallback(() => {
      onScreenFocus();
    }, [onScreenFocus])
  );

  const handleEditShop = (shop: IShopItem) => {
    navigation.navigate("AddNewShop", { shop: shop });
  };

  return (
    <>
      <ScreenHeader
        title="فروشگاه ها"
        rightComponent={
          <View>
            <TouchableOpacity
              style={styles.headerIconContainer}
              onPress={() =>
                navigation.navigate("AddNewShop", { shop: undefined })
              }
            >
              <MaterialIcons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        }
      />
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />
      <View style={styles.container}>
        <View style={styles.searchInput}>
          <SearchInput
            value={filterShopName}
            onChangeText={setFilterShopName}
            onSearch={() => getShopItemsWithFilter()}
            onClear={() => getShopItems()}
          />
        </View>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <AppText
                style={{ marginTop: 15, fontSize: 20, color: colors.primary }}
              >
                در حال بارگذاری اطلاعات
              </AppText>
            </View>
          ) : shopItems.length > 0 ? (
            shopItems?.map((shop) => (
              <ProductCard
                key={shop.ShopId}
                title={toPersianDigits(shop.ShopName)}
                fields={[
                  {
                    icon: "person",
                    iconColor: "#228DE1",
                    label: "مالک:",
                    value: `${shop.OwnerFirstName}  ${shop.OwnerLastName}`,
                  },
                  {
                    icon: "question-mark",
                    iconColor: "#0F9058",
                    label: "نوع مالکیت:",
                    value: shop.ShopOwnershipTypeStr,
                  },
                  {
                    icon: "location-pin",
                    iconColor: "#DB4437",
                    label: "مکان:",
                    value: `${shop.ProvinceName} / ${shop.CityName}`,
                  },
                ]}
                note={shop.Description ? toPersianDigits(shop.Description) : ""}
                noteConfig={{
                  show: false,
                  icon: "notes",
                  iconColor: colors.secondary,
                  label: "توضیحات:",
                }}
                qrConfig={{
                  show: false,
                  icon: "camera", // تغییر آیکون به دوربین/عکس
                  iconSize: 36,
                  iconColor: colors.secondary,
                }}
                titleStyle={{ fontSize: 20 }}
                callIcon={{
                  name: "call",
                  onPress: () => handlePhoneCall(shop.OwnerMobile),
                  containerStyle: {
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    justifyContent: "center",
                    alignItems: "center",
                    // marginRight: -10, // حرکت به چپ
                    marginLeft: -3,
                    borderWidth: 2,
                    borderColor: colors.success, // یا هر رنگی که می‌خواید
                    backgroundColor: "white",
                  },
                }}
                editIcon={{
                  name: "edit",
                  size: 22,
                  color: colors.warning,
                  onPress: () => handleEditShop(shop),
                  containerStyle: styles.iconCircleSmall, // اضافه کردن استایل دایره
                }}
                //   deleteIcon={{
                //     name: "delete",
                //     size: 22,
                //     color: colors.danger,
                //     onPress: () => {
                //       showRemoveConfirmation(product.id, () => {
                //         showToast("محصول با موفقیت حذف شد", "info");
                //       });
                //     },
                //     containerStyle: styles.iconCircleSmall, // اضافه کردن استایل دایره
                //   }}
                containerStyle={
                  Platform.OS === "android" ? styles.androidCardAdjustment : {}
                }
                //   onLongPress={() => {
                //     showRemoveConfirmation(product.id, () => {
                //       showToast("محصول با موفقیت حذف شد", "info");
                //     });
                //   }}
                onPress={() => {
                  navigation.navigate("AddNewShop", { shop: shop });
                }}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Feather name="clipboard" size={64} color="#9CA3AF" />
              <AppText style={styles.emptyText}>موردی یافت نشد</AppText>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 0,
    paddingTop: 5,
    backgroundColor: colors.background,
    display: "flex",
    flexDirection: "column",
  },
  headerIconContainer: {
    backgroundColor: colors.success,
    width: 40,
    height: 40,
    marginLeft: 6,
    marginTop: -4,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },

  androidCardAdjustment: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginVertical: 4,
  },
  searchInput: {
    marginBottom: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
    textAlign: "center",
  },
  iconCircleSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 2,
    marginRight: -20,
    borderWidth: 2,
    borderColor: colors.warning,
    backgroundColor: "white",
  },
});

export default B2BFieldMarketer;
