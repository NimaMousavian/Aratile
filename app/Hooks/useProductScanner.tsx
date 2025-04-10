import { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { AppNavigationProp } from "../StackNavigator";
import { IProduct } from "../../app/config/types";
import axios from "axios";

// آدرس API برنامه
import appConfig from "../../config";
const API_BASE_URL = appConfig.mobileApi;

// تعریف نوع برای params مسیر
type RouteParams = {
  scannedCode?: string;
};

// این هوک سفارشی برای مدیریت محصولات در صفحه صدور فاکتور استفاده می‌شود
const useProductScanner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<IProduct[]>([]);
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const navigation = useNavigation<AppNavigationProp>();

  // Handle data from QR scanner
  useEffect(() => {
    if (route.params?.scannedCode) {
      fetchProductByCode(route.params.scannedCode);
    }
  }, [route.params?.scannedCode]);

  // Function to fetch product by SKU code from API
  const fetchProductByCode = async (sku: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}Product/SearchBySKUOrName?query=${sku}&page=1&pageSize=20`
      );

      if (response.data && response.data.Items && response.data.Items.length > 0) {
        const productData = response.data.Items[0];

        // Convert API product to IProduct format
        const newProduct: IProduct = {
          id: productData.ProductId,
          title: productData.ProductName,
          code: productData.SKU,
          quantity: "1", // Default quantity as string
          hasColorSpectrum: false, // Default value
          note: "", // Default empty note
        };

        // Check if the product is already in the list
        const productExists = selectedProducts.some(p => p.code === newProduct.code);

        if (productExists) {
          Alert.alert(
            "محصول تکراری",
            "این محصول قبلاً به فاکتور اضافه شده است.",
            [{ text: "متوجه شدم" }]
          );
        } else {
          // Add the new product to selected products
          setSelectedProducts([...selectedProducts, newProduct]);
        }
      } else {
        Alert.alert(
          "محصول یافت نشد",
          "محصولی با این کد یافت نشد.",
          [{ text: "متوجه شدم" }]
        );
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      Alert.alert(
        "خطا",
        "خطا در دریافت اطلاعات محصول. لطفاً دوباره تلاش کنید.",
        [{ text: "متوجه شدم" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle manual product search
  const handleProductSearch = async (query: string) => {
    if (!query.trim()) return [];

    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}Product/SearchBySKUOrName?query=${query}&page=1&pageSize=20`
      );

      return response.data.Items;
    } catch (error) {
      console.error("Error searching products:", error);
      Alert.alert(
        "خطا",
        "خطا در جستجوی محصولات. لطفاً دوباره تلاش کنید.",
        [{ text: "متوجه شدم" }]
      );
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Function to remove product from selected products
  const removeProduct = (productId: number) => {
    setSelectedProducts(selectedProducts.filter(product => product.id !== productId));
  };

  // Function to add product from search
  const addProduct = (product: IProduct) => {
    // Check if the product is already in the list
    const productExists = selectedProducts.some(p => p.code === product.code);

    if (productExists) {
      Alert.alert(
        "محصول تکراری",
        "این محصول قبلاً به فاکتور اضافه شده است.",
        [{ text: "متوجه شدم" }]
      );
      return false;
    } else {
      setSelectedProducts([...selectedProducts, product]);
      return true;
    }
  };

  // تبدیل داده‌های دریافتی از API به فرمت IProduct
  const convertApiDataToProduct = (apiProduct: any): IProduct => {
    return {
      id: apiProduct.ProductId,
      title: apiProduct.ProductName,
      code: apiProduct.SKU,
      quantity: "1", // مقدار پیش‌فرض
      hasColorSpectrum: false, // مقدار پیش‌فرض
      note: "", // پیش‌فرض خالی
    };
  };

  return {
    isLoading,
    selectedProducts,
    fetchProductByCode,
    handleProductSearch,
    removeProduct,
    addProduct,
    setSelectedProducts,
    convertApiDataToProduct
  };
};

export default useProductScanner;