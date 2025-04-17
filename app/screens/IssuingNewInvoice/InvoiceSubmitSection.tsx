import React, { useState } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

// کامپوننت‌های مورد نیاز
import InvoiceSubmitter from './InvoiceSubmitter';
import InvoiceTotalCalculator from './InvoiceTotalCalculator';
import Toast from '../../components/Toast';
import { Product } from '../../screens/IssuingNewInvoice/api/InvoiceService';

// استایل‌ها و کانفیگ‌ها
import colors from '../../config/colors';

interface Colleague {
  id: string;
  name: string;
}

interface AppNavigationProp {
  navigate: (screen: string, params?: any) => void;
  setParams: (params: any) => void;
}

interface InvoiceSubmitSectionProps {
  selectedProducts: Product[];
  selectedColleague: Colleague | null;
  invoiceNote: string;
}

/**
 * کامپوننت نمونه برای نشان دادن نحوه استفاده از InvoiceSubmitter در صفحه اصلی فاکتور
 */
const InvoiceSubmitSection: React.FC<InvoiceSubmitSectionProps> = ({
  selectedProducts,
  selectedColleague,
  invoiceNote
}) => {
  const navigation = useNavigation<AppNavigationProp>();

  // وضعیت نمایش پیام‌های خطا و موفقیت
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<"success" | "error" | "warning" | "info">('error');

  // مقادیر تخفیف و هزینه‌های اضافی کل فاکتور
  const [discount, setDiscount] = useState<number>(0);
  const [extra, setExtra] = useState<number>(0);

  /**
   * نمایش پیام به کاربر
   */
  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = 'error'
  ): void => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  /**
   * تابع بازخوانی پس از ثبت موفق فاکتور
   */
  const handleSubmitSuccess = (): void => {
    // پاک کردن اطلاعات فاکتور از وضعیت
    // و بازگشت به صفحه لیست فاکتورها
    setTimeout(() => {
      navigation.navigate('IssuedInvoices', {
        refresh: true
      });
    }, 1000);
  };

  /**
   * دریافت تغییرات از کامپوننت محاسبه مجموع
   */
  const handleTotalChange = (totalData: { discount?: number; extra?: number }): void => {
    if (totalData.discount !== undefined) {
      setDiscount(totalData.discount);
    }

    if (totalData.extra !== undefined) {
      setExtra(totalData.extra);
    }
  };

  return (
    <View style={styles.container}>
      {/* نمایش Toast برای پیام‌های خطا و موفقیت */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onDismiss={() => setToastVisible(false)}
      />

      {/* کامپوننت محاسبه مجموع فاکتور */}
      {selectedProducts.length > 0 && (
        <View style={styles.invoiceTotalContainer}>
          <InvoiceTotalCalculator
            products={selectedProducts}
            onTotalChange={handleTotalChange}
          />
        </View>
      )}

      {/* کامپوننت ثبت فاکتور */}
      <View style={styles.submitContainer}>
        <InvoiceSubmitter
          selectedProducts={selectedProducts}
          selectedColleague={selectedColleague}
          invoiceNote={invoiceNote}
          discount={discount}
          extra={extra}
          onSuccess={handleSubmitSuccess}
          onError={showToast}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  invoiceTotalContainer: {
    marginBottom: 15,
    paddingHorizontal: 2,
  },
  submitContainer: {
    marginTop: 5,
  },
});

export default InvoiceSubmitSection;