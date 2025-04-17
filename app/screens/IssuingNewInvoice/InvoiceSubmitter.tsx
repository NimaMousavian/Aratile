import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import InvoiceService, { Product } from './api/InvoiceService';
import colors from '../../config/colors';
import { toPersianDigits } from '../../utils/numberConversions';

interface Colleague {
  id: string;
  name: string;
}

interface ModalConfig {
  title: string;
  message: string;
  icon: string;
  isError: boolean;
}

interface InvoiceSubmitterProps {
  selectedProducts: Product[];
  selectedColleague: Colleague | null;
  invoiceNote: string;
  discount?: number;
  extra?: number;
  onSuccess?: () => void;
  onError?: (message: string, type: "success" | "error" | "warning" | "info") => void;
}

/**
 * کامپوننت مسئول ارسال و ثبت نهایی فاکتور
 */
const InvoiceSubmitter: React.FC<InvoiceSubmitterProps> = ({
  selectedProducts,
  selectedColleague,
  invoiceNote,
  discount = 0,
  extra = 0,
  onSuccess,
  onError
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    title: '',
    message: '',
    icon: '',
    isError: false
  });

  /**
   * نمایش مودال برای نمایش وضعیت ارسال فاکتور
   */
  const showModal = (title: string, message: string, icon: string, isError: boolean = false): void => {
    setModalConfig({
      title,
      message,
      icon,
      isError
    });
    setModalVisible(true);
  };

  /**
   * بستن مودال
   */
  const closeModal = (): void => {
    setModalVisible(false);

    // در صورت موفقیت، کالبک موفقیت را صدا بزنیم
    if (!modalConfig.isError && onSuccess) {
      onSuccess();
    }
  };

  /**
   * ارسال فاکتور به سرور
   */
  const submitInvoice = async (): Promise<void> => {
    // بررسی اعتبارسنجی اولیه
    if (!selectedColleague) {
      if (onError) {
        onError("لطفاً ابتدا مشتری را انتخاب کنید", "warning");
      }
      return;
    }

    if (selectedProducts.length === 0) {
      if (onError) {
        onError("لطفاً حداقل یک محصول به فاکتور اضافه کنید", "warning");
      }
      return;
    }

    // شروع فرآیند ارسال
    setIsSubmitting(true);

    try {
      // آماده‌سازی داده‌های فاکتور
      const invoiceData = {
        personId: parseInt(selectedColleague.id),
        discount: discount,
        extra: extra,
        description: invoiceNote,
        items: selectedProducts.map(product => ({
          id: product.id,
          variationId: product.hasColorSpectrum ? product.selectedVariation?.id : 0,
          quantity: product.quantity,
          note: product.note,
          discount: 0, // اگر تخفیف جداگانه برای هر محصول دارید، اینجا وارد کنید
          extra: 0 // اگر هزینه اضافه برای هر محصول دارید، اینجا وارد کنید
        }))
      };

      // ارسال فاکتور به سرور
      const result = await InvoiceService.submitInvoice(invoiceData);

      setIsSubmitting(false);

      if (result.success) {
        // نمایش پیام موفقیت
        showModal(
          "موفقیت",
          "فاکتور با موفقیت ثبت شد.",
          "check-circle"
        );
      } else {
        // نمایش پیام خطا
        showModal(
          "خطا",
          `خطا در ثبت فاکتور: ${result.error}`,
          "error",
          true
        );

        if (onError) {
          onError(`خطا در ثبت فاکتور: ${result.error}`, "error");
        }
      }
    } catch (error) {
      setIsSubmitting(false);

      // نمایش پیام خطا
      showModal(
        "خطا",
        "خطایی در فرآیند ثبت فاکتور رخ داد. لطفاً دوباره تلاش کنید.",
        "error",
        true
      );

      if (onError) {
        onError("خطایی در فرآیند ثبت فاکتور رخ داد", "error");
      }

      console.error("خطا در ارسال فاکتور:", error);
    }
  };

  /**
   * محاسبه جمع کل مبلغ فاکتور
   */
  const calculateTotal = () => {
    return InvoiceService.calculateTotal(selectedProducts, discount, extra);
  };

  const { finalTotal } = calculateTotal();

  return (
    <View style={styles.container}>
      {/* دکمه ثبت فاکتور */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={submitInvoice}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <MaterialIcons name="done" size={28} color="#FFFFFF" />
            <Text style={styles.submitButtonText}>ثبت فاکتور</Text>
          </>
        )}
      </TouchableOpacity>

      {/* مودال نمایش وضعیت */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[
              styles.iconCircle,
              modalConfig.isError ? styles.iconError : styles.iconSuccess
            ]}>
              <MaterialIcons
                name={modalConfig.icon || (modalConfig.isError ? "error" : "check-circle")}
                size={40}
                color="#FFFFFF"
              />
            </View>

            <Text style={styles.modalTitle}>{toPersianDigits(modalConfig.title)}</Text>
            <Text style={styles.modalMessage}>{toPersianDigits(modalConfig.message)}</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={closeModal}
            >
              <Text style={styles.modalButtonText}>تایید</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: '100%'
  },
  submitButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    padding: 10,
    height: 56,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    marginRight: 8,
    marginTop: 5,
    fontFamily: 'Yekan_Bakh_Bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconSuccess: {
    backgroundColor: colors.success,
  },
  iconError: {
    backgroundColor: colors.danger,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Yekan_Bakh_Bold',
    color: colors.dark,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: 'Yekan_Bakh_Regular',
    color: colors.medium,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalButtonText: {
    color: colors.white,
    fontFamily: 'Yekan_Bakh_Bold',
    fontSize: 16,
  },
});

export default InvoiceSubmitter;