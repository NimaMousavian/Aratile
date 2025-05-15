import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AppButton from "../../components/Button";
import { AppNavigationProp } from "../../StackNavigator";
import colors from "../../config/colors";
import Toast from "../../components/Toast";

const BarcodeScanner = () => {
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning" | "info">("error");

  const navigation = useNavigation<AppNavigationProp>();
  const route = useRoute();

  useEffect(() => {
    showToast("بارکد اسکنر موقتا غیر فعال است", "warning");
  }, []);

  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "error") => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);

    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />

      <View style={styles.loadingContainer}>
        <Text style={styles.permissionText}>
          امکان استفاده از بارکد اسکنر در حال حاضر وجود ندارد.
        </Text>
        <AppButton
          title="بازگشت"
          onPress={() => navigation.goBack()}
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
    backgroundColor: colors.background,
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
  },
});

export default BarcodeScanner;