import { useState } from "react";
import { ProductAttributeFields } from "@/components/products/ProductAttributeFields";
import { ProductAttributeValue } from "@/types/attribute";

export default function DebugAttr() {
  const [values, setValues] = useState<Record<number, ProductAttributeValue>>({});
  return (
    <div className="p-8">
      <ProductAttributeFields categoryId={1} values={values} onChange={setValues} />
    </div>
  );
}
