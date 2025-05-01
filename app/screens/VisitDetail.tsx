import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import ScreenHeader from "../components/ScreenHeader";
import colors from "../config/colors";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import AppText from "../components/Text";
import ColleagueBottomSheet, {
  Colleague,
} from "./IssuingNewInvoice/ColleagueSearchModal";
import { AppNavigationProp } from "../StackNavigator";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { toPersianDigits } from "../utils/converters";
import Toast from "../components/Toast";
import { IVisitItem } from "./Visits";
import AppTextInput from "../components/TextInput";
import SelectionBottomSheet from "../components/SelectionDialog";
import { TimePickerField } from "../components/PersianTimePicker";
import AppButton from "../components/Button";
import { InputContainer } from "./FieldMarketer/B2BFieldMarketer/AddNewShop";
import IconButton from "../components/IconButton";
import { IShowRoomVisitItem, IVisitResult } from "../config/types";
import axios from "axios";
import appConfig from "../../config";

type VisitDetailRouteParams = {
  VisitDetail: {
    visitItem: IShowRoomVisitItem;
  };
};

const VisitDetail = () => {
  const route = useRoute<RouteProp<VisitDetailRouteParams, "VisitDetail">>();
  const visitItem = route.params?.visitItem;
  console.log(visitItem);

  const navigation = useNavigation<AppNavigationProp>();

  const [fromTime, setFromTime] = useState(visitItem.StartTime || "");
  const [toTime, setToTime] = useState(visitItem.FinishTime || "");
  const [resultString, setResultString] = useState<string>(
    visitItem.ShowroomVisitResultTitle || ""
  );
  const [description, setDescription] = useState<string>("");

  const [selectedColleague, setSelectedColleague] = useState<Colleague | null>({
    id: visitItem.ShowroomVisitId.toString(),
    name: visitItem.PersonList[0].PersonFullName,
    phone: "",
  });
  const [showColleagueSheet, setShowColleagueSheet] = useState<boolean>(false);
  const [showRoomVisitResults, setShowRoomVisitResult] = useState<
    IVisitResult[]
  >([]);
  const [visitResultsLoading, setVisitResultLoading] = useState<boolean>(false);

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
  const validateForm = () => {
    if (fromTime === "") {
      showToast("ساعت شروع انتخاب نشده است", "error");
      return false;
    }
    if (toTime === "") {
      showToast("ساعت پایان انتخاب نشده است", "error");
      return false;
    }
    return true;
  };
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    } else {
      try {
        const objToEdit = {
          ShowroomVisitId: visitItem.ShowroomVisitId,
          ShowroomVisitResultId:
            showRoomVisitResults.find(
              (visitResult) => visitResult.Title === resultString
            )?.ShowroomVisitResultId || 0,
          Description: description,
          VisitDate: visitItem.VisitDate,
          StartTime: fromTime,
          FinishTime: toTime,
          PersonIdList: visitItem.PersonList.map((person) => person.PersonId),
        };

        console.log(objToEdit);

        const response = await axios.put(
          `${appConfig.mobileApi}ShowroomVisit/Edit`,
          objToEdit
        );

        if (response.status === 200) {
          showToast("بازدید با موفقیت ثبت شد", "success");
        }
      } catch (error) {
        showToast("خطا در ثبت بازدید");
      }
    }
  };

  const getVisitResults = async () => {
    setVisitResultLoading(true);
    try {
      const response = await axios.get<{ Items: IVisitResult[] }>(
        `${appConfig.mobileApi}ShowroomVisitResult/GetAllActive?page=1&pageSize=1000`
      );
      setShowRoomVisitResult(response.data.Items);
    } catch (error) {
      console.log(error);
    } finally {
      setVisitResultLoading(false);
    }
  };

  useEffect(() => {
    getVisitResults();
  }, []);

  return (
    <View style={styles.container}>
      <ScreenHeader title="جزئیات بازدید" />

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />
      <View style={styles.customerContainer}>
        <LinearGradient
          colors={[colors.secondary, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.customerGradient}
        >
          <View style={styles.customerRow}>
            <View style={styles.customerField}>
              <MaterialIcons
                name="person"
                size={24}
                color="white"
                style={styles.customerIcon}
              />
              <AppText style={styles.customerLabel}>بازدید کننده</AppText>
            </View>
            <View style={styles.customerButtonsContainer}>
              {selectedColleague && (
                <TouchableOpacity
                  style={[
                    styles.iconCircleSmall,
                    { backgroundColor: "#fef2e0" },
                  ]}
                  onPress={() =>
                    navigation.navigate("CustomerInfo", {
                      customer: selectedColleague,
                      mode: "visitor",
                    })
                  }
                >
                  <MaterialIcons name="edit" size={22} color={colors.warning} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.selectedCustomerContainer}>
          {selectedColleague ? (
            <AppText style={styles.selectedCustomerName}>
              {visitItem.PersonList.map((person) => person.PersonFullName).join(
                "، "
              )}
            </AppText>
          ) : (
            <AppText style={styles.noCustomerText}>
              مشتری انتخاب نشده است.
            </AppText>
          )}
        </View>
      </View>
      <InputContainer title="شرح بازدید">
        <AppTextInput
          autoCorrect={false}
          placeholder="توضیحات"
          keyboardType="default"
          icon="notes"
          multiline
          numberOfLines={10}
          height={200}
          onChangeText={setDescription}
          value={description}
        />
        <View></View>
      </InputContainer>

      <InputContainer title={"اطلاعات بازدید"}>
        <View
          style={{
            flexDirection: "row-reverse",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <TimePickerField
            label="ساعت شروع"
            time={fromTime}
            onTimeChange={setFromTime}
            customStyles={{ infoItem: { width: "48%" } }}
          />
          <TimePickerField
            label="ساعت پایان"
            time={toTime}
            onTimeChange={setToTime}
            customStyles={{ infoItem: { width: "48%" } }}
          />
        </View>
        <SelectionBottomSheet
          placeholderText={resultString === "" ? "نتیجه" : resultString}
          title="نتیجه"
          iconName="question-mark"
          options={showRoomVisitResults.map((visitResult) => visitResult.Title)}
          onSelect={(value) => setResultString(value[0])}
          loading={visitResultsLoading}
          initialValues={[visitItem.ShowroomVisitResultTitle]}
        />
      </InputContainer>

      <ColleagueBottomSheet
        title="انتخاب مشتری"
        visible={showColleagueSheet}
        onClose={() => setShowColleagueSheet(false)}
        onSelectColleague={(colleague) => {
          setSelectedColleague(colleague);
          setShowColleagueSheet(false);
          showToast(`مشتری ${colleague.name} انتخاب شد`, "success");
        }}
      />
      <IconButton
        text="ثبت"
        onPress={handleSubmit}
        iconName="done"
        iconSize={28}
        backgroundColor={colors.success}
        style={styles.submitButton}
      />
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
  customerContainer: {
    flexDirection: "column",
    marginBottom: 15,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    borderWidth: 2,
    borderColor: colors.gray,
  },
  customerGradient: {
    padding: 12,
  },
  customerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerField: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  customerLabel: {
    fontSize: 16,
    marginRight: 4,
    fontFamily: "Yekan_Bakh_Bold",
    color: "white",
  },
  customerIcon: {},
  customerButtonsContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  iconCircleSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "white",
  },
  selectedCustomerContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
    backgroundColor: colors.light,
  },
  selectedCustomerName: {
    fontSize: 16,
    color: colors.dark,
    fontFamily: "Yekan_Bakh_Bold",
    textAlign: "center",
  },
  noCustomerText: {
    fontSize: 14,
    color: colors.medium,
    fontFamily: "Yekan_Bakh_Bold",
    textAlign: "center",
  },
  mainContent: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray,
    padding: 10,
  },
  submitButton: {
    position: "absolute",
    bottom: 10,
    right: 0,
    left: 0,
    marginHorizontal: 15,
  },
});

export default VisitDetail;
