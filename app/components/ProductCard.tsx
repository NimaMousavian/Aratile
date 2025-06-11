// src/components/ProductCard.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import colors from "../config/colors";
import StatusCircle from "../screens/TaskManagment/StatusCircle";

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

interface IconConfig {
  name: React.ComponentProps<typeof MaterialIcons>["name"];
  size?: number;
  color?: string;
}

interface ActionIconConfig extends IconConfig {
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

interface FieldItem {
  icon?: React.ComponentProps<typeof MaterialIcons>["name"];
  iconSize?: number;
  iconColor?: string;
  label?: string;
  labelStyle?: StyleProp<TextStyle>;
  value: string;
  valueColor?: string;
  valueStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  divider?: boolean;
  customStyle?: StyleProp<ViewStyle>;
  isPriceField?: boolean;
}

interface NoteConfig {
  show?: boolean;
  icon?: React.ComponentProps<typeof MaterialIcons>["name"];
  iconSize?: number;
  iconColor?: string;
  label?: string;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

interface QrConfig {
  show?: boolean;
  icon?: React.ComponentProps<typeof MaterialIcons>["name"];
  iconSize?: number;
  iconColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

interface ProductCardProps {
  title?: string | React.ReactNode; // تغییر به ReactNode برای پشتیبانی از کامپوننت‌های پیچیده‌تر
  titleIcon?: IconConfig;
  fields: FieldItem[];
  note?: string | React.ReactNode; // تغییر به ReactNode

  noteConfig?: NoteConfig;
  qrConfig?: QrConfig;

  // New action icons configuration
  editIcon?: ActionIconConfig;
  deleteIcon?: ActionIconConfig;
  callIcon?: ActionIconConfig;

  containerStyle?: StyleProp<ViewStyle>;
  titleContainerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;

  onPress?: () => void;
  onLongPress?: () => void;

  // اضافه کردن props جدید برای دایره وضعیت
  status?: string;
  onStatusChange?: (status: string) => void;

  showTitle?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  titleIcon,
  fields = [],
  note,

  noteConfig = {
    show: true,
    icon: "notes",
    iconSize: 20,
    iconColor: colors.secondary,
    label: "توضیحات:",
  },

  qrConfig = {
    show: true,
    icon: "qr-code-2",
    iconSize: 36,
    iconColor: colors.secondary,
  },

  // New action icons with default values
  editIcon,
  deleteIcon,
  callIcon,

  containerStyle,
  titleContainerStyle,
  titleStyle,

  onPress,
  onLongPress,

  // پارامترهای جدید وضعیت
  status,
  onStatusChange,

  showTitle = true,
}) => {
  // Separate fields into regular fields and dividers
  const regularFields = fields.filter((field) => !field.divider);

  // Find the index of the price field (if marked with isPriceField)
  const priceFieldIndex = regularFields.findIndex(
    (field) => field.isPriceField
  );

  // Organize fields into sections for rendering
  const fieldsBeforePrice =
    priceFieldIndex > 0
      ? regularFields.slice(0, priceFieldIndex)
      : regularFields;

  const priceField =
    priceFieldIndex >= 0 ? regularFields[priceFieldIndex] : null;
  const fieldsAfterPrice =
    priceFieldIndex >= 0 && priceFieldIndex < regularFields.length - 1
      ? regularFields.slice(priceFieldIndex + 1)
      : [];

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.productCard,
        Platform.OS === "android" && styles.androidCardAdjustment,
        containerStyle,
      ]}
    >
      {showTitle && title && (
        <View style={[styles.productTitleContainer, titleContainerStyle]}>
          <View style={styles.productTitleRow}>
            <View style={styles.actionIconsContainer}>
              {/* Edit Icon */}
              {editIcon && (
                <TouchableOpacity
                  onPress={editIcon.onPress}
                  style={[
                    styles.iconCircle,
                    { backgroundColor: "#fef2e0" },
                    editIcon.containerStyle,
                  ]}
                >
                  <MaterialIcons
                    name={editIcon.name || "edit"}
                    size={editIcon.size || 22}
                    color={editIcon.color || colors.warning}
                  />
                </TouchableOpacity>
              )}

              {/* Delete Icon */}
              {deleteIcon && (
                <TouchableOpacity
                  onPress={deleteIcon.onPress}
                  style={[
                    styles.iconCircle,
                    { backgroundColor: "#fee2e0" },
                    deleteIcon.containerStyle,
                  ]}
                >
                  <MaterialIcons
                    name={deleteIcon.name || "delete"}
                    size={deleteIcon.size || 22}
                    color={deleteIcon.color || colors.danger}
                  />
                </TouchableOpacity>
              )}
              {callIcon && (
                <TouchableOpacity
                  onPress={callIcon.onPress}
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: "#ffffff",
                      borderColor: colors.success,
                      borderWidth: 2,
                    },
                    callIcon.containerStyle,
                  ]}
                >
                  <MaterialIcons
                    name={callIcon.name || "call"}
                    size={callIcon.size || 22}
                    color={callIcon.color || colors.success}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.titleWithIconContainer}>
              {titleIcon && (
                <MaterialIcons
                  name={titleIcon.name}
                  size={titleIcon.size || 20}
                  color={titleIcon.color || colors.primary}
                  style={{ marginLeft: 8 }}
                />
              )}
              {typeof title === "string" ? (
                <Text style={[styles.productTitle, titleStyle]}>{title}</Text>
              ) : (
                title // اگر title یک ReactNode باشد، مستقیماً رندر می‌شود
              )}
            </View>
          </View>
        </View>
      )}

      <View style={styles.productDetailsContainer}>
        <View style={styles.infoWithImageContainer}>
          {/* QR code positioned next to product details */}
          {qrConfig.show && (
            <View
              style={[styles.productImagePlaceholder, qrConfig.containerStyle]}
            >
              <MaterialIcons
                name={qrConfig.icon || "qr-code-2"}
                size={qrConfig.iconSize}
                color={qrConfig.iconColor}
              />
            </View>
          )}

          <View style={styles.infoSection}>
            {/* Render fields before price field */}
            {fieldsBeforePrice.map((field, index) => (
              <View
                key={`field-before-${index}`}
                style={[
                  styles.fieldContainer,
                  field.containerStyle,
                  index < fieldsBeforePrice.length - 1 &&
                    styles.fieldMarginBottom,
                ]}
              >
                {field.icon && (
                  <MaterialIcons
                    name={field.icon}
                    size={field.iconSize || 18}
                    color={field.iconColor || colors.secondary}
                  />
                )}

                {field.label && (
                  <Text
                    style={[
                      styles.secondaryLabel,
                      styles.iconTextSpacing,
                      field.labelStyle,
                    ]}
                  >
                    {field.label}
                  </Text>
                )}

                <Text
                  style={[
                    styles.fieldValue,
                    { color: field.valueColor || colors.dark },
                    field.valueStyle,
                  ]}
                >
                  {field.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Divider before price field - full width outside of infoWithImageContainer */}
        {priceField && <View style={styles.fullWidthDivider} />}

        {/* Price field - rendered separately to ensure it's after the divider */}
        {priceField && (
          <View style={styles.infoWithImageContainer}>
            {/* Empty space to align with other fields */}
            {qrConfig.show && <View style={{ width: 80, marginRight: 12 }} />}

            <View style={styles.infoSection}>
              <View
                style={[
                  styles.fieldContainer,
                  priceField.containerStyle,
                  fieldsAfterPrice.length > 0 && styles.fieldMarginBottom,
                ]}
              >
                {priceField.icon && (
                  <MaterialIcons
                    name={priceField.icon}
                    size={priceField.iconSize || 18}
                    color={priceField.iconColor || colors.secondary}
                  />
                )}

                {priceField.label && (
                  <Text
                    style={[
                      styles.secondaryLabel,
                      styles.iconTextSpacing,
                      priceField.labelStyle,
                    ]}
                  >
                    {priceField.label}
                  </Text>
                )}

                <Text
                  style={[
                    styles.fieldValue,
                    { color: priceField.valueColor || colors.dark },
                    priceField.valueStyle,
                  ]}
                >
                  {priceField.value}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Render fields after price field */}
        {fieldsAfterPrice.length > 0 && (
          <View style={styles.infoWithImageContainer}>
            {/* Empty space to align with other fields */}
            {qrConfig.show && <View style={{ width: 80, marginRight: 12 }} />}

            <View style={styles.infoSection}>
              {fieldsAfterPrice.map((field, index) => (
                <View
                  key={`field-after-${index}`}
                  style={[
                    styles.fieldContainer,
                    field.containerStyle,
                    index < fieldsAfterPrice.length - 1 &&
                      styles.fieldMarginBottom,
                  ]}
                >
                  {field.icon && (
                    <MaterialIcons
                      name={field.icon}
                      size={field.iconSize || 18}
                      color={field.iconColor || colors.secondary}
                    />
                  )}

                  {field.label && (
                    <Text
                      style={[
                        styles.secondaryLabel,
                        styles.iconTextSpacing,
                        field.labelStyle,
                      ]}
                    >
                      {field.label}
                    </Text>
                  )}

                  <Text
                    style={[
                      styles.fieldValue,
                      { color: field.valueColor || colors.dark },
                      field.valueStyle,
                    ]}
                  >
                    {field.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Render divider fields that are explicitly added */}
        {fields
          .filter((field) => field.divider)
          .map((field, index) => (
            <View
              key={`explicit-divider-${index}`}
              style={[styles.fullWidthDivider, field.customStyle]}
            />
          ))}

        {noteConfig.show && (
          <View
            style={[styles.productCodeContainer, noteConfig.containerStyle]}
          >
            <View style={styles.noteHeaderContainer}>
              {noteConfig.icon && (
                <MaterialIcons
                  name={noteConfig.icon}
                  size={noteConfig.iconSize}
                  color={noteConfig.iconColor}
                />
              )}

              {noteConfig.label && (
                <Text
                  style={[
                    styles.secondaryLabel,
                    styles.iconTextSpacing,
                    noteConfig.labelStyle,
                  ]}
                >
                  {noteConfig.label}
                </Text>
              )}
            </View>

            {typeof note === "string" ? (
              <Text style={[styles.regularNoteContent, noteConfig.valueStyle]}>
                {note ? note : "-"}
              </Text>
            ) : (
              note // اگر note یک ReactNode باشد، مستقیماً رندر می‌شود
            )}
          </View>
        )}
      </View>

      {/* دایره وضعیت (چپ کارت) */}
      {status && onStatusChange && (
        <View style={styles.statusCircleContainer}>
          <StatusCircle
            status={status}
            onPress={(e) => {
              e.stopPropagation(); // جلوگیری از اجرای onPress کارت
              onStatusChange(status);
            }}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e1e1e1",
    position: "relative", // برای اضافه کردن دایره در موقعیت absolute
  },
  androidCardAdjustment: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    marginVertical: 8,
  },
  productTitleContainer: {
    padding: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  productTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleWithIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  productTitle: {
    fontSize: 18,
    color: colors.primary,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "600"),
    textAlign: "right",
    flex: 1,
  },
  actionIconsContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  productDetailsContainer: {
    padding: 12,
  },
  infoWithImageContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  infoSection: {
    flex: 1,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f8f8f8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  fieldContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    height: 25,
  },
  fieldMarginBottom: {
    marginBottom: 12,
  },
  secondaryLabel: {
    fontSize: 15,
    color: colors.medium,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    marginLeft: 8,
  },
  iconTextSpacing: {
    marginRight: 10,
  },
  fieldValue: {
    fontSize: 15,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
    marginVertical: 10,
    width: "100%",
    alignSelf: "stretch",
  },
  fullWidthDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
    marginVertical: 10,
    width: "100%",
  },
  productCodeContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
    paddingRight: 0,
    padding: 12,
    marginTop: 8,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: "#e1e1e1",
  },
  noteHeaderContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 8,
    alignSelf: "flex-end",
  },
  regularNoteContent: {
    fontSize: 15,
    color: colors.dark,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
    textAlign: "right",
    width: "100%",
    paddingRight: 22,
  },
  // استایل جدید برای دایره وضعیت
  statusCircleContainer: {
    position: "absolute",
    left: 10,
    bottom: 3, // به جای top: "50%" از bottom استفاده می‌کنیم
    zIndex: 10,
  },
});

export default ProductCard;
