import { AttributeDataType, ProductAttributeValue, ResolvedCategoryAttribute } from "@/types/attribute";

/** Empty typed value for an attribute definition. */
export function emptyValue(attributeDefinitionId: number): ProductAttributeValue {
  return { attributeDefinitionId };
}

export function isValueEmpty(dataType: AttributeDataType, v?: ProductAttributeValue): boolean {
  if (!v) return true;
  switch (dataType) {
    case "Integer":
      return v.intValue === undefined || v.intValue === null;
    case "Decimal":
      return v.decimalValue === undefined || v.decimalValue === null;
    case "Boolean":
      return v.boolValue === undefined || v.boolValue === null;
    case "Date":
      return !v.dateValue;
    case "Select":
      return v.attributeOptionId === undefined || v.attributeOptionId === null;
    case "MultiSelect":
      return !v.attributeOptionIds || v.attributeOptionIds.length === 0;
    default:
      return !v.stringValue;
  }
}

/** Human readable rendering of a stored value. */
export function formatAttributeValue(
  attr: ResolvedCategoryAttribute,
  value?: ProductAttributeValue
): string {
  const def = attr.attributeDefinition;
  if (isValueEmpty(def.dataType, value)) return "—";
  const unit = def.unit ? ` ${def.unit}` : "";
  switch (def.dataType) {
    case "Integer":
      return `${value!.intValue}${unit}`;
    case "Decimal":
      return `${value!.decimalValue}${unit}`;
    case "Boolean":
      return value!.boolValue ? "بله" : "خیر";
    case "Date":
      return value!.dateValue ?? "—";
    case "Select": {
      const opt = def.options?.find((o) => o.id === value!.attributeOptionId);
      return opt?.label || opt?.value || "—";
    }
    case "MultiSelect": {
      const ids = value!.attributeOptionIds ?? [];
      return (
        def.options
          ?.filter((o) => o.id != null && ids.includes(o.id))
          .map((o) => o.label || o.value)
          .join("، ") || "—"
      );
    }
    default:
      return `${value!.stringValue}${unit}`;
  }
}

/** Validate required attributes; returns list of missing attribute names. */
export function missingRequiredAttributes(
  attrs: ResolvedCategoryAttribute[],
  values: Record<number, ProductAttributeValue>
): string[] {
  return attrs
    .filter((a) => (a.isRequired ?? a.attributeDefinition.isRequired))
    .filter((a) => isValueEmpty(a.attributeDefinition.dataType, values[a.attributeDefinitionId]))
    .map((a) => a.attributeDefinition.name);
}

/** Only values that actually carry data, ready to POST to the backend. */
export function toPayload(
  attrs: ResolvedCategoryAttribute[],
  values: Record<number, ProductAttributeValue>
): ProductAttributeValue[] {
  return attrs
    .map((a) => ({ a, v: values[a.attributeDefinitionId] }))
    .filter(({ a, v }) => !isValueEmpty(a.attributeDefinition.dataType, v))
    .map(({ a, v }) => ({
      ...v,
      attributeDefinitionId: a.attributeDefinitionId,
      attributeCode: a.attributeDefinition.code,
      attributeName: a.attributeDefinition.name,
    }));
}

export function valuesFromList(
  list: ProductAttributeValue[] = []
): Record<number, ProductAttributeValue> {
  const map: Record<number, ProductAttributeValue> = {};
  for (const v of list) map[v.attributeDefinitionId] = v;
  return map;
}
