import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Modal,
  Button,
  FlatList,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import Text from "./Text";
import defaultStyles from "../config/styles";
import PickerItem, { PickerItemType } from "./PickerItem";
import AppButton from "./Button";
import colors from "../config/colors";

interface AppPickerProps {
  icon?: string;
  items: PickerItemType[];
  numberOfColumns?: number;
  onSelectItem: (item: PickerItemType) => void;
  PickerItemComponent?: React.ComponentType<{
    item: PickerItemType;
    label: string;
    onPress: () => void;
  }>;
  placeholder?: string;
  selectedItem?: PickerItemType;
  width?: string | number;
}

function AppPicker({
  icon,
  items,
  numberOfColumns = 1,
  onSelectItem,
  PickerItemComponent = PickerItem,
  placeholder,
  selectedItem,
  width = "100%",
}: AppPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableWithoutFeedback onPress={() => setModalVisible(true)}>
        <View style={[styles.container, { width: width as any }]}>
          {icon && (
            <MaterialCommunityIcons
              name={icon as any}
              size={20}
              color={defaultStyles.colors.medium}
              style={styles.icon}
            />
          )}
          {selectedItem ? (
            <Text style={styles.text}>{selectedItem.label}</Text>
          ) : (
            <Text style={styles.placeholder}>{placeholder}</Text>
          )}

          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color={defaultStyles.colors.medium}
          />
        </View>
      </TouchableWithoutFeedback>
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <AppButton
            title="بستن"
            onPress={() => setModalVisible(false)}
            color="danger"
          />
          <FlatList
            data={items}
            keyExtractor={(item) => item.value.toString()}
            numColumns={numberOfColumns}
            renderItem={({ item }) => (
              <PickerItemComponent
                item={item}
                label={item.label}
                onPress={() => {
                  setModalVisible(false);
                  onSelectItem(item);
                }}
              />
            )}
            scrollEnabled={false}
          />
        </ScrollView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: defaultStyles.colors.light,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.primary,
    flexDirection: "row-reverse",
    paddingHorizontal: 15, marginVertical: 10,
  },
  icon: {
    marginLeft: 10,
    marginVertical: "auto",
    marginRight: -10,
  },
  placeholder: {
    color: defaultStyles.colors.medium,
    flex: 1,
  },
  text: {
    flex: 1,
  },
  modalContainer: {
    padding: 10,
  },
});

export default AppPicker;
