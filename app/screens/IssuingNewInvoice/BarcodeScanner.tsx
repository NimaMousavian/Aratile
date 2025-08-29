import React, { useEffect, useState, useRef } from "react";
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
const SQUARE_SIZE = Math.min(width, height) * 0.6;

const BarcodeScanner = () => {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastScannedCode, setLastScannedCode] = useState<string>("");

  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "warning" | "info"
  >("error");

  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute();
  const { onReturn } = route.params as { onReturn: (product: Product) => void };

  const processingRef = useRef(false);

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
    if (processingRef.current) {
      console.log("Already processing, skipping...");
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);
    console.log("Processing SKU:", sku);

    try {
      const response = await axios.get<IProduct>(
        `${appConfig.mobileApi}Product/GetBySKU?sku=${sku}`
      );

      const apiProduct = response.data;

      if (!apiProduct || !apiProduct.ProductId) {
        showToast("محصولی با این بارکد یافت نشد", "error");
        setTimeout(() => {
          setIsScanning(true);
          setIsProcessing(false);
          processingRef.current = false;
          setLastScannedCode("");
        }, 2000);
        return;
      }

      const detailResponse = await axios.get(
        `${appConfig.mobileApi}Product/Get?id=${apiProduct.ProductId}`
      );

      let propertyValue = null;
      let rectifiedValue = null;
      let inventory = null;

      if (
        detailResponse.data &&
        detailResponse.data.Product_ProductPropertyValue_List &&
        detailResponse.data.Product_ProductPropertyValue_List.length > 0
      ) {
        const rectifiedProperty = detailResponse.data.Product_ProductPropertyValue_List.find(
          (prop: any) => prop.ProductPropertyName === "رکتیفای"
        );

        if (rectifiedProperty) {
          rectifiedValue = rectifiedProperty.Value;
          console.log("مقدار رکتیفای یافت شد:", rectifiedValue);
        } else {
          console.log("ویژگی رکتیفای یافت نشد. استفاده از مقدار پیش‌فرض 1.44");
          rectifiedValue = "1.44";
        }

        propertyValue = detailResponse.data.Product_ProductPropertyValue_List[0].Value;
      } else {
        console.log("هیچ ویژگی برای محصول یافت نشد. استفاده از مقدار پیش‌فرض 1.44");
        rectifiedValue = "1.44";
      }

      if (detailResponse.data && detailResponse.data.Inventory !== undefined) {
        inventory = detailResponse.data.Inventory.toString();
        console.log("موجودی قابل تعهد یافت شد:", inventory);
      } else {
        console.log("موجودی قابل تعهد یافت نشد");
      }

      const product: Product = {
        id: apiProduct.ProductId,
        originalId: apiProduct.ProductId,
        title: apiProduct.ProductName || "Unknown Product",
        code: apiProduct.SKU || sku,
        quantity: "1",
        price: apiProduct.Price !== null ? apiProduct.Price : 0,
        note: "",
        manualCalculation: false,
        hasColorSpectrum: false,
        measurementUnitName: apiProduct.ProductMeasurementUnitName ||
          (detailResponse.data?.MeasurementUnit?.MeasurementUnitName || ""),
        propertyValue: inventory,
        rectifiedValue: rectifiedValue,
        boxCount: 0,
        totalArea: 0,
        selectedVariation: undefined,
      };

      console.log("محصول ارسال شده به ProductPropertiesDrawer:", product);

      onReturn(product);
      navigation.goBack();

    } catch (error) {
      console.log("Error fetching product:", error);

      try {
        const basicProduct: Product = {
          id: Date.now(),
          originalId: undefined,
          title: "Unknown Product",
          code: sku,
          quantity: "1",
          price: 0,
          note: "",
          manualCalculation: false,
          hasColorSpectrum: false,
          measurementUnitName: "",
          propertyValue: "0",
          rectifiedValue: "1.44",
          boxCount: 0,
          totalArea: 0,
          selectedVariation: undefined,
        };

        onReturn(basicProduct);
        navigation.goBack();

      } catch (finalError) {
        showToast("خطا در دریافت اطلاعات محصول", "error");
        setTimeout(() => {
          setIsScanning(true);
          setIsProcessing(false);
          processingRef.current = false;
          setLastScannedCode("");
        }, 2000);
      }
    }
  };

  const handleBarcodeScanned = (scanningResult: BarcodeScanningResult) => {
    console.log("Barcode scanned:", scanningResult.data, "isScanning:", isScanning, "isProcessing:", isProcessing);

    if (scanningResult.data === lastScannedCode) {
      console.log("Same code scanned, ignoring...");
      return;
    }

    if (!isScanning || isProcessing || processingRef.current) {
      console.log("Scanning disabled or processing, ignoring...");
      return;
    }

    console.log("Processing barcode:", scanningResult.data);

    setIsScanning(false);
    setLastScannedCode(scanningResult.data);

    getProductBySKU(scanningResult.data);
  };

  const handleBackButton = () => {
    navigation.goBack();
  };

  const resetScanner = () => {
    console.log("Resetting scanner...");
    setIsScanning(true);
    setIsProcessing(false);
    processingRef.current = false;
    setLastScannedCode("");
  };

  useEffect(() => {
    return () => {
      processingRef.current = false;
      setIsProcessing(false);
    };
  }, []);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isScanning && !isProcessing) {
        console.log("Auto-resetting scanner...");
        resetScanner();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isScanning, isProcessing]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.permissionText}>در حال بررسی مجوز دوربین...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.permissionText}>
            برای استفاده از بارکد اسکنر، مجوز دسترسی به دوربین لازم است.
          </Text>
          <AppButton
            title="درخواست مجوز"
            onPress={requestPermission}
            color="primary"
            style={styles.backButton}
          />
        </View>
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
        style={styles.camera}
        facing={facing}
        onBarcodeScanned={handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417", "code128", "code39", "ean13", "ean8", "upc_a", "upc_e"],
        }}
      />

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

    

      <View style={styles.bottomButtonsContainer}>
        <AppButton
          title="بازگشت"
          onPress={handleBackButton}
          color="danger"
          style={styles.backButton}
        />
      </View>
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
  bottomButtonsContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  backButton: {
    width: 200,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
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
  statusContainer: {
    position: "absolute",
    top: 100,
    left: 20,
    right: 20,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 8,
    padding: 10,
  },
  statusText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: "Yekan_Bakh_Bold",
    textAlign: "center",
  },
  resetButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  resetButtonText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: "Yekan_Bakh_Bold",
    textAlign: "center",
  },
});

export default BarcodeScanner;