import { ResolvedCategoryAttribute, ProductAttributeValue } from "@/types/attribute";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelectCheckbox } from "@/components/ui/multi-select-checkbox";
import { PersianDatePicker } from "@/components/ui/persian-datepicker";
import { cn } from "@/lib/utils";
import { Filter, Search, GitCompare, Layers } from "lucide-react";

interface Props {
  attribute: ResolvedCategoryAttribute;
  value?: ProductAttributeValue;
  onChange: (value: ProductAttributeValue) => void;
  invalid?: boolean;
}

export function AttributeValueField({ attribute, value, onChange, invalid }: Props) {
  const def = attribute.attributeDefinition;
  const required = attribute.isRequired ?? def.isRequired;
  const base: ProductAttributeValue = value ?? { attributeDefinitionId: attribute.attributeDefinitionId };
  const patch = (p: Partial<ProductAttributeValue>) => onChange({ ...base, ...p });

  const options = (def.options ?? []).filter((o) => o.isActive !== false);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-sm font-medium">
          {def.name}
          {required && <span className="text-destructive"> *</span>}
        </span>
        {def.unit && (
          <span className="text-[10px] text-muted-foreground">({def.unit})</span>
        )}
        {attribute.inheritedFrom && (
          <Badge variant="outline" className="h-4 px-1 text-[10px] font-normal gap-1">
            <Layers className="h-2.5 w-2.5" />
            {attribute.inheritedFrom.name}
          </Badge>
        )}
        <span className="flex items-center gap-1 text-muted-foreground">
          {(attribute.isFilterable ?? def.isFilterable) && <Filter className="h-3 w-3" />}
          {def.isSearchable && <Search className="h-3 w-3" />}
          {def.isComparable && <GitCompare className="h-3 w-3" />}
        </span>
      </div>

      {def.dataType === "Boolean" ? (
        <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-background">
          <Switch
            checked={!!base.boolValue}
            onCheckedChange={(c) => patch({ boolValue: c })}
          />
          <span className="text-sm text-muted-foreground">
            {base.boolValue ? "بله" : "خیر"}
          </span>
        </div>
      ) : def.dataType === "Select" ? (
        <Select
          value={base.attributeOptionId ? String(base.attributeOptionId) : undefined}
          onValueChange={(v) => patch({ attributeOptionId: Number(v) })}
        >
          <SelectTrigger className={cn(invalid && "border-destructive")}>
            <SelectValue placeholder={`انتخاب ${def.name}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.id} value={String(o.id)}>
                {o.label || o.value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : def.dataType === "MultiSelect" ? (
        <MultiSelectCheckbox
          dense
          options={options.map((o) => ({ value: String(o.id), label: o.label || o.value }))}
          selected={(base.attributeOptionIds ?? []).map(String)}
          onChange={(vals) => patch({ attributeOptionIds: vals.map(Number) })}
          placeholder={`انتخاب ${def.name}`}
        />
      ) : def.dataType === "Date" ? (
        <PersianDatePicker
          value={base.dateValue || ""}
          onChange={(v) => patch({ dateValue: v })}
          placeholder={`انتخاب ${def.name}`}
        />
      ) : def.dataType === "Integer" ? (
        <Input
          type="number"
          step="1"
          min={def.minValue}
          max={def.maxValue}
          value={base.intValue ?? ""}
          onChange={(e) =>
            patch({ intValue: e.target.value === "" ? null : parseInt(e.target.value, 10) })
          }
          placeholder={def.name}
          className={cn(invalid && "border-destructive")}
        />
      ) : def.dataType === "Decimal" ? (
        <Input
          type="number"
          step="any"
          min={def.minValue}
          max={def.maxValue}
          value={base.decimalValue ?? ""}
          onChange={(e) =>
            patch({ decimalValue: e.target.value === "" ? null : parseFloat(e.target.value) })
          }
          placeholder={def.name}
          className={cn(invalid && "border-destructive")}
        />
      ) : (
        <Input
          value={base.stringValue ?? ""}
          onChange={(e) => patch({ stringValue: e.target.value })}
          placeholder={def.name}
          className={cn(invalid && "border-destructive")}
        />
      )}
    </div>
  );
}
