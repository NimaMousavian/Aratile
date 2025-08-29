import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInput,
} from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import colors from "../config/colors";

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
  editable?: boolean;
}

interface QrConfig {
  show?: boolean;
  icon?: React.ComponentProps<typeof MaterialIcons>["name"];
  iconSize?: number;
  iconColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
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

interface ProductCardProps {
  title?: string | React.ReactNode;
  titleIcon?: IconConfig;
  fields: FieldItem[];
  note?: string | React.ReactNode;
  noteConfig?: NoteConfig;
  qrConfig?: QrConfig;

  // Action icons configuration
  editIcon?: ActionIconConfig;
  deleteIcon?: ActionIconConfig;
  callIcon?: ActionIconConfig;

  containerStyle?: StyleProp<ViewStyle>;
  titleContainerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;

  onPress?: () => void;
  onLongPress?: () => void;

  // Props برای دایره وضعیت
  status?: string;
  onStatusChange?: (status: string) => void;

  showTitle?: boolean;
  showNotes?: boolean;

  // Edit mode props
  isEditMode?: boolean;
  onDataChange?: (data: {
    title?: string;
    fields?: FieldItem[];
    note?: string;
  }) => void;
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

  // Action icons
  editIcon,
  deleteIcon,
  callIcon,

  containerStyle,
  titleContainerStyle,
  titleStyle,

  onPress,
  onLongPress,

  // پارامترهای وضعیت
  status,
  onStatusChange,

  showTitle = true,
  showNotes = true,

  // Edit mode
  isEditMode = false,
  onDataChange,
}) => {
  const [editableTitle, setEditableTitle] = useState<string>(
    typeof title === "string" ? title : ""
  );
  const [editableFields, setEditableFields] = useState<FieldItem[]>(fields);
  const [editableNote, setEditableNote] = useState<string>(
    typeof note === "string" ? note : ""
  );

  // Update local state when props change
  useEffect(() => {
    setEditableTitle(typeof title === "string" ? title : "");
    setEditableFields(fields);
    setEditableNote(typeof note === "string" ? note : "");
  }, [title, fields, note]);

  // Notify parent component of changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange({
        title: editableTitle,
        fields: editableFields,
        note: editableNote,
      });
    }
  }, [editableTitle, editableFields, editableNote, onDataChange]);

  const updateFieldValue = (index: number, newValue: string) => {
    const updatedFields = [...editableFields];
    updatedFields[index] = { ...updatedFields[index], value: newValue };
    setEditableFields(updatedFields);
  };

  // Separate fields into regular fields and dividers
  const regularFields = editableFields.filter((field) => !field.divider);

  // Find the index of the price field
  const priceFieldIndex = regularFields.findIndex(
    (field) => field.isPriceField
  );

  // Organize fields into sections
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

  const renderEditableField = (field: FieldItem, index: number) => {
    const isEditable = isEditMode && (field.editable !== false) && !field.isPriceField;

    if (isEditable) {
      return (
        <TextInput
          style={[styles.fieldEditableValue, field.valueStyle]}
          value={field.value}
          onChangeText={(text) => updateFieldValue(index, text)}
          placeholder={field.label}
          placeholderTextColor={colors.medium}
          textAlign="right"
        />
      );
    } else {
      return (
        <Text
          style={[
            field.isPriceField ? styles.priceValue : styles.fieldValue,
            { color: field.valueColor || colors.dark },
            field.valueStyle,
          ]}
        >
          {field.value}
        </Text>
      );
    }
  };

  const renderTitle = () => {
    if (isEditMode && typeof title === "string") {
      return (
        <TextInput
          style={styles.editableTitle}
          value={editableTitle}
          onChangeText={setEditableTitle}
          placeholder="نام محصول"
          placeholderTextColor={colors.medium}
          multiline
          textAlign="right"
        />
      );
    } else if (typeof title === "string") {
      return (
        <Text style={[styles.productTitle, titleStyle]}>{editableTitle}</Text>
      );
    } else {
      return title;
    }
  };

  const renderNote = () => {
    if (isEditMode) {
      return (
        <TextInput
          style={styles.editableNote}
          value={editableNote}
          onChangeText={setEditableNote}
          placeholder="توضیحات محصول"
          placeholderTextColor={colors.medium}
          multiline
          textAlign="right"
        />
      );
    } else if (typeof note === "string") {
      return (
        <Text style={[styles.regularNoteContent, noteConfig.valueStyle]}>
          {editableNote || "-"}
        </Text>
      );
    } else {
      return note;
    }
  };

  const renderFieldSection = (fieldsToRender: FieldItem[], startIndex: number = 0) => {
    return fieldsToRender.map((field, index) => {
      const actualIndex = startIndex + index;
      return (
        <View
          key={`field-${actualIndex}`}
          style={[
            styles.fieldContainer,
            field.containerStyle,
            index < fieldsToRender.length - 1 && styles.fieldMarginBottom,
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

          {renderEditableField(field, actualIndex)}
        </View>
      );
    });
  };

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
      disabled={isEditMode}
    >
      {showTitle && title && (
        <View style={[styles.productTitleContainer, titleContainerStyle]}>
          <View style={styles.productTitleRow}>
            {!isEditMode && (
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
            )}

            <View style={styles.titleWithIconContainer}>
              {titleIcon && (
                <MaterialIcons
                  name={titleIcon.name}
                  size={titleIcon.size || 20}
                  color={titleIcon.color || colors.primary}
                  style={{ marginLeft: 8 }}
                />
              )}
              {renderTitle()}
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
                name={qrConfig.icon || "image"}
                size={qrConfig.iconSize}
                color={qrConfig.iconColor}
              />
            </View>
          )}

          <View style={styles.infoSection}>
            {/* Render fields before price field */}
            {renderFieldSection(fieldsBeforePrice, 0)}
          </View>
        </View>

        {/* Divider before price field */}
        {priceField && <View style={styles.fullWidthDivider} />}

        {/* Price field */}
        {priceField && (
          <View style={styles.infoWithImageContainer}>
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

                {renderEditableField(priceField, priceFieldIndex)}
              </View>
            </View>
          </View>
        )}

        {/* Render fields after price field */}
        {fieldsAfterPrice.length > 0 && (
          <View style={styles.infoWithImageContainer}>
            {qrConfig.show && <View style={{ width: 80, marginRight: 12 }} />}

            <View style={styles.infoSection}>
              {renderFieldSection(fieldsAfterPrice, priceFieldIndex + 1)}
            </View>
          </View>
        )}

        {/* Render explicit divider fields */}
        {editableFields
          .filter((field) => field.divider)
          .map((field, index) => (
            <View
              key={`explicit-divider-${index}`}
              style={[styles.fullWidthDivider, field.customStyle]}
            />
          ))}

        {showNotes && noteConfig.show && (
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

            {renderNote()}
          </View>
        )}
      </View>

      {/* دایره وضعیت */}
      {status && onStatusChange && !isEditMode && (
        <View style={styles.statusCircleContainer}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onStatusChange(status);
            }}
            style={styles.statusCircle}
          >
            <Text style={styles.statusText}>{status}</Text>
          </TouchableOpacity>
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
    position: "relative",
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
  editableTitle: {
    fontSize: 18,
    color: colors.primary,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "600"),
    textAlign: "right",
    flex: 1,
    backgroundColor: colors.light,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.medium,
    minHeight: 50,
    textAlignVertical: "top",
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
    flex: 1,
    textAlign: "right",
  },
  fieldEditableValue: {
    fontSize: 15,
    color: colors.dark,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
    flex: 1,
    textAlign: "right",
    backgroundColor: colors.light,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.medium,
  },
  priceValue: {
    fontSize: 15,
    color: colors.primary,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "600"),
    flex: 1,
    textAlign: "right",
  },
  fullWidthDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
    marginVertical: 10,
    width: "100%",
  },
  statusCircleContainer: {
    position: "absolute",
    left: 10,
    bottom: 3,
    zIndex: 10,
  },
  statusCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.info,
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    color: colors.white,
    fontSize: 10,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
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
  editableNote: {
    fontSize: 15,
    color: colors.dark,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
    textAlign: "right",
    width: "100%",
    paddingRight: 22,
    backgroundColor: colors.light,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.medium,
    minHeight: 60,
    textAlignVertical: "top",
  },
});

export default ProductCard;