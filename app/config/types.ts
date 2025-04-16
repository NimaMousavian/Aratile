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
