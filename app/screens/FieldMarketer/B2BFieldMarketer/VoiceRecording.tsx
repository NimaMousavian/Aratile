import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Audio } from "expo-av";
import { FontAwesome5 } from "@expo/vector-icons";
import AppText from "../../../components/Text";
import colors from "../../../config/colors";
import { LinearGradient } from "expo-linear-gradient";
import IconButton from "../../../components/NewIconButton";
import { useNavigation } from "@react-navigation/native";
import { AppNavigationProp } from "../../../StackNavigator";
import { toPersianDigits } from "../../../utils/converters";

const VoiceRecordingScreen = () => {
  const navigation = useNavigation<AppNavigationProp>();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordings, setRecordings] = useState<
    { uri: string; duration: number }[]
  >([]);

  useEffect(() => {
    // Request permissions
    Audio.requestPermissionsAsync();
    Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Timer for recording duration
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert("دسترسی", "لطفا دسترسی میکروفون را فعال کنید");
        return;
      }

      // Prepare recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("خطا", "خطا در شروع ضبط صدا");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        setRecordings([...recordings, { uri, duration: recordingDuration }]);
      }

      setRecording(null);
      setIsRecording(false);
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("خطا", "خطا در توقف ضبط صدا");
    }
  };

  const saveRecordings = () => {
    // Here you would implement logic to save the recordings to your backend
    // For now, we'll just navigate back with the recordings data
    // navigation.navigate("AddNewShop", { recordings });
    Alert.alert("موفق", "صدای ضبط شده با موفقیت ذخیره شد");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${toPersianDigits(
      mins.toString().padStart(2, "0")
    )}:${toPersianDigits(secs.toString().padStart(2, "0"))}`;
  };

  return (
    <View style={styles.container}>
      {/* <LinearGradient
        colors={[colors.secondary, colors.primary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <AppText style={styles.headerText}>ضبط صدا</AppText>
      </LinearGradient> */}

      <View style={styles.recordingContainer}>
        <AppText style={styles.timerText}>
          {formatTime(recordingDuration)}
        </AppText>

        <TouchableOpacity
          style={styles.recordButton}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <LinearGradient
            colors={
              isRecording
                ? ["#ff6b6b", "#ee5253"]
                : [colors.secondary, colors.primary]
            }
            style={styles.recordButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <FontAwesome5
              name={isRecording ? "stop" : "microphone"}
              size={32}
              color="white"
            />
          </LinearGradient>
        </TouchableOpacity>

        <AppText style={styles.instructionText}>
          {isRecording ? "در حال ضبط..." : "برای شروع ضبط صدا کلیک کنید"}
        </AppText>
      </View>

      {recordings.length > 0 && (
        <View style={styles.recordingsContainer}>
          <AppText style={styles.recordingsTitle}>صداهای ضبط شده</AppText>

          {recordings.map((item, index) => (
            <View key={index} style={styles.recordingItem}>
              <FontAwesome5
                name="file-audio"
                size={20}
                color={colors.primary}
              />
              <AppText style={styles.recordingText}>
                ضبط {index + 1} - {formatTime(item.duration)}
              </AppText>
            </View>
          ))}
        </View>
      )}

      <View style={styles.buttonsContainer}>
        <IconButton
          text="ذخیره"
          iconName="save"
          backgroundColor={colors.success}
          onPress={saveRecordings}
          disabled={recordings.length === 0}
          style={recordings.length === 0 ? styles.disabledButton : {}}
        />

        <IconButton
          text="انصراف"
          iconName="close"
          backgroundColor={colors.danger}
          onPress={() => navigation.goBack()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 24,
    color: colors.white,
  },
  recordingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  recordButton: {
    marginVertical: 30,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  recordButtonGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  timerText: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 48,
    color: colors.dark,
    marginBottom: 20,
  },
  instructionText: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 18,
    color: colors.medium,
    textAlign: "center",
  },
  recordingsContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 15,
    margin: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  recordingsTitle: {
    fontFamily: "Yekan_Bakh_Bold",
    fontSize: 18,
    color: colors.dark,
    marginBottom: 10,
  },
  recordingItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  recordingText: {
    fontFamily: "Yekan_Bakh_Regular",
    fontSize: 16,
    color: colors.dark,
    marginRight: 10,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default VoiceRecordingScreen;
