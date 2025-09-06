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

  const getIconColors = (icon: string) => {
    switch (icon) {
      case "check":
      case "check-circle":
        return {
          headerColors: [colors.success, "#4caf50"],
          iconColor: colors.success
        };
      case "error":
      case "close":
        return {
          headerColors: ["#ff5252", "#ff7b7b"],
          iconColor: "#ff5252"
        };
      case "delete":
        return {
          headerColors: [colors.danger, "#f44336"],
          iconColor: colors.danger
        };
      case "search-off":
      case "info":
      default:
        return {
          headerColors: [colors.primary, colors.secondary],
          iconColor: colors.primary
        };
    }
  };

  const showModal = (title: string, message: string, icon: React.ComponentProps<typeof ReusableModal>["headerConfig"]["icon"] = "info") => {
    setModalConfig({
      title,
      message,
      icon,
    });
    setModalVisible(true);
  };

  const searchProduct = async (query: string, page: number = 1, pageSize: number = 20) => {
    if (!query.trim()) {
      return {
        items: [],
        totalCount: 0,
        hasMore: false
      };
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}Product/SearchBySKUOrName?query=${query}&page=${page}&pageSize=${pageSize}`
      );

      const items = response.data?.Items || [];
      const totalCount = response.data?.TotalCount || 0;
      const hasMore = (page * pageSize) < totalCount;

      return {
        items,
        totalCount,
        hasMore
      };
    } catch (error) {
      console.error("Error searching products:", error);
      showModal(
        "خطا",
        "خطا در جستجوی محصولات. لطفاً دوباره تلاش کنید.",
        "error"
      );
      return {
        items: [],
        totalCount: 0,
        hasMore: false
      };
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

      const updatedProducts = selectedProducts.map(p =>
        p.id === editingProductId ? product : p
      );
      setSelectedProducts(updatedProducts);
      setIsEditMode(false);
      setEditingProductId(null);
      console.log("محصول با موفقیت ویرایش شد، تعداد محصولات:", updatedProducts.length);
      return true;
    }

    const existingProductIndex = selectedProducts.findIndex(p => p.code === product.code);

    if (existingProductIndex !== -1) {
      showModal(
        "محصول تکراری",
        "این محصول قبلاً به فاکتور اضافه شده است.",
        "error"
      );
      return false;
    } else {
      const newProduct = {
        ...product,
        id: product.id || Date.now()
      };

      setSelectedProducts(prevProducts => {
        const newProducts = [...prevProducts, newProduct];
        console.log("محصول جدید اضافه شد، تعداد محصولات قبلی:", prevProducts.length);
        console.log("تعداد محصولات بعد از افزودن:", newProducts.length);
        return newProducts;
      });
      return true;
    }
  };

  const renderModal = () => {
    const iconColors = getIconColors(modalConfig.icon as string);

    return (
      <ReusableModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        headerConfig={{
          title: modalConfig.title,
          icon: modalConfig.icon,
          colors: iconColors.headerColors
        }}
        messages={[
          {
            text: modalConfig.message,
            icon: modalConfig.icon,
            iconColor: iconColors.iconColor
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