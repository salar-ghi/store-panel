// Attribute (EAV) model — mirrors backend AttributeDefinition / AttributeOption /
// CategoryAttributeDefinition / ProductAttributeValue entities.

export type AttributeDataType =
  | 'String'
  | 'Integer'
  | 'Decimal'
  | 'Boolean'
  | 'Date'
  | 'Select'
  | 'MultiSelect';

export const ATTRIBUTE_DATA_TYPES: { value: AttributeDataType; label: string }[] = [
  { value: 'String', label: 'متن' },
  { value: 'Integer', label: 'عدد صحیح' },
  { value: 'Decimal', label: 'عدد اعشاری' },
  { value: 'Boolean', label: 'بله / خیر' },
  { value: 'Date', label: 'تاریخ' },
  { value: 'Select', label: 'انتخاب تکی' },
  { value: 'MultiSelect', label: 'انتخاب چندتایی' },
];

export interface AttributeOption {
  id?: number;
  attributeDefinitionId?: number;
  value: string;
  label?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface AttributeDefinition {
  id: number;
  code: string;
  name: string;
  dataType: AttributeDataType;
  unit?: string;
  isFilterable: boolean;
  isSearchable: boolean;
  isComparable: boolean;
  isRequired: boolean;
  isVariantAttribute: boolean;
  sortOrder: number;
  validationRegex?: string;
  minValue?: number;
  maxValue?: number;
  options?: AttributeOption[];
}

export interface CreateAttributeDefinitionRequest {
  code: string;
  name: string;
  dataType: AttributeDataType;
  unit?: string;
  isFilterable?: boolean;
  isSearchable?: boolean;
  isComparable?: boolean;
  isRequired?: boolean;
  isVariantAttribute?: boolean;
  sortOrder?: number;
  validationRegex?: string;
  minValue?: number;
  maxValue?: number;
  options?: AttributeOption[];
}

/** Join row between a category and an attribute definition. */
export interface CategoryAttributeDefinition {
  id: number;
  categoryId: number;
  attributeDefinitionId: number;
  attributeDefinition?: AttributeDefinition;
  isRequired: boolean;
  sortOrder: number;
  isVisibleOnProductPage: boolean;
  isFilterable: boolean;
}

export interface AssignCategoryAttributeRequest {
  attributeDefinitionId: number;
  isRequired?: boolean;
  sortOrder?: number;
  isVisibleOnProductPage?: boolean;
  isFilterable?: boolean;
}

/**
 * A category attribute after merging the category chain (parents → child).
 * `inheritedFrom` is set when the attribute comes from an ancestor category.
 */
export interface ResolvedCategoryAttribute extends CategoryAttributeDefinition {
  attributeDefinition: AttributeDefinition;
  inheritedFrom?: { id: number; name: string };
}

export interface ProductAttributeValue {
  id?: number;
  productId?: number;
  attributeDefinitionId: number;
  attributeCode?: string;
  attributeName?: string;
  stringValue?: string | null;
  intValue?: number | null;
  decimalValue?: number | null;
  boolValue?: boolean | null;
  dateValue?: string | null;
  attributeOptionId?: number | null;
  /** For MultiSelect — list of option ids. */
  attributeOptionIds?: number[] | null;
}
