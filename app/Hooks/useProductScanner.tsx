import { useState, useEffect } from "react";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { AppNavigationProp } from "../StackNavigator";
import { Product } from "../screens/IssuingNewInvoice/IssuingNewInvoice";
import axios from "axios";
import ReusableModal from "../components/Modal";
import colors from "../config/colors";

import appConfig from "../../config";
const API_BASE_URL = appConfig.mobileApi;

type RouteParams = {
  scannedProduct?: Product;
};

const useProductScanner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
  const navigation = useNavigation<AppNavigationProp>();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    icon: "info" as React.ComponentProps<typeof ReusableModal>["headerConfig"]["icon"],
  });
  const [modalButtons, setModalButtons] = useState<React.ComponentProps<typeof ReusableModal>["buttons"]>([
    {
      id: "ok",
      text: "متوجه شدم",
      color: colors.success,
      icon: "check",
      onPress: () => setModalVisible(false)
    }
  ]);

  useEffect(() => {
    if (route.params?.scannedCode) {
      fetchProductByCode(route.params.scannedCode);
    }
  }, [route.params?.scannedCode]);

  const showModal = (title: string, message: string, icon: React.ComponentProps<typeof ReusableModal>["headerConfig"]["icon"] = "info") => {
    setModalConfig({
      title,
      message,
      icon,
    });
    setModalVisible(true);
  };

  const fetchProductByCode = async (sku: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}Product/GetBySKU?sku=${sku}`);

      if (response.data && response.data.ProductId) {
        const detailResponse = await axios.get(`${API_BASE_URL}Product/Get?id=${response.data.ProductId}`);

        let rectifiedValue = "1.44";
        let inventory = null;

        if (detailResponse.data && detailResponse.data.Product_ProductPropertyValue_List &&
          detailResponse.data.Product_ProductPropertyValue_List.length > 0) {

          const rectifiedProperty = detailResponse.data.Product_ProductPropertyValue_List.find(
            (prop: any) => prop.ProductPropertyName === "رکتیفای"
          );

          if (rectifiedProperty) {
            rectifiedValue = rectifiedProperty.Value;
          }
        }

        if (detailResponse.data && detailResponse.data.Inventory !== undefined) {
          inventory = detailResponse.data.Inventory.toString();
        }

        const newProduct: Product = {
          id: response.data.ProductId,
          title: response.data.ProductName,
          code: response.data.SKU,
          quantity: "1",
          price: response.data.Price !== null ? response.data.Price : 0,
          hasColorSpectrum: false,
          note: "",
          measurementUnitName: response.data.ProductMeasurementUnitName ||
            (detailResponse.data?.MeasurementUnit?.MeasurementUnitName || ""),
          propertyValue: inventory,
          rectifiedValue: rectifiedValue
        };

        if (isEditMode && editingProductId) {
          const duplicateProduct = selectedProducts.find(p =>
            p.code === newProduct.code && p.id !== editingProductId
          );

          if (duplicateProduct) {
            showModal(
              "محصول تکراری",
              "این محصول قبلاً به فاکتور اضافه شده است.",
              "error"
            );
            return;
          }

          setSelectedProducts(
            selectedProducts.map(p => p.id === editingProductId ? newProduct : p)
          );
          setIsEditMode(false);
          setEditingProductId(null);

          showModal(
            "به‌روزرسانی موفق",
            "محصول با موفقیت به‌روزرسانی شد.",
            "check"
          );
        } else {
          const productExists = selectedProducts.some(
            (p) => p.code === newProduct.code
          );

          if (productExists) {
            showModal(
              "محصول تکراری",
              "این محصول قبلاً به فاکتور اضافه شده است.",
              "error"
            );
          } else {
            // Keep existing products and add the new one
            setSelectedProducts(prevProducts => [...prevProducts, newProduct]);
          }
        }
      } else {
        showModal(
          "محصول یافت نشد",
          "محصولی با این کد یافت نشد.",
          "search-off"
        );
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      showModal(
        "خطا",
        "خطا در دریافت اطلاعات محصول. لطفاً دوباره تلاش کنید.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const searchProduct = async (query: string) => {
    if (!query.trim()) return [];

    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}Product/SearchBySKUOrName?query=${query}&page=1&pageSize=20`
      );

      return response.data?.Items || [];
    } catch (error) {
      console.error("Error searching products:", error);
      showModal(
        "خطا",
        "خطا در جستجوی محصولات. لطفاً دوباره تلاش کنید.",
        "error"
      );
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const removeProduct = (productId: number) => {
    setSelectedProducts(
      selectedProducts.filter((product) => product.id !== productId)
    );
  };

  const showRemoveConfirmation = (productId: number, callback?: () => void) => {
    setModalConfig({
      title: "حذف محصول",
      message: "آیا از حذف این محصول اطمینان دارید؟",
      icon: "delete",
    });

    setModalButtons([
      {
        id: "cancel",
        text: "خیر",
        color: colors.danger,
        icon: "close",
        onPress: () => setModalVisible(false)
      },
      {
        id: "confirm",
        text: "بله",
        color: colors.success,
        icon: "delete",
        onPress: () => {
          removeProduct(productId);
          setModalVisible(false);
          if (callback) callback();
        }
      }
    ]);

    setModalVisible(true);
  };

  const editProduct = (productId: number) => {
    setIsEditMode(true);
    setEditingProductId(productId);
  };

  const addProduct = (product: Product) => {
    console.log("تلاش برای افزودن محصول جدید:", product.title);
    console.log("تعداد محصولات قبل از افزودن:", selectedProducts.length);

    if (isEditMode && editingProductId) {
      const duplicateProduct = selectedProducts.find(p =>
        p.code === product.code && p.id !== editingProductId
      );

      if (duplicateProduct) {
        showModal(
          "محصول تکراری",
          "این محصول قبلاً به فاکتور اضافه شده است.",
          "error"
        );
        return false;
      }

      // بروزرسانی محصول موجود
      const updatedProducts = selectedProducts.map(p =>
        p.id === editingProductId ? product : p
      );
      setSelectedProducts(updatedProducts);
      setIsEditMode(false);
      setEditingProductId(null);
      console.log("محصول با موفقیت ویرایش شد، تعداد محصولات:", updatedProducts.length);
      return true;
    }

    // بررسی تکراری بودن محصول
    const existingProductIndex = selectedProducts.findIndex(p => p.id === product.id);

    if (existingProductIndex !== -1) {
      // اگر محصول تکراری است، آن را بروزرسانی کن
      const updatedProducts = [...selectedProducts];
      updatedProducts[existingProductIndex] = product;
      setSelectedProducts(updatedProducts);
      console.log("محصول موجود بروزرسانی شد، تعداد محصولات:", updatedProducts.length);
      return true;
    } else {
      // اضافه کردن محصول جدید به لیست محصولات موجود
      setSelectedProducts(prevProducts => {
        const newProducts = [...prevProducts, product];
        console.log("محصول جدید اضافه شد، تعداد محصولات قبلی:", prevProducts.length);
        console.log("تعداد محصولات بعد از افزودن:", newProducts.length);
        return newProducts;
      });
      return true;
    }
  };
  const renderModal = () => {
    return (
      <ReusableModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        headerConfig={{
          title: modalConfig.title,
          icon: modalConfig.icon,
          colors: ["#ff5252", "#ff7b7b"]
        }}
        messages={[
          {
            text: modalConfig.message,
            icon: modalConfig.icon,
            iconColor: "#ff5252"
          }
        ]}
        buttons={modalButtons}
        style={{ height: 350 }}
        contentStyle={{ paddingVertical: 25 }}
        modalHeight={350}
      />
    );
  };

  return {
    isLoading,
    selectedProducts,
    fetchProductByCode,
    searchProduct,
    removeProduct,
    addProduct,
    setSelectedProducts,
    modalVisible,
    renderModal,
    showRemoveConfirmation,
    showModal,
    isEditMode,
    editingProductId,
    editProduct
  };
};

export default useProductScanner;