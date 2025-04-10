import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { BarCodeScannerResult } from "expo-barcode-scanner";
import AppButton from "../../components/Button";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../../StackNavigator";
import colors from "../../config/colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

const BarcodeScanner = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const navigation = useNavigation<AppNavigationProp>();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarcodeScanned = ({ data }: BarCodeScannerResult) => {
    setScanned(true);
    // مستقیماً کد اسکن شده را به صفحه قبلی می‌فرستیم
    navigation.navigate("IssuingNewInvoice", { scannedCode: data });
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
      <CameraView
        style={styles.cameraView}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.headerText}>اسکن بارکد محصول</Text>
        </View>

        <View style={styles.scanAreaContainer}>
          <View style={styles.scanArea}>
            <View style={[styles.scanAreaCorner, styles.scanAreaTopLeft]} />
            <View style={[styles.scanAreaCorner, styles.scanAreaTopRight]} />
            <View style={[styles.scanAreaCorner, styles.scanAreaBottomLeft]} />
            <View style={[styles.scanAreaCorner, styles.scanAreaBottomRight]} />
          </View>
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
  headerText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Yekan_Bakh_Bold",
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
    borderColor: colors.primary,
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
