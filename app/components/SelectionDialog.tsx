import React, { useState } from "react";
import { StyleSheet } from "react-native";
import { Portal, Dialog, Button, RadioButton, Text } from "react-native-paper";

interface SelectionDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (value: string) => void;
  initialValue?: string;
  options: string[];
  title?: string;
  cancelButtonText?: string;
  accentColor?: string;
}

const SelectionDialog: React.FC<SelectionDialogProps> = ({ 
  visible, 
  onDismiss, 
  onSelect, 
  initialValue = "", 
  options = [],
  title = "انتخاب گزینه",
  cancelButtonText = "انصراف",
  accentColor = "#F59E0B"
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(initialValue);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onSelect(value);
    onDismiss();
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={styles.dialog}
      >
        <Dialog.Title style={styles.dialogTitle}>
          {title}
        </Dialog.Title>
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
        <Dialog.Actions>
          <Button
            onPress={onDismiss}
            textColor={accentColor}
          >
            {cancelButtonText}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
  },
  dialogTitle: {
    fontFamily: 'Yekan_Bakh_Bold',
    textAlign: 'right',
    color: '#1F2937',
    fontSize: 18,
  },
  radioItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 8,
  },
  radioLabel: {
    fontFamily: 'Yekan_Bakh_Regular',
    textAlign: 'right',
    flex: 1,
    marginLeft: 0,
    marginRight: 8,
    color: '#374151',
  },
});

export default SelectionDialog;