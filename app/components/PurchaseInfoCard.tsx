import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import colors from "../config/colors";

interface Person {
  name: string;
  phone: string;
}

type StatusType = "تایید نهایی" | "تعلیق" | "بسته نشده" | "لغو شده" | undefined;

interface PurchaseInfoCardProps {
  headerTitle?: string;
  headerIcon?: keyof typeof MaterialIcons.glyphMap;
  buyer?: Person;
  seller?: Person;
  address?: string;
  note?: string;
  gradientColors?: string[];
  containerStyle?: ViewStyle;
  status?: StatusType;
  isEditMode?: boolean;
  onDataChange?: (data: {
    buyer?: Person;
    seller?: Person;
    address?: string;
    note?: string;
  }) => void;
}

type FontWeight = "700" | "600" | "500" | "bold" | "semi-bold" | string;

const getFontFamily = (baseFont: string, weight: FontWeight): string => {
  if (Platform.OS === "android") {
    switch (weight) {
      case "700":
      case "bold":
        return "Yekan_Bakh_Bold";
      case "500":
      case "600":
      case "semi-bold":
        return "Yekan_Bakh_Bold";
      default:
        return "Yekan_Bakh_Regular";
    }
  }
  return baseFont;
};

const PurchaseInfoCard: React.FC<PurchaseInfoCardProps> = ({
  headerTitle = "اطلاعات خرید",
  headerIcon = "person",
  buyer = { name: "", phone: "" },
  seller = { name: "", phone: "" },
  address = "",
  note = "",
  gradientColors = [colors.secondary, colors.primary],
  containerStyle,
  status,
  isEditMode = false,
  onDataChange,
}) => {
  const [editableBuyer, setEditableBuyer] = useState<Person>(buyer);
  const [editableSeller, setEditableSeller] = useState<Person | undefined>(seller);
  const [editableAddress, setEditableAddress] = useState<string>(address);
  const [editableNote, setEditableNote] = useState<string>(note);

  // Update local state when props change
  useEffect(() => {
    setEditableBuyer(buyer);
    setEditableSeller(seller);
    setEditableAddress(address);
    setEditableNote(note);
  }, [buyer, seller, address, note]);

  // Notify parent component of changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        buyer: editableBuyer,
        seller: editableSeller,
        address: editableAddress,
        note: editableNote,
      });
    }
  }, [editableBuyer, editableSeller, editableAddress, editableNote, onDataChange]);

  const handlePhoneCall = (phoneNumber: string): void => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const getStatusColor = (): string => {
    switch (status) {
      case "تایید نهایی":
        return colors.success;
      case "تعلیق":
        return colors.info || "#FFA500";
      case "بسته نشده":
        return colors.info || "#3498db";
      case "لغو شده":
        return colors.danger || "#FF0000";
      default:
        return colors.medium;
    }
  };

  const renderEditableField = (
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    keyboardType: "default" | "phone-pad" = "default",
    multiline: boolean = false
  ) => {
    if (isEditMode) {
      return (
        <TextInput
          style={[
            styles.editableInput,
            multiline && styles.multilineInput
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.medium}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          textAlign="right"
        />
      );
    } else {
      return (
        <Text style={styles.secondaryValue}>
          {value || "-"}
        </Text>
      );
    }
  };

  return (
    <View
      style={[
        styles.purchaseCard,
        Platform.OS === "android" && styles.androidCardAdjustment,
        containerStyle,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.purchaseHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerTitleContainer}>
          <MaterialIcons name={headerIcon} size={22} color={colors.white} />
          <Text style={styles.purchaseHeaderText}>{headerTitle}</Text>
        </View>

        {status && (
          <View
            style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}
          >
            <Text style={styles.statusText}>{status}</Text>
          </View>
        )}
      </LinearGradient>

      <View style={styles.purchaseContent}>
        {editableBuyer.name && (
          <>
            <View style={styles.purchaseRow}>
              <View style={styles.purchaseItem}>
                <MaterialIcons
                  name="person"
                  size={18}
                  color={colors.blueIcon}
                />
                <View style={styles.purchaseTextContainer}>
                  <Text style={styles.secondaryLabel}>خریدار:</Text>
                  {renderEditableField(
                    editableBuyer.name,
                    (text) => setEditableBuyer(prev => ({ ...prev, name: text })),
                    "نام خریدار"
                  )}
                </View>
              </View>
              {editableBuyer.phone && !isEditMode && (
                <TouchableOpacity
                  style={styles.callButtonCircle}
                  onPress={() => handlePhoneCall(editableBuyer.phone)}
                >
                  <MaterialIcons name="call" size={25} color={colors.success} />
                </TouchableOpacity>
              )}
              {isEditMode && (
                <View style={styles.phoneEditContainer}>
                  {renderEditableField(
                    editableBuyer.phone,
                    (text) => setEditableBuyer(prev => ({ ...prev, phone: text })),
                    "شماره تلفن",
                    "phone-pad"
                  )}
                </View>
              )}
            </View>
            <View style={styles.divider} />
          </>
        )}

        {editableSeller?.name && (
          <>
            <View style={styles.purchaseRow}>
              <View style={styles.purchaseItem}>
                <MaterialIcons
                  name="store"
                  size={18}
                  color={colors.secondary}
                />
                <View style={styles.purchaseTextContainer}>
                  <Text style={styles.secondaryLabel}>فروشنده:</Text>
                  {renderEditableField(
                    editableSeller.name,
                    (text) => setEditableSeller(prev => prev ? { ...prev, name: text } : { name: text, phone: "" }),
                    "نام فروشنده"
                  )}
                </View>
              </View>
            </View>
            <View style={styles.divider} />
          </>
        )}

        {(editableAddress || isEditMode) && (
          <>
            <View style={styles.addressContainer}>
              <MaterialIcons
                name="location-on"
                size={18}
                color={colors.secondary}
              />
              <View style={styles.purchaseTextContainer}>
                <Text style={styles.secondaryLabel}>آدرس:</Text>
                {renderEditableField(
                  editableAddress,
                  setEditableAddress,
                  "آدرس را وارد کنید",
                  "default",
                  true
                )}
              </View>
            </View>
            <View style={styles.divider} />
          </>
        )}

        <View style={styles.noteContainer}>
          <MaterialIcons
            name="error-outline"
            size={18}
            color={colors.greenIcon}
          />
          <View style={styles.noteTextContainer}>
            <Text style={styles.noteLabel}>توضیحات:</Text>
            {renderEditableField(
              editableNote,
              setEditableNote,
              "توضیحات را وارد کنید",
              "default",
              true
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  purchaseCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  androidCardAdjustment: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    marginVertical: 8,
  },
  purchaseHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 16,
    justifyContent: "space-between",
  },
  headerTitleContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  purchaseHeaderText: {
    fontSize: 16,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "600"),
    color: colors.white,
    marginRight: 4,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 8,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  purchaseContent: {
    padding: 16,
  },
  purchaseRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  purchaseItem: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  purchaseTextContainer: {
    flexDirection: "row-reverse",
    marginRight: 8,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light,
    marginVertical: 12,
  },
  addressContainer: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
  },
  secondaryLabel: {
    fontSize: 15,
    color: colors.medium,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    marginLeft: 8,
  },
  secondaryValue: {
    fontSize: 15,
    color: colors.dark,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  noteContainer: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
  },
  noteTextContainer: {
    flexDirection: "row-reverse",
    flex: 1,
    marginRight: 8,
  },
  noteLabel: {
    fontSize: 15,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    marginLeft: 8,
  },
  callButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: colors.success,
    borderWidth: 2,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  phoneEditContainer: {
    minWidth: 120,
  },
  editableInput: {
    flex: 1,
    fontSize: 15,
    color: colors.dark,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
    backgroundColor: colors.light,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: "right",
    borderWidth: 1,
    borderColor: colors.medium,
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: "top",
  },
});

export default PurchaseInfoCard;