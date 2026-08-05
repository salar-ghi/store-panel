import { useState } from "react";
import { AttributeValueField } from "@/components/attributes/AttributeValueField";
import { ProductAttributeValue, ResolvedCategoryAttribute } from "@/types/attribute";

const attr = {
  id: 1, categoryId: 1, attributeDefinitionId: 1, isRequired: false, sortOrder: 0,
  isVisibleOnProductPage: true, isFilterable: true,
  attributeDefinition: {
    id: 1, code: "color", name: "رنگ", dataType: "MultiSelect", isFilterable: true,
    isSearchable: false, isComparable: false, isRequired: false, isVariantAttribute: false,
    sortOrder: 0,
    options: [ { id: 1, value: "red", label: "قرمز" }, { id: 2, value: "blue", label: "آبی" } ],
  },
} as unknown as ResolvedCategoryAttribute;

export default function DebugAttr() {
  const [values, setValues] = useState<Record<number, ProductAttributeValue>>({});
  return <div className="p-8"><AttributeValueField attribute={attr} value={values[1]} onChange={(v)=>setValues({...values,[1]:v})} /></div>;
}
