import React from "react";
import { StyleSheet, View } from "react-native";
import { ISupplyRequest } from "../../config/types";
import { FlatList } from "react-native-gesture-handler";
import SupplyRequestCard from "../../components/SupplyRequestCard";
const supplyRequests: ISupplyRequest[] = [
  {
    id: 1,
    title: "پرسلان نگار رافیا استخوانی مات ۶۰×۱۳۰ (کد:۱/۴۴)",
    requestCount: 160,
    grade: "۱",
    status: "بررسی نشده",
    dateCreated: "۱۴۰۳/۹/۲۷",
    dateModified: "۱۴۰۳/۹/۲۷",
  },
  {
    id: 2,
    title: "کاشی دیواری سرامیک البرز طرح پالیزاندو ۳۰×۱۰۰ (کد:۲/۵۸)",
    requestCount: 500,
    grade: "۱",
    status: "عدم تولید",
    dateCreated: "۱۴۰۳/۹/۲۷",
    dateModified: "۱۴۰۳/۹/۲۷",
  },
  {
    id: 3,
    title: "سرامیک کف گرانیتی مرجان طرح لوشان ۶۰×۶۰ (کد:۳/۲۱)",
    requestCount: 88,
    grade: "۱",
    status: "تامین شد",
    dateCreated: "۱۴۰۳/۹/۲۷",
    dateModified: "۱۴۰۳/۹/۲۷",
  },
  {
    id: 4,
    title: "موزاییک طرح سنگ ایرانی ۳۰×۳۰ (کد:۵/۷۷)",
    requestCount: 150,
    grade: "۱",
    status: "تامین شد",
    dateCreated: "۱۴۰۳/۹/۲۷",
    dateModified: "۱۴۰۳/۹/۲۷",
  },
];

const SupplyRequestList = () => {
  return (
    <View style={styles.container}>
      <FlatList
        data={supplyRequests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <SupplyRequestCard suuplyRequest={item} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, padding: 20 },
});

export default SupplyRequestList;
