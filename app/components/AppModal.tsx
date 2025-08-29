import React, { useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import AppButton from "./Button";

interface IProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  insideElement: React.ReactElement;
}

const AppModal: React.FC<IProps> = ({
  visible,
  onClose,
  onConfirm,
  insideElement,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {insideElement}
          <View style={styles.buttonContainer}>
            <AppButton
              title="تایید"
              onPress={onConfirm}
              color="success"
              style={{ width: "49%" }}
            />
            <AppButton
              title="انصراف"
              onPress={onClose}
              color="danger"
              style={{ width: "49%" }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  buttonContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default AppModal;
