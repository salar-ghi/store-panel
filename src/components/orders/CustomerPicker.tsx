import { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserService } from '@/services/user-service';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import {
  Search,
  UserPlus,
  CheckCircle2,
  X,
  Phone,
  Loader2,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface PickedCustomer {
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address?: string;
}

interface CustomerPickerProps {
  value: PickedCustomer;
  onChange: (v: PickedCustomer) => void;
}

export function CustomerPicker({ value, onChange }: CustomerPickerProps) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  // New-customer draft
  const [draft, setDraft] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: UserService.getAllUsers,
    staleTime: 5 * 60 * 1000,
  });
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: UserService.getAllRoles,
    staleTime: 5 * 60 * 1000,
  });

  const customerRoleId = useMemo(() => {
    const r = roles.find((x) =>
      ['customer', 'مشتری', 'client'].includes(x.name?.toLowerCase?.() ?? ''),
    );
    return r?.id;
  }, [roles]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return users
      .filter((u) =>
        [u.firstName, u.lastName, u.phoneNumber, u.username, u.email]
          .filter(Boolean)
          .some((f) => f!.toString().toLowerCase().includes(q)),
      )
      .slice(0, 8);
  }, [users, query]);

  // Sync draft → value when in create mode so parent always has latest input.
  useEffect(() => {
    if (showCreate) {
      onChange({ ...draft });
    }
  }, [draft, showCreate]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePickExisting = (u: (typeof users)[number]) => {
    onChange({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phoneNumber,
      email: u.email,
    });
    setQuery('');
    setShowCreate(false);
  };

  const handleClear = () => {
    onChange({ firstName: '', lastName: '', phone: '' });
    setShowCreate(false);
    setDraft({ firstName: '', lastName: '', phone: '', email: '', address: '' });
  };

  const handleCreateAndPick = async () => {
    if (!draft.firstName.trim() || !draft.lastName.trim() || !draft.phone.trim()) {
      toast.error('نام، نام خانوادگی و شماره تماس مشتری الزامی است');
      return;
    }
    if (!/^09\d{9}$/.test(draft.phone.trim())) {
      toast.error('شماره موبایل معتبر نیست (مثال: 09123456789)');
      return;
    }
    setCreating(true);
    try {
      let roleId = customerRoleId;
      if (!roleId) {
        const created = await UserService.createRole({ name: 'Customer' });
        roleId = created.id;
      }
      const created = await UserService.createUser({
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        phoneNumber: draft.phone.trim(),
        email: draft.email?.trim() || `${draft.phone.trim()}@customer.local`,
        roleIds: [roleId!],
      });
      toast.success('مشتری جدید با موفقیت ثبت شد');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onChange({
        id: created.id,
        firstName: created.firstName,
        lastName: created.lastName,
        phone: created.phoneNumber,
        email: created.email,
        address: draft.address,
      });
      setShowCreate(false);
    } catch (e) {
      console.error(e);
      toast.error('خطا در ثبت مشتری. لطفاً مجدداً تلاش کنید');
    } finally {
      setCreating(false);
    }
  };

  // Already selected? Show locked card.
  if (value.id) {
    return (
      <Card className="border-success/40 bg-success/5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-success/15 p-2 text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold">
                {value.firstName} {value.lastName}
              </p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                {value.phone}
              </p>
              <Badge variant="outline" className="border-success/30 text-success">
                مشتری ثبت‌شده
              </Badge>
            </div>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
            <X className="h-4 w-4" />
            تغییر
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {!showCreate && (
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              dir="rtl"
              className="pr-10"
              placeholder="جستجو بر اساس نام، نام خانوادگی یا شماره موبایل..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {isLoading && (
              <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          {query.trim() && (
            <Card className="overflow-hidden">
              <ScrollArea className="max-h-[260px]">
                {results.length === 0 ? (
                  <div className="space-y-3 p-6 text-center">
                    <UserRound className="mx-auto h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      مشتری‌ای با این مشخصات یافت نشد
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        // Pre-fill new-customer form from search query if it looks like a phone.
                        const isPhone = /^\d+$/.test(query.trim());
                        setDraft((d) => ({
                          ...d,
                          phone: isPhone ? query.trim() : d.phone,
                          firstName: !isPhone ? query.trim() : d.firstName,
                        }));
                        setShowCreate(true);
                      }}
                    >
                      <UserPlus className="ml-1.5 h-4 w-4" />
                      ثبت مشتری جدید
                    </Button>
                  </div>
                ) : (
                  <ul className="divide-y">
                    {results.map((u) => (
                      <li
                        key={u.id}
                        className={cn(
                          'flex cursor-pointer items-center justify-between gap-3 p-3 transition-colors hover:bg-muted/60',
                        )}
                        onClick={() => handlePickExisting(u)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                            {u.firstName?.[0] ?? '?'}
                          </div>
                          <div>
                            <p className="font-medium">
                              {u.firstName} {u.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {u.phoneNumber}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          {u.roles?.slice(0, 2).map((r) => (
                            <Badge key={r} variant="secondary" className="text-[10px]">
                              {r}
                            </Badge>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </Card>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setShowCreate(true)}
          >
            <UserPlus className="ml-1.5 h-4 w-4" />
            مشتری در لیست نیست؟ ثبت سریع مشتری جدید
          </Button>
        </>
      )}

      {showCreate && (
        <Card className="space-y-3 border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 font-semibold">
              <UserPlus className="h-4 w-4 text-primary" />
              ثبت مشتری جدید
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCreate(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>نام *</Label>
              <Input
                value={draft.firstName}
                onChange={(e) => setDraft({ ...draft, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>نام خانوادگی *</Label>
              <Input
                value={draft.lastName}
                onChange={(e) => setDraft({ ...draft, lastName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>شماره موبایل *</Label>
              <Input
                dir="ltr"
                placeholder="09123456789"
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>ایمیل (اختیاری)</Label>
              <Input
                dir="ltr"
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>آدرس (اختیاری)</Label>
              <Input
                value={draft.address}
                onChange={(e) => setDraft({ ...draft, address: e.target.value })}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            مشتری با نقش «مشتری» در سیستم ذخیره می‌شود و در سفارش‌های بعدی قابل جستجو خواهد بود.
          </p>
          <Button
            type="button"
            className="w-full"
            onClick={handleCreateAndPick}
            disabled={creating}
          >
            {creating ? (
              <Loader2 className="ml-1.5 h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="ml-1.5 h-4 w-4" />
            )}
            ثبت و انتخاب مشتری
          </Button>
        </Card>
      )}
    </div>
  );
}
