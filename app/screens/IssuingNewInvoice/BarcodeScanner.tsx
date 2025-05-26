import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AppButton from "../../components/Button";
import { AppNavigationProp } from "../../StackNavigator";
import colors from "../../config/colors";
import Toast from "../../components/Toast";
import {
  CameraView,
  CameraType,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import axios from "axios";
import appConfig from "../../../config";
import { IProduct } from "../../config/types";
import { Product } from "./IssuingNewInvoice";

const { width, height } = Dimensions.get("window");
const SQUARE_SIZE = Math.min(width, height) * 0.6; // Square size is 60% of the smaller dimension

const BarcodeScanner = () => {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState<boolean>(true);

  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "warning" | "info"
  >("error");

  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute();
  const { onReturn } = route.params as { onReturn: (product: Product) => void };

  // useEffect(() => {
  //   showToast("بارکد اسکنر موقتا غیر فعال است", "warning");
  // }, []);

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "error"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);

    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  const getProductBySKU = async (sku: string) => {
    try {
      const response = await axios.get<IProduct>(
        `${appConfig.mobileApi}Product/GetBySKU?sku=${sku}`
      );

      const apiProduct = response.data;

      // Transform the API response to match the Product interface
      const product: Product = {
        id: apiProduct.ProductId,
        title: apiProduct.ProductName || "Unknown Product",
        code: apiProduct.SKU || sku,
        quantity: "1", // Default quantity, can be adjusted in IssuingNewInvoice
        price: apiProduct.Price || 0,
        note: apiProduct.ProductTypeStr || "",
        manualCalculation: false,
        hasColorSpectrum: false,
        measurementUnitName: apiProduct.ProductMeasurementUnitName || "",
        propertyValue: "",
        rectifiedValue: "",
        boxCount: 0,
        totalArea: 0,
        selectedVariation: undefined,
      };

      // Call the onReturn callback with the product
      onReturn(product);

      // Navigate back to IssuingNewInvoice
      navigation.goBack();
      console.log(product);
    } catch (error) {
      console.log(error);
      showToast("خطا در دریافت اطلاعات محصول", "error");
      setIsScanning(true);
    }
  };

  const handleBarcodeScanned = (scanningResult: BarcodeScanningResult) => {
    if (!isScanning) return; // Ignore scans if scanning is disabled

    // Disable further scanning
    setIsScanning(false);
    getProductBySKU(scanningResult.data);
  };

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  return (
    <View style={styles.container}>
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />
      <CameraView
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
      >
        <View style={styles.overlay}>
          <View style={styles.topOverlay} />
          <View style={styles.middleOverlay}>
            <View style={styles.leftOverlay} />
            <View style={styles.scanSquare} />
            <View style={styles.rightOverlay} />
          </View>
          <View style={styles.bottomOverlay} />
          <Text style={styles.overlayText}>بارکد را در کادر وسط قرار دهید</Text>
        </View>

        {!isScanning && (
          <View style={styles.processingOverlay}>
            <Text style={styles.processingText}>در حال پردازش بارکد...</Text>
          </View>
        )}
        <AppButton
          title="بازگشت"
          onPress={() => navigation.goBack()}
          color="danger"
          style={styles.backButton}
        />
      </CameraView>

      {/* <View style={styles.loadingContainer}>
        <Text style={styles.permissionText}>
          امکان استفاده از بارکد اسکنر در حال حاضر وجود ندارد.
        </Text>
        <AppButton
          title="بازگشت"
          onPress={() => navigation.goBack()}
          color="danger"
          style={styles.backButton}
        />
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
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
  backButton: {
    width: 200,
    position: "absolute",
    bottom: 20,
    left: 95,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // Cover the entire camera view
    justifyContent: "center",
    alignItems: "center",
  },
  topOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: "100%",
  },
  middleOverlay: {
    flexDirection: "row",
    height: SQUARE_SIZE,
  },
  leftOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  scanSquare: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    borderWidth: 1,
    borderColor: colors.medium,
    backgroundColor: "transparent",
  },
  rightOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: "100%",
  },
  overlayText: {
    position: "absolute",
    top: 50,
    color: colors.white,
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
    textAlign: "center",
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  processingText: {
    color: colors.white,
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
  },
});

export default BarcodeScanner;
