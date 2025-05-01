import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import AppText from "../components/Text";
import AppButton from "../components/Button";
import { ISupplyRequest } from "../config/types";
import colors from "../config/colors";
import { FlatList } from "react-native-gesture-handler";
import ScreenHeader from "../components/ScreenHeader";
import SearchInput from "../components/SearchInput";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ProductSearchDrawer from "./IssuingNewInvoice/ProductSearchDrawer";
import useProductScanner from "../Hooks/useProductScanner";
import { Product } from "./IssuingNewInvoice/IssuingNewInvoice";
import SupplyRequestForm from "./SupplyRequestForm";
import { DatePickerField } from "../components/PersianDatePicker";
import SupplyRequestCard from "../components/SupplyRequestCard";
import axios from "axios";
import appConfig from "../../config";
import SelectionBottomSheet from "../components/SelectionDialog";
import Toast from "../components/Toast";
import { getFontFamily } from "./IssuedInvoices";
import { Feather } from "@expo/vector-icons";

const statusStr = [
  "بررسی نشده",
  "در حال تامین",
  "درخواست تولید",
  "تامین شده",
  "عدم تولید",
  "لغو شده",
];

const SupplyRequest = () => {
  const [supplyRequests, setSupplyRequests] = useState<ISupplyRequest[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showProductSearchDrawer, setShowProductSearchDrawer] =
    useState<boolean>(false);
  const [showSupplyRequestForm, setShowSupplyRequestForm] =
    useState<boolean>(false);

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "warning" | "info"
  >("error");

  const [screenLoading, setScreenLoading] = useState<boolean>(false);
  const [filterParams, setFilterParams] = useState<any>();
  const [supplyRequestId, setSupplyRequestId] = useState<number | undefined>(
    undefined
  );

  const [formMode, setFormMode] = useState<"add" | "edit">("add");

  const [searchText, setSearchText] = useState<string>("");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "error"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const {
    isLoading,
    selectedProducts,
    searchProduct,
    removeProduct,
    addProduct,
  } = useProductScanner();

  const handleProductSelected = (product: Product) => {
    setSelectedProduct(product);
    setFormMode("add");
    setShowSupplyRequestForm(true);
  };

  const getSupplyRequest = async () => {
    setScreenLoading(true);
    try {
      const response = await axios.get(
        `${appConfig.mobileApi}ProductSupplyRequest/GetAll?page=1&pageSize=1000`
      );

      const data = response.data.Items;
      setSupplyRequests(data);
    } catch (error) {
      console.log(error);
    } finally {
      setScreenLoading(false);
    }
  };

  const getSupplyRequestWithFilter = async () => {
    setScreenLoading(true);
    try {
      // Initialize query string with required parameters
      let queryString = "page=1&pageSize=1000";

      // Add filterParams if they exist
      if (filterParams) {
        if (filterParams.filterProductName) {
          queryString += `&filterProductName=${encodeURIComponent(
            filterParams.filterProductName
          )}`;
        }
        if (filterParams.filterRequestState) {
          if (filterParams.filterRequestState !== 0)
            queryString += `&filterRequestState=${filterParams.filterRequestState}`;
        }
        if (filterParams.filterInsertDateFrom) {
          queryString += `&filterInsertDateFrom=${encodeURIComponent(
            filterParams.filterInsertDateFrom
          )}`;
        }
        if (filterParams.filterInsertDateTo) {
          queryString += `&filterInsertDateTo=${encodeURIComponent(
            filterParams.filterInsertDateTo
          )}`;
        }
      }

      const response = await axios.get(
        `${appConfig.mobileApi}ProductSupplyRequest/GetAll?${queryString}`
      );

      const data = response.data.Items;
      setSupplyRequests(data);
    } catch (error) {
      console.log(error);
    } finally {
      setScreenLoading(false);
    }
  };

  useEffect(() => {
    getSupplyRequest();
  }, []);

  const handleSupplyRequestPress = (srID: number) => {
    setSupplyRequestId(srID);
    setFormMode("edit");
    setShowSupplyRequestForm(true);
  };

  const handleSearch = () => {
    getSupplyRequestWithFilter();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await getSupplyRequest();
    setRefreshing(false);
  };

  const renderFooter = () => {
    if (!screenLoading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  };

  return (
    <>
      <ScreenHeader
        title="درخواست تامین محصول"
        rightComponent={
          <TouchableOpacity
            style={styles.addIconContainer}
            onPress={() => {
              setFormMode("add");
              setShowProductSearchDrawer(true);
            }}
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        }
      />
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />
      <View style={styles.container}>
        <SearchInput
          placeholder="نام محصول را جستجو کنید..."
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            setFilterParams((prev: any) => {
              return {
                ...prev,
                filterProductName: text,
              };
            });
          }}
          onSearch={handleSearch}
          hasFilter
          filterItems={
            <>
              <View style={{ flexDirection: "row-reverse", gap: 10 }}>
                <DatePickerField
                  date={fromDate}
                  label="از تاریخ"
                  onDateChange={(value) => {
                    setFromDate(value);
                    setFilterParams((prev: any) => {
                      return {
                        ...prev,
                        filterInsertDateFrom: value,
                      };
                    });
                  }}
                  customStyles={{ infoItem: { width: "50%" } }}
                />
                <DatePickerField
                  date={toDate}
                  label="تا تاریخ"
                  onDateChange={(value) => {
                    setToDate(value);
                    setFilterParams((prev: any) => {
                      return {
                        ...prev,
                        filterInsertDateTo: value,
                      };
                    });
                  }}
                />
              </View>
              <SelectionBottomSheet
                onSelect={(values) =>
                  setFilterParams((prev: any) => {
                    return {
                      ...prev,
                      filterRequestState: statusStr.indexOf(values[0]) + 1,
                    };
                  })
                }
                options={["همه", ...statusStr]}
                placeholderText="وضعیت"
                iconName="question-mark"
              />
              <AppButton
                title="فیلتر"
                onPress={() => getSupplyRequestWithFilter()}
                color="primary"
              />
            </>
          }
        />

        {screenLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText
              style={{ marginTop: 15, fontSize: 20, color: colors.primary }}
            >
              در حال بارگذاری اطلاعات
            </AppText>
          </View>
        ) : supplyRequests.length > 0 ? (
          <FlatList
            data={supplyRequests}
            keyExtractor={(item) => item.ProductSupplyRequestId.toString()}
            renderItem={({ item }) => (
              <SupplyRequestCard
                supplyRequest={item}
                onPress={handleSupplyRequestPress}
                onNotAllowedEdit={() =>
                  showToast("این درخواست تامین قابل ویرایش نیست", "warning")
                }
              />
            )}
            onRefresh={handleRefresh}
            refreshing={refreshing}
            showsVerticalScrollIndicator={true}
            ListHeaderComponent={
              refreshing ? (
                <View style={styles.refreshIndicator}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              ) : null
            }
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="clipboard" size={64} color="#9CA3AF" />
            <AppText style={styles.emptyText}>موردی یافت نشد</AppText>
          </View>
        )}

        <ProductSearchDrawer
          visible={showProductSearchDrawer}
          onClose={() => setShowProductSearchDrawer(false)}
          onProductSelect={handleProductSelected}
          searchProduct={searchProduct}
          onError={showToast}
        />

        <SupplyRequestForm
          visible={showSupplyRequestForm}
          closeDrawer={() => setShowSupplyRequestForm(false)}
          product={selectedProduct}
          getAllSupplyRequest={() => getSupplyRequest()}
          supplyRequestId={supplyRequestId}
          mode={formMode}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  addIconContainer: {
    backgroundColor: colors.success,
    width: 40,
    height: 40,
    marginLeft: 8,
    marginTop: -4,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
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
  refreshIndicator: {
    paddingVertical: 10,
    alignItems: "center",
  },
  footer: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SupplyRequest;
