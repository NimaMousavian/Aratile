import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { BarCodeScannerResult } from "expo-barcode-scanner";
import AppButton from "../../../components/Button";

const BarcodeScanner = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState<boolean>(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  const handleBarcodeScanned = async ({ data }: BarCodeScannerResult) => {
    setScanned(true);

    try {
      const scannedData = JSON.parse(data);
      console.log("scanned data: ", scannedData);

      if (!scannedData.BaseURL && !scannedData.QRCodeToken) {
        throw new Error("Invalid data structure");
      }
    } catch (error) {
      alert("Failed to process scanned data. Please scan a valid QR code.");
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
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

      {scanned && (
        <AppButton
          title={"Tap to Scan Again"}
          onPress={() => setScanned(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  cameraView: {
    height: "90%",
  },
});

export default BarcodeScanner;
