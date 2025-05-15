import { MaterialIcons } from "@expo/vector-icons";

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
  UserId: number;
  DisplayName: string;
  UserName: string;
  UserMobile: string;
  Token: string;
  CityId: number;
  CityName: string;
  ProvinceId: number;
  ProvinceName: string;
  AvatarImageFileName: string;
  AvatarImageURL: string;
  CompanyBranchId: number;
  CompanyBranchName: string;
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

export interface IAddShopToPost {
  ShopId: number;
  ShopName: string;
  CityId: number;
  CityName: string;
  ProvinceId: number;
  ProvinceName: string;
  ShopAddress: string;
  ShopAreaInMeters: number;
  ShopHistoryInYears: number;
  ShopOwnershipType: number;
  ShopOwnershipTypeStr: string;
  OwnerFirstName: string;
  OwnerLastName: string;
  OwnerMobile: string;
  HasWarehouse: boolean;
  HasWarehouseStr: string;
  WarehouseOwnershipType: number;
  WarehouseOwnershipTypeStr: string;
  WarehouseAreaInMeters: number;
  WarehouseAddress: string;
  Description: string;
  ApplicationUserId: number;
  ApplicationUserName: string;
  InsertDate: string;
  ShamsiInsertDate: string;
  LastUpdateDate: string;
  ShopCustomFieldList: {
    ShopId: number;
    ShopCustomFieldId: number;
    ShopCustomFieldSelectiveValueId: number;
    Value: string;
    InsertDate: string;
  }[];
}
export interface IPersonProjectCustomField {
  PersonProjectId: number;
  PersonProjectCustomFieldId: number;
  Value: string;
  InsertDate: string;
  LastUpdateDate: string | null;
}

export interface IPersonProject {
  PersonProjectId: number;
  PersonId: number | null;
  PersonFullName: string;
  CityId: number;
  CityName: string;
  ProvinceId: number;
  ProvinceName: string;
  ProjectName: string;
  ApplicationUserId: number;
  ApplicationUserName: string | null;
  Description: string;
  InsertDate: string;
  LastUpdateDate: string | null;
  PersonProjectCustomFieldList: IPersonProjectCustomField[] | null;
}

export interface IShowRoomVisitItem {
  ShowroomVisitId: number;
  CompanyBranchId: number;
  CompanyBranchName: string;
  ApplicationUserId: number;
  ApplicationUserName: string;
  ShowroomVisitResultId: number;
  ShowroomVisitResultTitle: string;
  Description: string;
  VisitDate: string;
  ShamsiVisitDate: string;
  StartTime: string;
  FinishTime: string;
  PersonCount: number;
  PersonList: {
    ShowroomVisitId: number;
    PersonId: number;
    PersonFullName: string;
    PersonMobile: string;
    InsertDate: string;
  }[];
  InsertDate: string;
  LastUpdateDate: string;
}

export interface IVisitResult {
  ShowroomVisitResultId: number;
  Title: string;
}

export interface IShopItem {
  ShopId: number;
  ShopName: string;
  CityId: number;
  CityName: string;
  ProvinceId: number;
  ProvinceName: string;
  ShopAddress: string;
  ShopAreaInMeters: number;
  ShopHistoryInYears: number;
  ShopOwnershipType: number;
  ShopOwnershipTypeStr: string;
  OwnerFirstName: string;
  OwnerLastName: string;
  OwnerMobile: string;
  HasWarehouse: boolean;
  HasWarehouseStr: string;
  WarehouseOwnershipType: number;
  WarehouseOwnershipTypeStr: string;
  WarehouseAreaInMeters: number;
  WarehouseAddress: string;
  Description: string;
  ApplicationUserId: number;
  ApplicationUserName: string;
  InsertDate: string;
  ShamsiInsertDate: string;
  LastUpdateDate: string;
  ShopCustomFieldList: string;
}

export interface IProjectCustomField {
  ProjectCustomFieldId: number;
  ProjectCustomFieldGroupId: number;
  ProjectCustomFieldGroupName: string;
  FieldName: string;
  FieldType: number; // 1: Text, 2: Number, 3: Date, 4: Selection, 7: Multiline Text
  IsRequired: boolean;
  IconName?: string;
  Form_ShowOrder: number;
}

export interface IShowRoomVisitCustomField {
  ShowroomVisitCustomFieldId: number;
  ShowroomVisitCustomFieldGroupId: number;
  ShowroomVisitCustomFieldGroupName: string;
  FieldName: string;
  FieldType: number; // 1: Text, 2: Number, 3: Date, 4: Selection, 7: Multiline Text
  IsRequired: boolean;
  IconName?: string;
  Form_ShowOrder: number;
}

export interface IPersonCustomField {
  PersonCustomFieldId: number;
  FieldName: string;
  FieldType: number; // 1: text, 2: number, 3: date, 4: multi-select, 5: number, 6: location, 7: multiline text
  IsRequired: boolean;
  IconName: string;
  PersonCustomFieldGroupId: number;
  PersonCustomFieldGroupName: string;
  Form_ShowOrder: number;
}

export interface IForm {
  FormId: number;
  FormName: string;
  FormGroupId: number;
  FormGroupName: string;
  FormGroupShowOrder: number;
  FormGroupIconName: React.ComponentProps<typeof MaterialIcons>["name"];
  ShowOrderInGroup: number;
  PublicOrPrivate: boolean;
  PublicOrPrivateStr: string;
  IconName: React.ComponentProps<typeof MaterialIcons>["name"];
  Active: boolean;
  ActiveStr: string;
}

export interface IFormItem extends IForm {
  FormStepList: IFormStep[];
}

export interface IFormStep {
  FormStepId: number;
  FormId: number;
  Title: string;
  ShowOrder: number;
  Active: boolean;
  IconName: React.ComponentProps<typeof MaterialIcons>["name"];
  StepSectionList: IFormStepSection[];
}

export interface IFormStepSection {
  FormStepSectionId: number;
  FormStepId: number;
  Title: string;
  ShowOrder: number;
  Active: boolean;
  FormFieldList: IFormField[];
  SectionMessageList: [];
}

export interface IFormField {
  FormFieldId: number;
  FormStepSectionId: number;
  FieldName: string;
  FieldType: number;
  FieldTypeStr: string;
  IconName: React.ComponentProps<typeof MaterialIcons>["name"];
  DependsToId: null;
  DefaultValue: null;
  MinValue: string;
  MaxValue: string;
  Message: string;
  Setting: null;
  IsRequired: boolean;
  ShowOrder: number;
  Active: boolean;
}

export interface ITask {
  TaskAssignmentId: number;
  TaskId: number;
  TaskTypeId: number;
  TaskTypeName: string;
  TaskTitle: string;
  TaskDeadlineDate: string;
  ShamsiTaskDeadlineDate: string;
  TaskState: number;
  TaskStateStr: string;
  ApplicationUserId: number;
  ApplicationUserName: string;
  InsertDate: string;
  ShamsiInsertDate: string;
}
