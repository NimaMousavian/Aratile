import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import ProductSearchDrawer from "./ProductSearchDrawer";

import ColleagueBottomSheet from "../IssuingNewInvoice/ColleagueSearchModal";
import ProductCard from "../../../components/ProductCard";
import ScreenHeader from "../../../components/ScreenHeader";
import AppTextInput from "../../../components/TextInput";
import Toast from "../../../components/Toast";
import ProductPropertiesDrawer from "./ProductProperties";
import InvoiceTotalCalculator from "./InvoiceTotalCalculator";

import colors from "../../../config/colors";
import { toPersianDigits } from "../../../utils/numberConversions";
import useProductScanner from "../../../Hooks/useProductScanner";

export interface Product {
  id: string;
  title: string;
  code?: string;
  quantity: string;
  price?: number;
  note?: string;
  manualCalculation?: boolean;
  hasColorSpectrum?: boolean;
}

interface Colleague {
  id: string;
  name: string;
}

interface AppNavigationProp {
  navigate: (screen: string, params?: any) => void;
}

const IssuingNewInvoice: React.FC = () => {
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    isLoading,
    selectedProducts,
    handleProductSearch,
    removeProduct,
    addProduct,
  } = useProductScanner();

  const [showProductSearchDrawer, setShowProductSearchDrawer] = useState<boolean>(false);
  const [showProductProperties, setShowProductProperties] = useState<boolean>(false);
  const [productToShow, setProductToShow] = useState<Product | null>(null);
  const [selectedColleague, setSelectedColleague] = useState<Colleague | null>(null);
  const [showColleagueSheet, setShowColleagueSheet] = useState<boolean>(false);
  const [invoiceNote, setInvoiceNote] = useState<string>("");

  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('error');

  const navigation = useNavigation<AppNavigationProp>();

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleProductSelected = (product: Product) => {
    setShowProductSearchDrawer(false);

    setTimeout(() => {
      setProductToShow(product);
      setShowProductProperties(true);
    }, 300);
  };

  const handleAddProduct = (product: Product, quantity: string, note: string, manualCalculation: boolean) => {
    const quantityNum = parseFloat(quantity) || 0;
    const unitPrice = product.price || 0;

    const productWithProps = {
      ...product,
      quantity: quantity,
      note: note,
      manualCalculation: manualCalculation
    };

    if (addProduct(productWithProps)) {
      showToast("محصول با موفقیت اضافه شد", "success");
      return true;
    } else {
      showToast("خطا در افزودن محصول", "error");
      return false;
    }
  };

  const handleCloseProductProperties = () => {
    setShowProductProperties(false);

    setTimeout(() => {
      setProductToShow(null);
    }, 500);
  };

  const submitInvoice = () => {
    if (!selectedColleague) {
      showToast("لطفاً ابتدا مشتری را انتخاب کنید", "warning");
      return;
    }

    if (selectedProducts.length === 0) {
      showToast("لطفاً حداقل یک محصول به فاکتور اضافه کنید", "warning");
      return;
    }

    Alert.alert("موفقیت", "فاکتور با موفقیت ثبت شد.");
  };

  useEffect(() => {
    if (showProductSearchDrawer && showProductProperties) {
      setShowProductProperties(false);
    }
  }, [showProductSearchDrawer]);

  return (
    <>
      <ScreenHeader title="صدور فاکتور جدید" />

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />

      <View style={styles.container}>
        <View style={styles.customerContainer}>
          <LinearGradient
            colors={[colors.secondary, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.customerGradient}
          >
            <View style={styles.customerRow}>
              <View style={styles.customerField}>
                <MaterialIcons name="person" size={24} color="white" style={styles.customerIcon} />
                <Text style={styles.customerLabel}>مشتری</Text>
              </View>
              <View style={styles.customerButtonsContainer}>
                {selectedColleague && (
                  <TouchableOpacity
                    style={[styles.iconCircleSmall, { backgroundColor: "#fef2e0" }]}
                    onPress={() => navigation.navigate("CustomerInfo", { customer: selectedColleague })}
                  >
                    <MaterialIcons name="edit" size={22} color={colors.warning} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.iconCircleSmall, { backgroundColor: "#e5f9ec" }]}
                  onPress={() => navigation.navigate("CustomerInfo")}
                >
                  <MaterialIcons name="add" size={22} color={colors.success} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconCircleSmall, { backgroundColor: "#e4edf8" }]}
                  onPress={() => setShowColleagueSheet(true)}
                >
                  <MaterialIcons name="search" size={22} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>

          <View style={styles.selectedCustomerContainer}>
            {selectedColleague ? (
              <Text style={styles.selectedCustomerName}>
                {toPersianDigits(selectedColleague.name)}
              </Text>
            ) : (
              
             <Text style={styles.noCustomerText}>مشتری انتخاب نشده است.</Text>
            )}
          </View>
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>در حال بارگذاری اطلاعات محصول...</Text>
          </View>
        )}

        <ScrollView
          style={styles.scrollableContent}
          ref={scrollViewRef}
        >
          <View style={styles.productsSection}>
            {selectedProducts.map((product) => (
              <ProductCard
                key={product.id}
                title={toPersianDigits(product.title)}
                fields={[
                  {
                    icon: "qr-code",
                    iconColor: colors.secondary,
                    label: "کد:",
                    value: toPersianDigits(product.code || ""),
                  },
                  {
                    icon: "straighten",
                    iconColor: colors.secondary,
                    label: "مقدار:",
                    value: toPersianDigits(product.quantity),
                  },
                  {
                    icon: "attach-money",
                    iconColor: colors.secondary,
                    label: "قیمت هر واحد:",
                    value: toPersianDigits((product.price || 0).toLocaleString()) + " ریال",
                  },
                ]}
                note={product.note ? toPersianDigits(product.note) : ""}
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
                containerStyle={Platform.OS === "android" ? styles.androidCardAdjustment : {}}
                onLongPress={() => {
                  Alert.alert(
                    "حذف محصول",
                    "آیا از حذف این محصول اطمینان دارید؟",
                    [
                      { text: "خیر", style: "cancel" },
                      {
                        text: "بله",
                        onPress: () => {
                          removeProduct(product.id);
                          showToast("محصول با موفقیت حذف شد", "info");
                        }
                      }
                    ]
                  );
                }}
              />
            ))}

            {selectedProducts.length === 0 && (
              <View style={styles.emptyProductsContainer}>
                <MaterialIcons name="shopping-cart" size={50} color={colors.medium} />
                <Text style={styles.emptyProductsText}>محصولی به فاکتور اضافه نشده است</Text>
                <Text style={styles.emptyProductsSubText}>
                  برای افزودن محصول، از دکمه + یا اسکن بارکد استفاده کنید
                </Text>
              </View>
            )}
          </View>

          {selectedProducts.length > 0 && (
            <View style={styles.invoiceTotalContainer}>
              <InvoiceTotalCalculator products={selectedProducts} />
            </View>
          )}

          {/* Description input inside ScrollView, appears after adding products */}
          {selectedProducts.length > 0 && (
            <View style={styles.notesInputContainer}>
              <AppTextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
                icon="text-snippet"
                placeholder="توضیحات"
                onChangeText={(text) => setInvoiceNote(text)}
                value={invoiceNote}
                multiline
                numberOfLines={3}
                height={100}
                textAlign="right"
                isLargeInput={true}
              />
            </View>
          )}
        </ScrollView>

        {/* Buttons section at bottom, no longer contains the description field */}
        <View style={styles.bottomFixedContainer}>

          {/* Action buttons - positioned directly below the notes input */}
          <View style={styles.actionButtonsContainer}>
            {/* Add buttons row */}
            <View style={styles.iconButtonsContainer}>
              <TouchableOpacity style={styles.iconButton} onPress={() => {
                if (showProductProperties) {
                  setShowProductProperties(false);
                  setTimeout(() => {
                    setShowProductSearchDrawer(true);
                  }, 300);
                } else {
                  setShowProductSearchDrawer(true);
                }
              }}>
                <View style={[styles.iconCircle, { backgroundColor: "#FFFFFF", borderColor: `${colors.success}40` }]}>
                  <MaterialIcons name="add" size={30} color={colors.success} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate("BarCodeScanner")}>
                <View style={[styles.iconCircle, { backgroundColor: "#FFFFFF", borderColor: `${colors.secondary}40` }]}>
                  <MaterialIcons name="camera-alt" size={30} color={colors.secondary} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Submit button */}
            <View style={styles.submitButtonContainer}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={submitInvoice}
              >
                <MaterialIcons name="done" size={28} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>ثبت</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ProductSearchDrawer
          visible={showProductSearchDrawer}
          onClose={() => setShowProductSearchDrawer(false)}
          onProductSelect={handleProductSelected}
          searchProduct={handleProductSearch}
          onError={showToast}
        />

        {productToShow && (
          <ProductPropertiesDrawer
            visible={showProductProperties}
            onClose={handleCloseProductProperties}
            product={productToShow}
            onSave={handleAddProduct}
            onError={showToast}
          />
        )}
      </View>

      <ColleagueBottomSheet
        title="انتخاب مشتری"
        visible={showColleagueSheet}
        onClose={() => setShowColleagueSheet(false)}
        onSelectColleague={(colleague) => {
          setSelectedColleague(colleague);
          setShowColleagueSheet(false);
          showToast(`مشتری ${colleague.name} انتخاب شد`, "success");
        }}
      />
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
    display: 'flex',
    flexDirection: 'column',
  },
  customerContainer: {
    flexDirection: "column",
    marginBottom: 15,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    borderWidth: 2,
    borderColor: colors.gray,
  },
  customerGradient: {
    padding: 12,
  },
  customerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerField: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  customerLabel: {
    fontSize: 16,
    marginRight: 4,
    fontFamily: "Yekan_Bakh_Bold",
    color: "white",
  },
  customerIcon: {},
  customerButtonsContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  iconCircleSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  selectedCustomerContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
    backgroundColor: colors.light,
  },
  selectedCustomerName: {
    fontSize: 16,
    color: colors.dark,
    fontFamily: "Yekan_Bakh_Bold",
    textAlign: "center",
  },
  noCustomerText: {
    fontSize: 14,
    color: colors.medium,
    fontFamily: "Yekan_Bakh_Bold",
    
    textAlign: "center",
  },
  scrollableContent: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.medium,
  },
  productsSection: {
    marginBottom: 5,
  },
  androidCardAdjustment: {
    borderWidth: 3,
    borderColor: "#e0e0e0",
    marginVertical: 8,
  },
  emptyProductsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyProductsText: {
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    color: colors.medium,
    marginTop: 10,
  },
  emptyProductsSubText: {
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Regular",
    color: colors.medium,
    marginTop: 5,
    textAlign: 'center',
  },
  // Bottom container for action buttons only
  bottomFixedContainer: {
    backgroundColor: colors.light,
    width: '100%',
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
  },
  notesInputContainer: {
    paddingHorizontal: 0,
    paddingVertical: 10,
    marginTop: 5,
    // height: 200,
    marginBottom: 10,
  },
  invoiceTotalContainer: {
    marginTop: 0,
    marginBottom: 0,
    paddingHorizontal: 2,
  },
  // Container for add buttons and submit button
  actionButtonsContainer: {
    marginTop: 5,
  },
  iconButtonsContainer: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    marginVertical: 10,
  },
  iconButton: {
    marginHorizontal: 20,
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
  submitButtonContainer: {
    marginTop: 0,
    marginBottom: 0,
  },
  submitButton: {
    backgroundColor: colors.primary,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    padding: 10,
    height: 56,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    marginRight: 8,
    marginTop: 5,
    fontFamily: "Yekan_Bakh_Bold",
  },
});

export default IssuingNewInvoice;