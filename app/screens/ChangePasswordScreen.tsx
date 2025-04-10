import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ScreenHeader from "../components/ScreenHeader";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AppText from "../components/Text";
import AppButton from "../components/Button";
import AppTextInput from "../components/TextInput";
import colors from "../config/colors";

const ChangePasswordScreen = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!currentPassword) {
      newErrors.currentPassword = "لطفا رمز عبور فعلی را وارد کنید";
      isValid = false;
    }

    if (!newPassword) {
      newErrors.newPassword = "لطفا رمز عبور جدید را وارد کنید";
      isValid = false;
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "رمز عبور باید حداقل 8 کاراکتر باشد";
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "لطفا تکرار رمز عبور جدید را وارد کنید";
      isValid = false;
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword =
        "تکرار رمز عبور با رمز عبور جدید مطابقت ندارد";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChangePassword = () => {
    if (validateForm()) {
      // Here you would implement the API call to change the password
      Alert.alert("موفقیت", "رمز عبور شما با موفقیت تغییر یافت", [
        { text: "تایید" },
      ]);

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const getPasswordIcon = (isVisible: boolean): string => {
    return isVisible ? "visibility-off" : "visibility";
  };

  const PasswordInput = ({
    value,
    onChangeText,
    label,
    secure,
    toggleSecure,
    error,
  }: {
    value: string;
    onChangeText: (text: string) => void;
    label: string;
    secure: boolean;
    toggleSecure: () => void;
    error?: string;
  }) => {
    return (
      <View style={styles.passwordInputContainer}>
        <AppTextInput
          label={label}
          value={value}
          onChangeInput={(id: string, val: string) => onChangeText(val)}
          inputId="password"
          secureTextEntry={secure}
          containerStyle={[
            styles.passInputContainer,
            error ? styles.inputError : null,
          ]}
          inputContainerStyle={[error ? { borderColor: colors.danger } : null]}
        />
        <TouchableOpacity
          style={styles.eyeIconContainer}
          onPress={toggleSecure}
        >
          <MaterialIcons
            name={secure ? "visibility" : "visibility-off"}
            size={24}
            color={colors.medium}
          />
        </TouchableOpacity>
        {error ? <AppText style={styles.errorText}>{error}</AppText> : null}
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={[colors.secondary, colors.primary]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScreenHeader title="تغییر رمز عبور" isProfilePage={true} />

      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="lock" size={40} color={colors.primary} />
            </View>

            <AppText style={styles.headerText}>تغییر رمز عبور</AppText>
            <AppText style={styles.subHeaderText}>
              لطفا رمز عبور فعلی و رمز عبور جدید خود را وارد کنید
            </AppText>

            <View style={styles.formContainer}>
              <PasswordInput
                label="رمز عبور فعلی"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secure={!showCurrentPassword}
                toggleSecure={() =>
                  setShowCurrentPassword(!showCurrentPassword)
                }
                error={errors.currentPassword}
              />

              <PasswordInput
                label="رمز عبور جدید"
                value={newPassword}
                onChangeText={setNewPassword}
                secure={!showNewPassword}
                toggleSecure={() => setShowNewPassword(!showNewPassword)}
                error={errors.newPassword}
              />

              <PasswordInput
                label="تکرار رمز عبور جدید"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secure={!showConfirmPassword}
                toggleSecure={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                error={errors.confirmPassword}
              />
            </View>

            <View style={styles.passwordTips}>
              <AppText style={styles.tipsTitle}>نکات امنیتی:</AppText>
              <View style={styles.tipRow}>
                <MaterialIcons
                  name="check-circle"
                  size={16}
                  color={colors.success}
                />
                <AppText style={styles.tipText}>
                  حداقل 8 کاراکتر استفاده کنید
                </AppText>
              </View>
              <View style={styles.tipRow}>
                <MaterialIcons
                  name="check-circle"
                  size={16}
                  color={colors.success}
                />
                <AppText style={styles.tipText}>
                  ترکیبی از حروف، اعداد و علائم استفاده کنید
                </AppText>
              </View>
              <View style={styles.tipRow}>
                <MaterialIcons
                  name="check-circle"
                  size={16}
                  color={colors.success}
                />
                <AppText style={styles.tipText}>
                  از اطلاعات شخصی مانند نام یا تاریخ تولد استفاده نکنید
                </AppText>
              </View>
            </View>

            <AppButton
              title="ثبت تغییرات"
              onPress={handleChangePassword}
              style={styles.submitButton}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  gradient: {
    position: "absolute",
    height: "25%",
    width: "100%",
    top: 0,
    zIndex: 0,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 1,
    alignItems: "center",
  },
  formContainer: {
    width: "100%",
    marginBottom: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 24,
    color: colors.dark,
    marginBottom: 10,
  },
  subHeaderText: {
    fontSize: 16,
    color: colors.medium,
    textAlign: "center",
    marginBottom: 30,
  },
  passwordInputContainer: {
    position: "relative",
    width: "100%",
    marginBottom: 20,
  },
  passInputContainer: {
    marginBottom: 5,
  },
  eyeIconContainer: {
    position: "absolute",
    top: 38,
    left: 10,
    padding: 5,
  },
  inputError: {
    marginBottom: 25,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: 5,
    textAlign: "right",
  },
  passwordTips: {
    width: "100%",
    backgroundColor: `${colors.primary}08`,
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    marginBottom: 25,
  },
  tipsTitle: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 16,
    color: colors.dark,
    marginBottom: 10,
    textAlign: "right",
  },
  tipRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: colors.medium,
    marginRight: 8,
    textAlign: "right",
  },
  submitButton: {
    width: "100%",
    height: 54,
    borderRadius: 12,
  },
});

export default ChangePasswordScreen;
