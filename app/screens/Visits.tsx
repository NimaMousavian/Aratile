import React, { useCallback, useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import colors from "../config/colors";
import ProductCard from "../components/ProductCard";
import { toPersianDigits } from "../utils/converters";
import ScreenHeader from "../components/ScreenHeader";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../StackNavigator";
import axios from "axios";
import appConfig from "../../config";
import { IShowRoomVisitItem } from "../config/types";
import Toast from "../components/Toast";
import AppText from "../components/Text";
import { ActivityIndicator } from "react-native-paper";
import { getFontFamily } from "./IssuedInvoices";
import { Feather } from "@expo/vector-icons";

export interface IVisitItem {
  visitId: number;
  visitor: string;
  visitingOfficer: string;
  date: string;
  fromTime: string;
  toTime: string;
  result: string;
}

const visits_: IVisitItem[] = [
  {
    visitId: 1,
    visitor: "بازدید کننده ۱",
    visitingOfficer: "مسئول بازدید ۱",
    date: "1404/1/28",
    fromTime: "10:00",
    toTime: "12:00",
    result: "نتیجه ی ۱",
  },
  {
    visitId: 2,
    visitor: "بازدید کننده ۲",
    visitingOfficer: "مسئول بازدید ۲",
    date: "1404/1/29",
    fromTime: "09:00",
    toTime: "11:00",
    result: "نتیجه ی ۲",
  },
  {
    visitId: 3,
    visitor: "بازدید کننده ۳",
    visitingOfficer: "مسئول بازدید ۳",
    date: "1404/1/30",
    fromTime: "13:00",
    toTime: "15:00",
    result: "نتیجه ی ۳",
  },
  {
    visitId: 4,
    visitor: "بازدید کننده ۴",
    visitingOfficer: "مسئول بازدید ۴",
    date: "1404/2/1",
    fromTime: "08:00",
    toTime: "10:00",
    result: "نتیجه ی ۴",
  },
  {
    visitId: 5,
    visitor: "بازدید کننده ۵",
    visitingOfficer: "مسئول بازدید ۵",
    date: "1404/2/2",
    fromTime: "11:00",
    toTime: "13:00",
    result: "نتیجه ی ۵",
  },
];

const Visits = () => {
  const navigation = useNavigation<AppNavigationProp>();

  const [visits, setVisits] = useState<IShowRoomVisitItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "warning" | "info"
  >("error");

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "error"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const getShowRoomVisits = async () => {
    setLoading(true);
    try {
      const response = await axios.get<{ Items: IShowRoomVisitItem[] }>(
        `${appConfig.mobileApi}ShowroomVisit/GetAll?page=1&pageSize=1000`
      );

      setVisits(response.data.Items);
    } catch (error) {
      showToast("خطا در دریافت اطلاعات", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getShowRoomVisits();
  }, []);

  // Your function to call when the screen is focused
  const onScreenFocus = useCallback(() => {
    getShowRoomVisits();
  }, []);

  // Use useFocusEffect to run the function when the screen is focused
  useFocusEffect(
    useCallback(() => {
      onScreenFocus();
    }, [onScreenFocus])
  );

  return (
    <>

      <ScreenHeader title="بازدید های شوروم" />
      <View style={styles.container}>
        <Toast
          visible={toastVisible}
          message={toastMessage}
          type={toastType}
          onDismiss={() => setToastVisible(false)}
        />
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <AppText
                style={{ marginTop: 15, fontSize: 20, color: colors.primary }}
              >
                در حال بارگذاری اطلاعات
              </AppText>
            </View>
          ) : visits.length > 0 ? (
            visits?.map((visit) => (
              <ProductCard
                key={visit.ShowroomVisitId}
                title={toPersianDigits(
                  visit.PersonList.map((person) => person.PersonFullName).join(
                    "،  "
                  ) || ""
                )}
                fields={[
                  {
                    icon: "person-4",
                    iconColor: "#228De1",
                    label: "مسئول بازدید:",
                    value: toPersianDigits(visit.ApplicationUserName),
                  },
                  {
                    icon: "calendar-month",
                    iconColor: "#0F9058",
                    label: "تاریخ:",
                    value: toPersianDigits(visit.ShamsiVisitDate),
                  },
                  {
                    icon: "access-time",
                    iconColor:"#F48400",
                    label: "ساعت:",
                    value: visit.StartTime
                      ? ` از ${toPersianDigits(
                        visit.StartTime.slice(0, 5) || ""
                      )} تا ${toPersianDigits(
                        visit.FinishTime.slice(0, 5) || ""
                      )}`
                      : "-",
                  },
                  {
                    icon: "question-mark",
                    iconColor: "#DB4437",
                    label: "نتیجه:",
                    value: toPersianDigits(visit.ShowroomVisitResultTitle || "-"),
                  },
                ]}
                note={visit.Description ? toPersianDigits(visit.Description) : ""}
                noteConfig={{
                  show: visit.Description !== null,
                  icon: "notes",
                  iconColor: colors.secondary,
                  label: "توضیحات:",
                }}
                qrConfig={{
                  show: false,
                  icon: "camera", // تغییر آیکون به دوربین/عکس
                  iconSize: 36,
                  iconColor: colors.secondary,
                }}
                titleStyle={{ fontSize: 20 }}
                //   editIcon={{
                //     name: "edit",
                //     size: 22,
                //     color: colors.warning,
                //     onPress: () => handleEditProduct(product.id),
                //     containerStyle: styles.iconCircleSmall, // اضافه کردن استایل دایره
                //   }}
                //   deleteIcon={{
                //     name: "delete",
                //     size: 22,
                //     color: colors.danger,
                //     onPress: () => {
                //       showRemoveConfirmation(product.id, () => {
                //         showToast("محصول با موفقیت حذف شد", "info");
                //       });
                //     },
                //     containerStyle: styles.iconCircleSmall, // اضافه کردن استایل دایره
                //   }}
                containerStyle={
                  Platform.OS === "android" ? styles.androidCardAdjustment : {}
                }
                //   onLongPress={() => {
                //     showRemoveConfirmation(product.id, () => {
                //       showToast("محصول با موفقیت حذف شد", "info");
                //     });
                //   }}
                onPress={() =>
                  navigation.navigate("VisitDetail", { visitItem: visit })
                }
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Feather name="clipboard" size={64} color="#9CA3AF" />
              <AppText style={styles.emptyText}>موردی یافت نشد</AppText>
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 0,
    paddingTop: 5,
    backgroundColor: colors.background,
    display: "flex",
    flexDirection: "column",
  },
  androidCardAdjustment: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginVertical: 4,
    // borderRadius: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontFamily: getFontFamily("Yekan_Bakh_Regular", "normal"),
    fontSize: 16,
    color: "#6B7280",
    marginTop: 12,
    textAlign: "center",
  },
});

export default Visits;
