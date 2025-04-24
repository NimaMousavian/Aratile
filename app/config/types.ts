export interface IProduct {
  id: number;
  title: string;
  quantity: string;
  note: string;
  code: string;
  Price: number;
  hasColorSpectrum?: boolean;
}

export interface ISupplyRequest {
  id: number;
  title: string;
  requestCount: number;
  grade: string;
  status: string;
  dateCreated: string;
  dateModified: string;
}

export interface IMeasurementUnit {
  ProductMeasurementUnitId: 1;
  MeasurementUnitName: "متر مربع";
  Active: true;
}

export interface IPackagingRule {
  ProductPackagingRuleId: 2;
  PackagingName: "کارتن";
  ProductMeasurementUnitId: 1;
  ProductMeasurementUnitName: null;
  ProductCategoryId: null;
  ProductCategoryName: null;
  ProductPropertyId: 3;
  ShowQuantityLabel: false;
  MathematicalOperationType: 2;
  RoundingType: 1;
  DiscountApplyType: 1;
  ExtraAmountApplyType: 1;
  Active: true;
}

export interface ISupplyRequest {
  ProductSupplyRequestId: number;
  ApplicationUserId: number;
  ApplicationUserName: string;
  ProductId: number;
  ProductName: string;
  ProductVariationId: number;
  ProductVariationName: string;
  RequestedValue: number;
  RequestState: number;
  RequestStateStr: string;
  ShamsiInsertDate: string;
  Description: string;
}

export interface IPerson {
  PersonId: number;
  FirstName: string;
  LastName: string;
  NickName: string;
  Mobile: string;
  ProvinceId: string;
  ProvinceName: string;
  CityId: number;
  CityName: string;
  MarketingChannelId: number;
  PersonJobId: number;
  PersonJobName: string;
  IntroducerPersonId: number;
  IntroducerPersonFullName: string;
  IntroducerPersonMobile: string;
  Address: string;
  Description: string;
  Person_PersonGroup_List: {
    PersonId: number;
    PersonGroupId: number;
    PersonGroupName: string;
    InsertDate: string;
  }[];
}

export interface IPersonToEdit {
  PersonId: number;
  FirstName: string;
  LastName: string;
  NickName?: string | null;
  Mobile: string;
  ProvinceId: number;
  CityId: number;
  PersonJobId: number;
  MarketingChannelId: string | null;
  IntroducerPersonId: number;
  Address: string;
  Description?: string | null;
  PersonGroupIdList: number[];
}

export interface ILoginResponse {
  UserName: string;
  UserMobile: string;
  Token: string;
  USerRoleList: {
    UserId: number;
    RoleId: number;
    RoleName: string;
  }[];
}

export interface IInvoic {
  InvoiceId: number;
  PersonId: number;
  PersonFullName: string;
  PersonMobile: string;
  ApplicationUserId: number;
  ApplicationUserName: string;
  InvoiceDate: string;
  ShamsiInvoiceDate: string;
  PaymentType: number;
  State: number;
  TotalAmount: number;
  Description: string;
  InsertDate: string;
  InvoiceItemList: IInvoidItem[];
}

export interface IInvoidItem {
  InvoiceItemId: number;
  InvoiceId: number;
  ProductId: number;
  ProductName: string;
  ProductSKU: string;
  ProductMeasurementUnitId: number;
  ProductMeasurementUnitName: string;
  ProductPackaginName: string;
  ProductVariationId: number;
  ProductVariationName: string;
  ProductVariationSKU: string;
  PackagingRule_ProductPropertyValue: string;
  PackagingRule_MathematicalOperationType: number;
  PackagingRule_RoundingType: number;
  PackagingRule_DiscountApplyType: number;
  PackagingRule_ExtraAmountApplyType: number;
  ProductQuantity: number;
  PackagingQuantity: number;
  PerUnitPrice: number;
  PerPackagePrice: number;
  Discount: number;
  Extra: number;
  Description: string;
  InsertDate: string;
}

export interface IShopCustomField {
  ShopCustomFieldId: number;
  FieldName: string;
  ShopCustomFieldGroupId: number;
  ShopCustomFieldGroupName: string;
  FieldType: number;
  DefaultValue: number;
  Min: string;
  Max: string;
  IsRequired: boolean;
  Form_ShowOrder: number;
  Filterable: boolean;
  Filter_ShowOrder: number;
  IconName: string;
  Active: boolean;
  InsertDate: string;
  LastUpdateDate: string;
}
