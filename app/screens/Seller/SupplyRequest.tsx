import React, { useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import AppText from "../../components/Text";
import AppButton from "../../components/Button";
import AppTextInput from "../../components/TextInput";

const SupplyRequest = () => {
  const [showModal, setShowModal] = useState<boolean>(true);

  return (
    <View style={styles.container}>
      <AppText>test</AppText>
      <Modal visible={showModal} animationType="slide">
        <View style={{ padding: 20, flex: 1 }}>
          <AppTextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="default"
            placeholder="نام کالا را وارد کنید"
            onChangeText={() => {}}
            style={{ width: "100%" }}
          ></AppTextInput>
          <AppButton title="جستجو" onPress={() => {}} color="success" />
          <AppButton
            title="بستن"
            onPress={() => setShowModal(false)}
            color="danger"
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 50 },
});

export default SupplyRequest;
