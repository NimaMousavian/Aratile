import axios from 'axios';
import appConfig from '../../../../config';
// تعریف اینترفیس‌های مورد نیاز
export interface Product {
  id: number;
  title: string;
  code?: string;
  quantity: string;
  price?: number;
  note?: string;
  manualCalculation?: boolean;
  hasColorSpectrum?: boolean;
  measurementUnitName?: string;
  propertyValue?: string;
  rectifiedValue?: string;
  boxCount?: number;
  totalArea?: number;
  selectedVariation?: {
    id: number;
    [key: string]: any;
  };
}

export interface InvoiceItem {
  InvoiceId: number;
  ProductId: number;
  ProductVariationId: number;
  Discount: number;
  Extra: number;
  ProductQuantity: number;
  Description: string;
}

export interface InvoiceData {
  PersonId: number;
  Discount: number;
  Extra: number;
  Description: string;
  InvoiceItemList: InvoiceItem[];
}

export interface InvoiceTotalData {
  subtotal: number;
  discount: number;
  totalWithDiscount: number;
  extra: number;
  finalTotal: number;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * سرویس مدیریت فاکتورها
 */
export default class InvoiceService {
  /**
   * ارسال و ثبت فاکتور جدید
   * @param invoiceData - اطلاعات فاکتور
   */
  static async submitInvoice(invoiceData: {
    personId: number;
    discount: number;
    extra: number;
    description: string;
    items: {
      id: number;
      variationId?: number;
      quantity: string;
      note?: string;
      discount?: number;
      extra?: number;
    }[];
  }): Promise<ApiResponse> {
    try {
      // تبدیل داده‌ها به فرمت مورد نیاز API
      const apiPayload: InvoiceData = {
        PersonId: invoiceData.personId,
        Discount: invoiceData.discount || 0,
        Extra: invoiceData.extra || 0,
        Description: invoiceData.description || "",
        InvoiceItemList: invoiceData.items.map(item => ({
          InvoiceId: 0, // InvoiceId را سرور مشخص می‌کند
          ProductId: item.id,
          ProductVariationId: item.variationId || 0,
          Discount: item.discount || 0,
          Extra: item.extra || 0,
          ProductQuantity: parseFloat(item.quantity) || 0,
          Description: item.note || ""
        }))
      };

      // ارسال درخواست به API
      const response = await axios.post(
        `${appConfig.mobileApi}Invoice/Add`,
        apiPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
            // در صورت نیاز، هدرهای احراز هویت را اینجا اضافه کنید
            // 'Authorization': `Bearer ${token}`
          }
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('خطا در ثبت فاکتور:', error);

      return {
        success: false,
        error: error.response?.data?.message || error.message || 'خطایی در ثبت فاکتور رخ داد'
      };
    }
  }

  /**
   * محاسبه جمع کل فاکتور
   * @param products - محصولات فاکتور
   * @param discount - تخفیف کلی
   * @param extra - هزینه اضافی
   */
  static calculateTotal(
    products: Product[],
    discount: number = 0,
    extra: number = 0
  ): InvoiceTotalData {
    let subtotal = 0;

    products.forEach(product => {
      const price = product.price || 0;
      const quantity = parseFloat(product.quantity) || 0;
      subtotal += price * quantity;
    });

    const totalWithDiscount = subtotal - discount;
    const finalTotal = totalWithDiscount + extra;

    return {
      subtotal,
      discount,
      totalWithDiscount,
      extra,
      finalTotal
    };
  }
}