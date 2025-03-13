import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  StatusBar,
  Image,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../../SellerStackNavigator";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import colors from "../../../config/colors";

type ReceiveNewInvoiceNavigationProp =
  NativeStackNavigationProp<RootStackParamList>;

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

const productData = [
  {
    id: 1,
    title: "پرسلان نگار رافیا استخوانی مات ۶۰×۱۳۰ (کد:۱/۴۴)",
    quantity: "۵.۷۶ متر مربع",
    note: "-",
    code: "١٣١٢٧٧٩١٣٠٦٠٢١٢٠١٥١٤٣٠١",
    hasColorSpectrum: true,
  },
  {
    id: 2,
    title: "کاشی دیواری سرامیک البرز طرح پالیزاندو ۳۰×۱۰۰ (کد:۲/۵۸)",
    quantity: "۸.۸۰ متر مربع",
    note: "نصب در اتاق خواب",
    code: "١٤٣٧٨٢١٣٩٦١٨٠٩٢١٣٤٣٥٩١",
    hasColorSpectrum: false,
  },
  {
    id: 3,
    title: "سرامیک کف گرانیتی مرجان طرح لوشان ۶۰×۶۰ (کد:۳/۲۱)",
    quantity: "۱۶.۲۰ متر مربع",
    note: "ارسال به آدرس مشتری",
    code: "١١٨٥٤٣٢٧١٣٦٥٤٠٩٧٦٢٧٩٠١",
    hasColorSpectrum: true,
  },
  {
    id: 4,
    title: "موزاییک طرح سنگ ایرانی ۳۰×۳۰ (کد:۵/۷۷)",
    quantity: "۴.۵۰ متر مربع",
    note: "نصب در حیاط خلوت",
    code: "١٥٨٦٧٩٤٣١٤٧٨٢٣٤٥٦٧١٨٢٣",
    hasColorSpectrum: false,
  },
];

const ReceiveNewInvoiceScreen: React.FC = () => {
  const navigation = useNavigation<ReceiveNewInvoiceNavigationProp>();

  const handlePhoneCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <SafeAreaView style={styles.safeAreaTop} />
      <SafeAreaView style={styles.safeAreaBottom}>
        <View style={styles.container}>
          <ScrollView
            style={[
              styles.content,
              Platform.OS === "android" && styles.androidContentAdjustment,
            ]}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.card,
                Platform.OS === "android" && styles.androidCardAdjustment,
              ]}
            >
              <View style={styles.cardHeaderSection}>
                <View style={styles.invoiceNumberBadge}>
                  <Text style={styles.invoiceNumberLabel}>شماره فاکتور:</Text>
                  <Text style={styles.invoiceNumberValue}>16528</Text>
                </View>
                <View style={styles.invoiceDate}>
                  <MaterialIcons name="event" size={16} color={colors.medium} />
                  <Text style={styles.dateValue}>١٤٠٣/١٠/١</Text>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.purchasesecondaryCard,
                Platform.OS === "android" && styles.androidCardAdjustment,
              ]}
            >
              <LinearGradient
                colors={[colors.secondary, colors.primary]}
                style={styles.purchasesecondaryHeader}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialIcons name="person" size={22} color={colors.white} />
                <Text style={styles.purchasesecondaryHeaderText}>
                  اطلاعات خرید
                </Text>
              </LinearGradient>

              <View style={styles.purchasesecondaryContent}>
                <View style={styles.purchasesecondaryRow}>
                  <View style={styles.purchasesecondaryItem}>
                    <MaterialIcons
                      name="person"
                      size={18}
                      color={colors.secondary}
                    />
                    <View style={styles.purchasesecondaryTextContainer}>
                      <Text style={styles.secondaryLabel}>خریدار:</Text>
                      <Text style={styles.secondaryValue}>نمت</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.callButtonCircle}
                    onPress={() => handlePhoneCall("09353130587")}
                  >
                    <MaterialIcons name="call" size={18} color={colors.white} />
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <View style={styles.purchasesecondaryRow}>
                  <View style={styles.purchasesecondaryItem}>
                    <MaterialIcons
                      name="store"
                      size={18}
                      color={colors.secondary}
                    />
                    <View style={styles.purchasesecondaryTextContainer}>
                      <Text style={styles.secondaryLabel}>فروشنده:</Text>
                      <Text style={styles.secondaryValue}>زهره نورانی</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.callButtonCircle}
                    onPress={() => handlePhoneCall("09137305578")}
                  >
                    <MaterialIcons name="call" size={18} color={colors.white} />
                  </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <View style={styles.addressContainer}>
                  <MaterialIcons
                    name="location-on"
                    size={18}
                    color={colors.secondary}
                  />
                  <View style={styles.purchasesecondaryTextContainer}>
                    <Text style={styles.secondaryLabel}>آدرس:</Text>
                    <Text style={styles.addressValue}>ایران، تهران</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.noteContainer}>
                  <MaterialIcons
                    name="error-outline"
                    size={18}
                    color={colors.secondary}
                  />
                  <View style={styles.noteTextContainer}>
                    <Text style={styles.noteLabel}>توضیحات:</Text>
                    <Text style={styles.noteContent}>
                      لطفا فاکتور صادر نشود
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.productsSection}>
              <View style={styles.sectionHeader}>
                <MaterialIcons
                  name="shopping-bag"
                  size={18}
                  color={colors.primary}
                />
                <Text style={styles.sectionHeaderText}>اطلاعات محصولات</Text>
              </View>

              {productData.map((product) => (
                <View
                  key={product.id}
                  style={[
                    styles.productCard,
                    Platform.OS === "android" && styles.androidCardAdjustment,
                  ]}
                >
                  <View style={styles.productTitleContainer}>
                    <View style={styles.productTitleRow}>
                      <Text style={styles.productTitle}>{product.title}</Text>
                    </View>
                  </View>

                  <View style={styles.productDetailsContainer}>
                    <View style={styles.infoWithImageContainer}>
                      <View style={styles.infoSection}>
                        <View style={styles.productNoteContainer}>
                          <MaterialIcons
                            name="qr-code"
                            size={22}
                            color={colors.secondary}
                          />
                          <Text
                            style={[
                              styles.secondaryLabel,
                              styles.iconTextSpacing,
                            ]}
                          >
                            کد محصول:
                          </Text>
                          <Text style={styles.productCode}>{product.code}</Text>
                        </View>
                        <View style={styles.quantityContainer}>
                          <MaterialIcons
                            name="straighten"
                            size={18}
                            color={colors.secondary}
                          />
                          <Text
                            style={[
                              styles.secondaryLabel,
                              styles.iconTextSpacing,
                            ]}
                          >
                            مقدار:
                          </Text>
                          <Text style={styles.quantityValue}>
                            {product.quantity}
                          </Text>
                        </View>

                        <View style={styles.colorSpectrumContainer}>
                          <MaterialIcons
                            name="palette"
                            size={18}
                            color={colors.secondary}
                          />
                          <Text
                            style={[
                              styles.secondaryLabel,
                              styles.iconTextSpacing,
                            ]}
                          >
                            طیف رنگی:
                          </Text>
                          {product.hasColorSpectrum ? (
                            <Text style={styles.spectrumValueHas}>دارد</Text>
                          ) : (
                            <Text style={styles.spectrumValueHasNot}>
                              ندارد
                            </Text>
                          )}
                        </View>
                      </View>

                      <View style={styles.productImagePlaceholder}>
                        <MaterialIcons
                          name="qr-code-2"
                          size={36}
                          color={colors.secondary}
                        />
                      </View>
                    </View>

                    <View style={styles.productCodeContainer}>
                      <MaterialIcons
                        name="notes"
                        size={18}
                        color={colors.secondary}
                      />
                      <Text
                        style={[styles.secondaryLabel, styles.iconTextSpacing]}
                      >
                        توضیحات:
                      </Text>
                      <Text style={styles.regularNoteContent}>
                        {product.note}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View
              style={[
                styles.sellerCard,
                Platform.OS === "android" && styles.androidCardAdjustment,
              ]}
            >
              <Text style={styles.sellerLabel}>نام فروشنده</Text>

              <View style={styles.qrPlaceholder}>
                <View style={styles.qrCodeRectangle}>
                  <MaterialIcons
                    name="qr-code-2"
                    size={100}
                    color={colors.gray}
                  />
                </View>
              </View>
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>

          <View style={styles.actionsContainer}>
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.finalizeBtn]}>
                <MaterialIcons name="done-all" size={20} color={colors.white} />
                <Text style={styles.actionBtnText}>تایید نهایی</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionBtn, styles.suspendBtn]}>
                <MaterialIcons
                  name="pause-circle-outline"
                  size={20}
                  color={colors.white}
                />
                <Text style={styles.actionBtnText}>تعلیق</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.referBtn]}>
                <MaterialIcons name="send" size={20} color={colors.white} />
                <Text style={styles.actionBtnText}>ارجاع به فروشنده</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]}>
                <MaterialIcons name="close" size={20} color={colors.white} />
                <Text style={styles.actionBtnText}>لغو</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeAreaTop: {
    flex: 0,
    backgroundColor: colors.light,
  },
  safeAreaBottom: {
    flex: 1,
    backgroundColor: colors.light,
  },
  container: {
    flex: 1,
    paddingBottom: 0,
    backgroundColor: colors.light,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingTop: Platform.OS === "android" ? 60 : 20,
  },
  androidContentAdjustment: {
    marginTop: 0,
  },

  androidCardAdjustment: {
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    marginVertical: 8,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  cardHeaderSection: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  invoiceNumberBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#EBF5FB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9,
  },
  invoiceNumberLabel: {
    fontSize: 15,
    color: colors.info,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    marginLeft: 6,
  },
  invoiceNumberValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.info,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "bold"),
  },
  invoiceDate: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  dateValue: {
    fontSize: 15,
    marginRight: 6,
    color: colors.medium,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
  },

  callButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success,
    justifyContent: "center",
    alignItems: "center",
  },

  purchasesecondaryCard: {
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
  purchasesecondaryHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 16,
  },
  purchasesecondaryHeaderText: {
    fontSize: 16,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "600"),
    color: colors.white,
    marginRight: 8,
  },
  purchasesecondaryContent: {
    padding: 16,
  },
  purchasesecondaryRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  purchasesecondaryItem: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  purchasesecondaryTextContainer: {
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
    alignItems: "center",
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
  addressValue: {
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
  iconTextSpacing: {
    marginRight: 10,
  },
  noteLabel: {
    fontSize: 15,
    // color: colors.danger,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    marginLeft: 8,
  },
  noteContent: {
    fontSize: 15,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
    // color: colors.danger,
    flex: 1,
    textAlign: "right",
  },

  productsSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionHeaderText: {
    fontSize: 16,
    marginRight: 8,
    color: colors.primary,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "600"),
  },

  productCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 2,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  productTitleContainer: {
    padding: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
    // borderRightWidth: 3,
    // borderRightColor: colors.secondary,
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
    marginLeft: 8,
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
  quantityContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },
  quantityValue: {
    fontSize: 15,
    color: colors.dark,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  colorSpectrumContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 16,
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
  spectrumValueHas: {
    fontSize: 15,
    color: colors.success,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  spectrumValueHasNot: {
    fontSize: 15,
    color: colors.danger,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  productNoteContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },
  regularNoteContent: {
    fontSize: 15,
    color: colors.dark,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
  },
  spectrumOptionContainer: {
    flexDirection: "row-reverse",
  },
  spectrumOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
    borderWidth: 1,
  },
  spectrumOptionHas: {
    backgroundColor: "#E8F5E9",
    borderColor: colors.success,
  },
  spectrumOptionHasNot: {
    backgroundColor: "#FFEBEE",
    borderColor: colors.danger,
  },
  spectrumOptionText: {
    fontSize: 12,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
  },
  spectrumOptionTextHas: {
    color: colors.success,
  },
  spectrumOptionTextHasNot: {
    color: colors.danger,
  },
  productCodeContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingRight: 0,
    padding: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: "#e1e1e1",
  },
  productCodeLabel: {
    fontSize: 15,
    color: colors.medium,
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    marginRight: 8,
    marginLeft: 8,
  },
  productCode: {
    fontSize: 15,
    color: colors.dark,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "500"),
    letterSpacing: 1,
  },

  sellerCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  sellerLabel: {
    fontSize: 16,
    color: colors.primary,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "600"),
    marginBottom: 16,
  },
  qrPlaceholder: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  qrCodeRectangle: {
    width: 150,
    height: 150,
    backgroundColor: colors.white,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  imagePlaceholder: {
    width: 30,
    height: 30,
    backgroundColor: colors.light,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  spacer: {
    flex: 1,
  },
  bottomSpacer: {
    height: 200,
  },
  actionsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e1e1e1",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  actionBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    padding: 12,
    flex: 0.49,
  },
  actionBtnText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: getFontFamily("Yekan_Bakh_Bold", "600"),
    marginRight: 8,
  },
  scanBtn: {
    backgroundColor: colors.success,
  },
  notScanBtn: {
    backgroundColor: colors.gray,
  },
  finalizeBtn: {
    backgroundColor: colors.success,
  },
  suspendBtn: {
    backgroundColor: "#F39C12",
  },
  referBtn: {
    backgroundColor: colors.secondary,
  },
  cancelBtn: {
    backgroundColor: colors.danger,
  },
});

export default ReceiveNewInvoiceScreen;
