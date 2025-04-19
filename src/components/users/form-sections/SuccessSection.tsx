
import { Button } from "@/components/ui/button";
import { Key } from "lucide-react";

interface SuccessSectionProps {
  generatedPassword: string;
  onReset: () => void;
}

export function SuccessSection({ generatedPassword, onReset }: SuccessSectionProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="rounded-lg border p-4 bg-muted/20">
        <h3 className="font-medium mb-2 flex items-center">
          <Key className="h-4 w-4 ml-2 text-purple-500" />
          رمز عبور تولید شده
        </h3>
        <p className="text-sm mb-2">یک رمز عبور برای این کاربر تولید شده است:</p>
        <div className="font-mono bg-background p-3 rounded border text-center">
          {generatedPassword}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          این رمز عبور از طریق روش اطلاع‌رسانی انتخاب شده به کاربر ارسال خواهد شد.
        </p>
      </div>
      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onReset}
        >
          ایجاد کاربر دیگر
        </Button>
      </div>
    </div>
  );
}
