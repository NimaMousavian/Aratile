import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import AppText from "../components/Text";
import AppButton from "../components/Button";
import AppTextInput from "../components/TextInput";
import { ISupplyRequest } from "../config/types";
import colors from "../config/colors";
import ProductCard from "../components/ProductCard";
import { FlatList } from "react-native-gesture-handler";
import ScreenHeader from "../components/ScreenHeader";
import { productData } from "./ReceiveNewInvoiceScreen/ReceiveNewInvoiceScreen";
import SearchInput from "../components/SearchInput";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ProductSearchDrawer from "./IssuingNewInvoice/ProductSearchDrawer";
import useProductScanner from "../Hooks/useProductScanner";
import { Product } from "./IssuingNewInvoice/IssuingNewInvoice";
import SupplyRequestForm from "./SupplyRequestForm";
import Accordion from "../components/Accordion";
import {
  DatePickerField,
  PersianDatePicker,
} from "../components/PersianDatePicker";
import { getFontFamily } from "./IssuedInvoices";
import SupplyRequestCard from "../components/SupplyRequestCard";
import axios from "axios";
import appConfig from "../../config";
import SelectionBottomSheet from "../components/SelectionDialog";
import Toast from "../components/Toast";

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
  const [showModal, setShowModal] = useState<boolean>(false);
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
    handleProductSearch,
    removeProduct,
    addProduct,
  } = useProductScanner();

  const handleProductSelected = (product: Product) => {
    setSelectedProduct(product);
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
      console.log("filterParams:", filterParams);

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

      console.log("Query String:", queryString);

      const response = await axios.get(
        `${appConfig.mobileApi}ProductSupplyRequest/GetAll?${queryString}`
      );

      const data = response.data.Items;
      setSupplyRequests(data);
      console.log("datas", data);
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
    setShowSupplyRequestForm(true);
  };

  const handleSearch = () => {
    getSupplyRequestWithFilter();
  };
  const handleRefresh = () => {
    setRefreshing(true);
    getSupplyRequest();
  };

  return (
    <>
      <ScreenHeader title="درخواست تامین محصول" />
      <View style={styles.container}>
        {/* <AppTextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          placeholder="نام کالا را وارد کنید"
          onChangeText={() => {}}
          style={{ width: "100%" }}
        ></AppTextInput>
        <AppButton title="جستجو" onPress={() => {}} color="success" /> */}
        {/* <SearchInput
          placeholder="جستجوی درخواست های تامین"
          value={""}
          onChangeText={() => {}}
          onSearch={() => {}}
        /> */}
        <Toast
          visible={toastVisible}
          message={toastMessage}
          type={toastType}
          onDismiss={() => setToastVisible(false)}
        />

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
              {/* <AppTextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
                placeholder="نام محصول"
                icon="shop"
                onChangeText={(text) => {
                  setFilterParams((prev: any) => {
                    return {
                      ...prev,
                      filterProductName: text,
                    };
                  });
                }}
              ></AppTextInput> */}
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
                // style={{ width: "49%" }}
              />
            </>
          }
        />

        {/* <Accordion>
          <AppTextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
            placeholder="نام محصول"
            icon="shop"
            onChangeText={(text) => {
              setFilterParams((prev: any) => {
                return {
                  ...prev,
                  filterProductName: text,
                };
              });
            }}
          ></AppTextInput>
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
            // style={{ width: "49%" }}
          />
        </Accordion> */}

        {/* <View style={styles.tabContainer}>
                    <TouchableOpacity
                      style={[
                        styles.tab,
                        activeTab === "editing" && styles.editingActiveTab,
                      ]}
                      onPress={() => setActiveTab("editing")}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          activeTab === "editing" && styles.activeTabText,
                        ]}
                      >
                        درحال ویرایش
                      </Text>
                      <Text
                        style={[
                          styles.countText,
                          activeTab === "editing" && styles.activeCountText,
                          { color: "#EF5350" },
                        ]}
                      >
                        {convertToPersianNumbers(getCountByStatus("درحال ویرایش"))}
                      </Text>
                    </TouchableOpacity>
          
                    <TouchableOpacity
                      style={[
                        styles.tab,
                        activeTab === "referred" && styles.referredActiveTab,
                      ]}
                      onPress={() => setActiveTab("referred")}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          activeTab === "referred" && styles.activeTabText,
                        ]}
                      >
                        ارجاع از صندوق
                      </Text>
                      <Text
                        style={[
                          styles.countText,
                          activeTab === "referred" && styles.activeCountText,
                          { color: "#FFA500" },
                        ]}
                      >
                        {convertToPersianNumbers(getCountByStatus("ارجاع شده از صندوق"))}
                      </Text>
                    </TouchableOpacity>
          
                    <TouchableOpacity
                      style={[
                        styles.tab,
                        activeTab === "issued" && styles.issuedActiveTab,
                      ]}
                      onPress={() => setActiveTab("issued")}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          activeTab === "issued" && styles.activeTabText,
                        ]}
                      >
                        صادر شده
                      </Text>
                      <Text
                        style={[
                          styles.countText,
                          activeTab === "issued" && styles.activeCountText,
                          { color: "#4CAF50" },
                        ]}
                      >
                        {convertToPersianNumbers(getCountByStatus("صادر شده"))}
                      </Text>
                    </TouchableOpacity>
          
                    <TouchableOpacity
                      style={[styles.tab, activeTab === "quote" && styles.quoteActiveTab]}
                      onPress={() => setActiveTab("quote")}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          activeTab === "quote" && styles.activeTabText,
                        ]}
                      >
                        پیش فاکتور
                      </Text>
                      <Text
                        style={[
                          styles.countText,
                          activeTab === "quote" && styles.activeCountText,
                          { color: "#3498db" },
                        ]}
                      >
                        {convertToPersianNumbers(getCountByStatus("پیش فاکتور"))}
                      </Text>
                    </TouchableOpacity>
          
                    <TouchableOpacity
                      style={[styles.tab, activeTab === "all" && styles.allActiveTab]}
                      onPress={() => setActiveTab("all")}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          activeTab === "all" && styles.activeTabText,
                        ]}
                      >
                        همه
                      </Text>
                      <Text
                        style={[
                          styles.countText,
                          activeTab === "all" && styles.activeCountText,
                          { color: "#6B7280" },
                        ]}
                      >
                        {convertToPersianNumbers(getCountByStatus(null))}
                      </Text>
                    </TouchableOpacity>
                  </View> */}
        {screenLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText
              style={{ marginTop: 15, fontSize: 20, color: colors.primary }}
            >
              در حال بارگزاری اطلاعات
            </AppText>
          </View>
        ) : (
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
          />
        )}

        <View style={styles.iconButtonsContainer}>
          <TouchableOpacity
            style={{ marginHorizontal: 20 }}
            onPress={() => setShowProductSearchDrawer(true)}
          >
            <View style={styles.buttonContainer}>
              <MaterialIcons name="add" size={35} color={colors.white} />
            </View>
          </TouchableOpacity>
        </View>

        <ProductSearchDrawer
          visible={showProductSearchDrawer}
          onClose={() => setShowProductSearchDrawer(false)}
          onProductSelect={handleProductSelected}
          searchProduct={handleProductSearch}
          onError={showToast}
        />

        <SupplyRequestForm
          visible={showSupplyRequestForm}
          closeDrawer={() => setShowSupplyRequestForm(false)}
          product={selectedProduct}
          getAllSupplyRequest={() => getSupplyRequest()}
          supplyRequestId={supplyRequestId}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.background },
  androidContentAdjustment: {
    marginTop: 0,
  },
  androidCardAdjustment: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    marginVertical: 8,
  },
  productTitle: {
    textAlign: "center",
    fontFamily: "Yekan_Bakh_Bold",
    marginVertical: 15,
  },
  buttonContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    backgroundColor: colors.success,
    borderRadius: 8,
    padding: 5,
  },
  productTitleContainer: {
    borderWidth: 1,
    borderColor: colors.medium,
    borderRadius: 15,
    padding: 5,
    marginVertical: 10,
  },
  iconCircle: {
    width: 55,
    height: 55,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  iconButtonsContainer: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    marginVertical: 10,
    position: "absolute",
    top: -66,
    left: 0,
  },
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 9999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backdropTouchable: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginHorizontal: 15,
    marginTop: 5,
    marginBottom: 5,
    padding: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
    justifyContent: "space-between",
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2,
  },
  referredActiveTab: {
    backgroundColor: "#FFF3E0",
  },
  issuedActiveTab: {
    backgroundColor: "#E8F5E9",
  },
  quoteActiveTab: {
    backgroundColor: "#E3F2FD",
  },
  editingActiveTab: {
    backgroundColor: "#FFEBEE",
  },
  allActiveTab: {
    backgroundColor: "#ECEFF1",
  },
  tabText: {
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
  },
  activeTabText: {
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "700"),
    color: "#1F2937",
  },
  countText: {
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "700"),
    fontSize: 15,
    marginTop: 4,
    textAlign: "center",
  },
  activeCountText: {
    color: "#1F2937",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
});

export default SupplyRequest;
