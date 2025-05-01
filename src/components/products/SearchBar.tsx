
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "جستجوی محصولات..." }: SearchBarProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="w-full pr-8 text-right"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
