import { useId, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { ACCESS_ACTIONS, ACCESS_MODULES, modulePermissionKeys, toggleAccess } from "@/lib/access";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface AccessSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function AccessSelector({ value, onChange }: AccessSelectorProps) {
  const [search, setSearch] = useState("");
  const id = useId();
  const query = search.trim();
  const modules = ACCESS_MODULES.filter((module) => !query || `${module.label} ${module.features.map(([, label]) => label).join(" ")}`.includes(query));
  return (
    <div className="space-y-3" dir="rtl">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 font-medium"><ShieldCheck className="h-4 w-4 text-primary" />بخش‌ها و نوع دسترسی</span>
        <span className="text-muted-foreground">{value.length.toLocaleString("fa-IR")} دسترسی</span>
      </div>
      <div className="relative">
        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input aria-label="جستجوی بخش و قابلیت" placeholder="جستجوی بخش یا قابلیت…" value={search} onChange={(event) => setSearch(event.target.value)} className="pr-9 text-xs" />
      </div>
      <div className="max-h-[42vh] overflow-auto rounded-md border border-border px-3">
        <Accordion type="multiple" className="w-full">
          {modules.map((module) => {
            const keys = modulePermissionKeys(module.id);
            const count = keys.filter((key) => value.includes(key)).length;
            return (
              <AccordionItem key={module.id} value={module.id}>
                <AccordionTrigger className="py-3 text-xs hover:no-underline">
                  <span className="flex flex-1 items-center justify-between pl-3"><span>{module.label}</span><span className="text-muted-foreground">{count.toLocaleString("fa-IR")} / {keys.length.toLocaleString("fa-IR")}</span></span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pb-3">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Checkbox checked={count === keys.length ? true : count > 0 ? "indeterminate" : false} onCheckedChange={(checked) => onChange(checked === true ? [...new Set([...value, ...keys])] : value.filter((key) => !keys.includes(key)))} />
                    همه دسترسی‌های {module.label}
                  </label>
                  {module.features.map(([feature, label]) => (
                    <fieldset key={feature} className="border-t border-border pt-2">
                      <legend className="px-1 text-xs font-medium">{label}</legend>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-1 sm:grid-cols-4">
                        {ACCESS_ACTIONS.map((action) => {
                          const key = `${module.id}.${feature}.${action.id}`;
                          return <label key={key} htmlFor={`${id}-${key}`} className="flex cursor-pointer items-center gap-1.5 text-xs"><Checkbox id={`${id}-${key}`} aria-label={`${label} · ${action.label}`} checked={value.includes(key)} onCheckedChange={(checked) => onChange(toggleAccess(value, key, checked === true))} />{action.label}</label>;
                        })}
                      </div>
                    </fieldset>
                  ))}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
        {modules.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">بخشی یافت نشد</p>}
      </div>
    </div>
  );
}