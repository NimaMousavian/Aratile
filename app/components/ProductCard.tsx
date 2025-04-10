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

  title?: string;
  titleIcon?: IconConfig;
  fields: FieldItem[];
  note?: string;

  noteConfig?: NoteConfig;
  qrConfig?: QrConfig;


  containerStyle?: StyleProp<ViewStyle>;
  titleContainerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;


  onPress?: () => void;


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
    iconColor: colors.secondary
  },

  containerStyle,
  titleContainerStyle,
  titleStyle,


  onPress,


  showTitle = true,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      style={[
        styles.productCard,
        Platform.OS === 'android' && styles.androidCardAdjustment,
        containerStyle
      ]}
    >

      {showTitle && title && (
        <View style={[styles.productTitleContainer, titleContainerStyle]}>
          <View style={styles.productTitleRow}>
            {titleIcon && (
              <MaterialIcons
                name={titleIcon.name}
                size={titleIcon.size || 20}
                color={titleIcon.color || colors.primary}
                style={{ marginLeft: 8 }}
              />
            )}
            <Text style={[styles.productTitle, titleStyle]}>{title}</Text>
          </View>
        </View>
      )}


      <View style={styles.productDetailsContainer}>
        <View style={styles.infoWithImageContainer}>
          <View style={styles.infoSection}>

            {fields.map((field, index) => (
              <View
                key={index}
                style={[
                  styles.fieldContainer,
                  field.containerStyle,
                  index < fields.length - 1 && styles.fieldMarginBottom
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
                  <Text style={[
                    styles.secondaryLabel,
                    styles.iconTextSpacing,
                    field.labelStyle
                  ]}>
                    {field.label}
                  </Text>
                )}

                <Text style={[
                  styles.fieldValue,
                  { color: field.valueColor || colors.dark },
                  field.valueStyle
                ]}>
                  {field.value}
                </Text>
              </View>
            ))}
          </View>


          {qrConfig.show && (
            <View style={[styles.productImagePlaceholder, qrConfig.containerStyle]}>
              <MaterialIcons
                name={qrConfig.icon || "qr-code-2"}
                size={qrConfig.iconSize}
                color={qrConfig.iconColor}
              />
            </View>
          )}
        </View>

        {noteConfig.show && note && (
          <View style={[styles.productCodeContainer, noteConfig.containerStyle]}>
            <View style={styles.noteHeaderContainer}>
              {noteConfig.icon && (
                <MaterialIcons
                  name={noteConfig.icon}
                  size={noteConfig.iconSize}
                  color={noteConfig.iconColor}
                />
              )}

              {noteConfig.label && (
                <Text style={[
                  styles.secondaryLabel,
                  styles.iconTextSpacing,
                  noteConfig.labelStyle
                ]}>
                  {noteConfig.label}
                </Text>
              )}
            </View>

            <Text style={[
              styles.regularNoteContent,
              noteConfig.valueStyle
            ]}>
              {note}
            </Text>
          </View>
        )}
      </View>
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
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productTitle: {
    fontSize: 18,
    color: colors.primary,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "600"),
    textAlign: "right",
    flex: 1,
  },
  productDetailsContainer: {
    padding: 12,
  },
  infoWithImageContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoSection: {
    flex: 1,
  },
  fieldContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
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
  productImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: colors.light,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
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
});

export default ProductCard;