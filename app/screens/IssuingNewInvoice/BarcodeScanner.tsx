import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { BarCodeScannerResult } from "expo-barcode-scanner";
import AppButton from "../../components/Button";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AppNavigationProp } from "../../StackNavigator";
import colors from "../../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import ProductPropertiesDrawer from "./ProductProperties";
import axios from "axios";
import appConfig from "../../../config";
import Toast from "../../components/Toast";
import { Product } from "./IssuingNewInvoice";

const API_BASE_URL = appConfig.mobileApi;

const BarcodeScanner = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [propertiesDrawerVisible, setPropertiesDrawerVisible] = useState<boolean>(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning" | "info">("error");

  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute();
  // دریافت callback از params
  const onReturn = route.params?.onReturn;

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "error") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);

    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  const searchProductBySKU = async (sku: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}Product/GetBySKU?sku=${sku}`);

      if (response.data && response.data.ProductId) {
        const detailResponse = await axios.get(`${API_BASE_URL}Product/Get?id=${response.data.ProductId}`);

        let rectifiedValue = "1.44";
        let inventory = null;

        if (detailResponse.data && detailResponse.data.Product_ProductPropertyValue_List &&
          detailResponse.data.Product_ProductPropertyValue_List.length > 0) {

          const rectifiedProperty = detailResponse.data.Product_ProductPropertyValue_List.find(
            (prop: any) => prop.ProductPropertyName === "رکتیفای"
          );

          if (rectifiedProperty) {
            rectifiedValue = rectifiedProperty.Value;
          }
        }

        if (detailResponse.data && detailResponse.data.Inventory !== undefined) {
          inventory = detailResponse.data.Inventory.toString();
        }

        const product: Product = {
          id: response.data.ProductId,
          title: response.data.ProductName,
          code: response.data.SKU,
          quantity: "1",
          price: response.data.Price !== null ? response.data.Price : 0,
          hasColorSpectrum: false,
          note: "",
          measurementUnitName: response.data.ProductMeasurementUnitName ||
            (detailResponse.data?.MeasurementUnit?.MeasurementUnitName || ""),
          propertyValue: inventory,
          rectifiedValue: rectifiedValue
        };

        return product;
      }
      return null;
    } catch (error) {
      console.error("Error searching product by SKU:", error);
      throw error;
    }
  };

  const handleBarcodeScanned = async ({ data }: BarCodeScannerResult) => {
    setScanned(true);
    setLoading(true);

    try {
      const product = await searchProductBySKU(data);

      if (product) {
        setScannedProduct(product);
        setPropertiesDrawerVisible(true);
        showToast(`محصول "${product.title}" یافت شد`, "success");
      } else {
        showToast("محصولی با این بارکد یافت نشد", "warning");
        setTimeout(() => {
          setScanned(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error handling barcode scan:", error);
      showToast("خطا در جستجوی محصول", "error");
      setTimeout(() => {
        setScanned(false);
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = (
    product: Product,
    quantity: string,
    note: string,
    manualCalculation: boolean,
    boxCount?: number
  ) => {
    let totalArea = null;
    if (boxCount && product.rectifiedValue) {
      const rectifiedValue = parseFloat(product.rectifiedValue);
      if (!isNaN(rectifiedValue)) {
        totalArea = boxCount * rectifiedValue;
      }
    }

    const finalProduct = {
      id: product.id,
      title: product.title,
      code: product.code,
      quantity: quantity,
      price: product.price,
      note: note,
      hasColorSpectrum: product.hasColorSpectrum,
      measurementUnitName: product.measurementUnitName,
      propertyValue: product.propertyValue,
      rectifiedValue: product.rectifiedValue,
      manualCalculation: manualCalculation,
      boxCount: boxCount,
      totalArea: totalArea
    };

    // به جای navigate با پارامتر، از callback استفاده می‌کنیم
    if (onReturn) {
      onReturn(finalProduct);
    }

    navigation.goBack();
    return true;
  };

  const handleDrawerClose = () => {
    setPropertiesDrawerVisible(false);
    setTimeout(() => {
      setScanned(false);
    }, 500);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.permissionText}>
          درحال درخواست دسترسی به دوربین...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.permissionText}>
          دسترسی به دوربین مجاز نیست. لطفاً از تنظیمات دستگاه، دسترسی دوربین را
          فعال کنید.
        </Text>
        <AppButton
          title="بازگشت"
          onPress={() => navigation.goBack()}
          color="danger"
          style={styles.backButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />

      <CameraView
        style={styles.cameraView}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39", "code93", "upc_e"],
        }}
      />

      <View style={styles.overlay}>
        <View style={styles.header}>
        </View>

        <View style={styles.scanAreaContainer}>
          <View style={styles.scanArea}>
            <View style={[styles.scanAreaCorner, styles.scanAreaTopLeft]} />
            <View style={[styles.scanAreaCorner, styles.scanAreaTopRight]} />
            <View style={[styles.scanAreaCorner, styles.scanAreaBottomLeft]} />
            <View style={[styles.scanAreaCorner, styles.scanAreaBottomRight]} />
          </View>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.white} />
              <Text style={styles.loadingText}>در حال جستجو...</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.instructionText}>
            بارکد محصول را در کادر بالا قرار دهید
          </Text>

          <AppButton
            title="بازگشت"
            onPress={() => navigation.goBack()}
            color="danger"
            style={styles.backButton}
          />
        </View>
      </View>

      {scannedProduct && (
        <ProductPropertiesDrawer
          visible={propertiesDrawerVisible}
          onClose={handleDrawerClose}
          product={scannedProduct}
          onSave={handleSaveProduct}
          onError={(message, type) => showToast(message, type)}
          isEditing={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  permissionText: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 20,
    fontFamily: "Yekan_Bakh_Regular",
  },
  cameraView: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
  },
  scanAreaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: "transparent",
    position: "relative",
  },
  scanAreaCorner: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "white",
    borderWidth: 4,
    backgroundColor: "transparent",
  },
  scanAreaTopLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 16,
  },
  scanAreaTopRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderTopRightRadius: 16,
  },
  scanAreaBottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomLeftRadius: 16,
  },
  scanAreaBottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  loadingText: {
    color: "white",
    fontSize: 16,
    marginTop: 12,
    fontFamily: "Yekan_Bakh_Regular",
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  instructionText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Yekan_Bakh_Regular",
    marginBottom: 20,
  },
  backButton: {
    width: 200,
  },
});

export default BarcodeScanner;