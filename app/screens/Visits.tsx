import React from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import colors from "../config/colors";
import ProductCard from "../components/ProductCard";
import { toPersianDigits } from "../utils/converters";
import ScreenHeader from "../components/ScreenHeader";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../StackNavigator";

export interface IVisitItem {
  visitId: number;
  visitor: string;
  visitingOfficer: string;
  date: string;
  fromTime: string;
  toTime: string;
  result: string;
}

const visits: IVisitItem[] = [
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
  return (
    <View style={styles.container}>
      <ScreenHeader title="بازدید ها" />
      <ScrollView>
        {visits.map((visit) => (
          <ProductCard
            key={visit.visitId}
            title={toPersianDigits(visit.visitor || "")}
            fields={[
              {
                icon: "person-4",
                iconColor: colors.secondary,
                label: "مسئول بازدید:",
                value: toPersianDigits(visit.visitingOfficer),
              },
              {
                icon: "calendar-month",
                iconColor: colors.secondary,
                label: "تاریخ:",
                value: toPersianDigits(visit.date),
              },
              {
                icon: "timer",
                iconColor: colors.secondary,
                label: "از ساعت:",
                value: toPersianDigits(visit.fromTime),
              },
              {
                icon: "timer",
                iconColor: colors.secondary,
                label: "تا ساعت:",
                value: toPersianDigits(visit.toTime),
              },
            ]}
            note={visit.result ? toPersianDigits(visit.result) : ""}
            noteConfig={{
              show: true,
              icon: "notes",
              iconColor: colors.secondary,
              label: "نتیجه:",
            }}
            qrConfig={{
              show: false,
              icon: "camera", // تغییر آیکون به دوربین/عکس
              iconSize: 36,
              iconColor: colors.secondary,
            }}
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
        ))}
      </ScrollView>
    </View>
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
    borderWidth: 3,
    borderColor: "#e0e0e0",
    marginVertical: 8,
  },
});

export default Visits;
