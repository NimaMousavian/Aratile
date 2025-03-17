import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Portal, Dialog, Button, RadioButton, Text } from "react-native-paper";
import colors from "../config/colors";
import AppButton from "./Button";
import AppText from "./Text";
import { MaterialIcons } from "@expo/vector-icons";

interface SelectionDialogProps {
  iconName?: React.ComponentProps<typeof MaterialIcons>["name"];
  placeholderText?: string;
  onSelect: (value: string) => void;
  initialValue?: string;
  options: string[];
  title?: string;
  cancelButtonText?: string;
  accentColor?: string;
}

const SelectionDialog: React.FC<SelectionDialogProps> = ({
  iconName = "person",
  placeholderText = "انتخاب کنید",
  onSelect,
  initialValue = "",
  options = [],
  title = "انتخاب گزینه",
  cancelButtonText = "انصراف",
  accentColor = colors.secondary,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(initialValue);
  const [visible, setVisible] = useState<boolean>(false);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onSelect(value);
    setVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setVisible(true)}
      >
        <MaterialIcons name={iconName} size={20} color={colors.medium} />
        <AppText style={styles.selectedText}>
          {selectedValue === "" ? placeholderText : selectedValue}
        </AppText>
      </TouchableOpacity>
      <Portal>
        <Dialog
          visible={visible}
          onDismiss={() => setVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>{title}</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={handleSelect}
              value={selectedValue}
            >
              {options.map((option) => (
                <RadioButton.Item
                  key={option}
                  label={option}
                  value={option}
                  labelStyle={styles.radioLabel}
                  style={styles.radioItem}
                  color={accentColor}
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions style={styles.buttonsContainer}>
            {/* <AppButton
              onPress={() => setVisible(false)}
              title="تایید"
              color="success"
              style={{ width: "45%" }}
            >
              {cancelButtonText}
            </AppButton> */}
            <AppButton
              onPress={() => setVisible(false)}
              title="انصراف"
              color="danger"
              style={{ width: "45%" }}
            >
              {cancelButtonText}
            </AppButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginHorizontal: 20,
  },
  dialogTitle: {
    fontFamily: "Yekan_Bakh_Bold",
    textAlign: "right",
    color: "#1F2937",
    fontSize: 18,
  },
  radioItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 8,
  },
  radioLabel: {
    fontFamily: "Yekan_Bakh_Regular",
    textAlign: "right",
    flex: 1,
    marginLeft: 0,
    marginRight: 8,
    color: "#374151",
  },
  buttonsContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 8,
    flexDirection: "row-reverse",
    padding: 12,
    marginBottom: 16,
  },
  selectedText: {
    color: colors.medium,
    fontSize: 15,
    marginRight: 10,
  },
});

export default SelectionDialog;
