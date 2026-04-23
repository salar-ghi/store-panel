import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import {
  Building2,
  Layers,
  Boxes,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Sparkles,
  Store,
  Warehouse as WarehouseIcon,
  PackageSearch,
  ArrowDown,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StorageService } from '@/services/storage-service';
import {
  StorageSpace,
  StorageSpaceType,
  StorageSpaceTypeLabels,
  StorageSpaceTypeDescriptions,
  StorageZone,
  Shelf,
} from '@/types/storage';

// ----- Schemas -----
const spaceSchema = z.object({
  name: z.string().min(2, 'نام حداقل ۲ کاراکتر'),
  type: z.enum(['store_floor', 'back_room', 'basement', 'warehouse', 'dark_store', 'other']),
  code: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  capacity: z.coerce.number().positive('ظرفیت باید مثبت باشد'),
});
type SpaceForm = z.infer<typeof spaceSchema>;

const zoneSchema = z.object({
  spaceId: z.coerce.number({ required_error: 'فضا را انتخاب کنید' }),
  name: z.string().min(2, 'نام حداقل ۲ کاراکتر'),
  code: z.string().optional(),
  description: z.string().optional(),
});
type ZoneForm = z.infer<typeof zoneSchema>;

const shelfSchema = z.object({
  spaceId: z.coerce.number({ required_error: 'فضا را انتخاب کنید' }),
  zoneId: z.coerce.number().optional(),
  code: z.string().min(1, 'کد قفسه الزامی است'),
  name: z.string().optional(),
  level: z.coerce.number().int().nonnegative().optional(),
  row: z.coerce.number().int().nonnegative().optional(),
  column: z.coerce.number().int().nonnegative().optional(),
  capacity: z.coerce.number().positive('ظرفیت باید مثبت باشد'),
});
type ShelfForm = z.infer<typeof shelfSchema>;

// ----- Visual helpers -----
const spaceIcon: Record<StorageSpaceType, typeof Store> = {
  store_floor: Store,
  back_room: Boxes,
  basement: ArrowDown,
  warehouse: WarehouseIcon,
  dark_store: PackageSearch,
  other: Building2,
};

function usagePct(used: number, capacity: number) {
  if (!capacity) return 0;
  return Math.min(100, Math.round((used / capacity) * 100));
}

function usageColor(pct: number) {
  if (pct < 50) return 'bg-emerald-500';
  if (pct < 80) return 'bg-amber-500';
  return 'bg-destructive';
}

// ===== Page =====
export default function InventoryStorage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState('spaces');

  const { data: spaces = [] } = useQuery({ queryKey: ['storage', 'spaces'], queryFn: StorageService.getSpaces });
  const { data: zones = [] } = useQuery({ queryKey: ['storage', 'zones'], queryFn: () => StorageService.getZones() });
  const { data: shelves = [] } = useQuery({ queryKey: ['storage', 'shelves'], queryFn: () => StorageService.getShelves() });

  const totals = useMemo(() => {
    const cap = spaces.reduce((s, x) => s + x.capacity, 0);
    const used = spaces.reduce((s, x) => s + x.used, 0);
    return { cap, used, pct: usagePct(used, cap) };
  }, [spaces]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['storage'] });
  };

  return (
    <div className="space-y-6 py-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Layers className="h-7 w-7 text-primary" />
          مدیریت فضاها و قفسه‌ها
        </h1>
        <p className="text-muted-foreground">
          ساختار سه‌سطحی <strong>فضا → بخش → قفسه</strong> برای هر نوع کسب‌وکار: سوپرمارکت کوچک، فروشگاه زنجیره‌ای یا فروشگاه آنلاین.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPI icon={Building2} label="فضاهای ذخیره" value={spaces.length} accent="primary" />
        <KPI icon={Layers} label="بخش‌ها (Zones)" value={zones.length} accent="info" />
        <KPI icon={Boxes} label="قفسه‌ها" value={shelves.length} accent="success" />
        <KPI icon={Sparkles} label="درصد اشغال" value={`${totals.pct}%`} accent="warning" />
      </div>

      {/* Quick presets — first-time setup helper */}
      {spaces.length === 0 && <ScenarioPresets onCreated={refresh} />}

      <Tabs value={tab} onValueChange={setTab} dir="rtl" className="w-full">
        <TabsList className="grid grid-cols-3 max-w-xl">
          <TabsTrigger value="spaces" className="gap-2">
            <Building2 className="h-4 w-4" /> فضاها
          </TabsTrigger>
          <TabsTrigger value="zones" className="gap-2">
            <Layers className="h-4 w-4" /> بخش‌ها
          </TabsTrigger>
          <TabsTrigger value="shelves" className="gap-2">
            <Boxes className="h-4 w-4" /> قفسه‌ها
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spaces" className="mt-6">
          <SpacesTab spaces={spaces} shelves={shelves} onChanged={refresh} />
        </TabsContent>
        <TabsContent value="zones" className="mt-6">
          <ZonesTab spaces={spaces} zones={zones} shelves={shelves} onChanged={refresh} />
        </TabsContent>
        <TabsContent value="shelves" className="mt-6">
          <ShelvesTab spaces={spaces} zones={zones} shelves={shelves} onChanged={refresh} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===== KPI =====
function KPI({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Building2;
  label: string;
  value: string | number;
  accent: 'primary' | 'info' | 'success' | 'warning';
}) {
  const accentClass = {
    primary: 'bg-primary/10 text-primary',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  }[accent];

  return (
    <Card className="border-r-4 border-r-primary/60">
      <CardContent className="pt-5 flex items-center gap-4">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${accentClass}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== Scenario presets =====
function ScenarioPresets({ onCreated }: { onCreated: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);

  const apply = async (preset: 'small' | 'shop' | 'online') => {
    setBusy(preset);
    try {
      if (preset === 'small') {
        const space = await StorageService.createSpace({
          name: 'سالن فروش',
          type: 'store_floor',
          code: 'MAIN',
          capacity: 1000,
        });
        await Promise.all([
          StorageService.createShelf({ spaceId: space.id, code: 'S-01', name: 'قفسه ۱', capacity: 100 }),
          StorageService.createShelf({ spaceId: space.id, code: 'S-02', name: 'قفسه ۲', capacity: 100 }),
          StorageService.createShelf({ spaceId: space.id, code: 'S-03', name: 'قفسه ۳', capacity: 100 }),
        ]);
        toast.success('سوپرمارکت کوچک با ۳ قفسه ساخته شد');
      } else if (preset === 'shop') {
        const showroom = await StorageService.createSpace({ name: 'سالن فروش', type: 'store_floor', code: 'SHOW', capacity: 800 });
        const basement = await StorageService.createSpace({ name: 'زیرزمین', type: 'basement', code: 'BSMT', capacity: 1500 });
        await Promise.all([
          StorageService.createShelf({ spaceId: showroom.id, code: 'F-01', name: 'قفسه جلو', capacity: 100 }),
          StorageService.createShelf({ spaceId: showroom.id, code: 'F-02', name: 'قفسه وسط', capacity: 100 }),
          StorageService.createShelf({ spaceId: basement.id, code: 'B-01', name: 'قفسه زیرزمین ۱', capacity: 200 }),
          StorageService.createShelf({ spaceId: basement.id, code: 'B-02', name: 'قفسه زیرزمین ۲', capacity: 200 }),
        ]);
        toast.success('فروشگاه با زیرزمین ساخته شد');
      } else {
        const wh = await StorageService.createSpace({ name: 'انبار آنلاین مرکزی', type: 'dark_store', code: 'DS-01', capacity: 5000 });
        const aisleA = await StorageService.createZone({ spaceId: wh.id, name: 'راهرو A', code: 'A' });
        const aisleB = await StorageService.createZone({ spaceId: wh.id, name: 'راهرو B', code: 'B' });
        await Promise.all([
          StorageService.createShelf({ spaceId: wh.id, zoneId: aisleA.id, code: 'A-01-1', name: 'A ردیف ۱ طبقه ۱', capacity: 150, level: 1 }),
          StorageService.createShelf({ spaceId: wh.id, zoneId: aisleA.id, code: 'A-01-2', name: 'A ردیف ۱ طبقه ۲', capacity: 150, level: 2 }),
          StorageService.createShelf({ spaceId: wh.id, zoneId: aisleB.id, code: 'B-01-1', name: 'B ردیف ۱ طبقه ۱', capacity: 150, level: 1 }),
        ]);
        toast.success('انبار آنلاین ساخته شد');
      }
      onCreated();
    } catch (e: any) {
      toast.error(e?.message || 'خطا در ساخت');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card className="border-r-4 border-r-primary/70 bg-primary/5">
      <CardHeader className="py-4">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          شروع سریع — یک پیش‌تنظیم انتخاب کنید
        </CardTitle>
        <CardDescription>برای راه‌اندازی اولیه ساختار انبار، یکی از سناریوهای زیر را انتخاب کنید. بعداً می‌توانید آن را ویرایش کنید.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PresetCard
          icon={Store}
          title="سوپرمارکت کوچک"
          desc="یک سالن فروش بدون انباری اضافه + ۳ قفسه نمونه"
          loading={busy === 'small'}
          onClick={() => apply('small')}
        />
        <PresetCard
          icon={Boxes}
          title="فروشگاه با زیرزمین"
          desc="سالن فروش + زیرزمین، هرکدام با چند قفسه"
          loading={busy === 'shop'}
          onClick={() => apply('shop')}
        />
        <PresetCard
          icon={WarehouseIcon}
          title="فروشگاه آنلاین"
          desc="انبار آنلاین با ۲ راهرو و قفسه‌های چندطبقه"
          loading={busy === 'online'}
          onClick={() => apply('online')}
        />
      </CardContent>
    </Card>
  );
}

function PresetCard({
  icon: Icon,
  title,
  desc,
  onClick,
  loading,
}: {
  icon: typeof Store;
  title: string;
  desc: string;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="group text-right rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition-all p-4 disabled:opacity-60"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        <div className="font-semibold">{title}</div>
      </div>
      <p className="text-xs text-muted-foreground leading-5">{desc}</p>
      <div className="mt-3 text-xs text-primary font-medium">
        {loading ? 'در حال ساخت…' : 'انتخاب این سناریو ←'}
      </div>
    </button>
  );
}

// ===== Spaces tab =====
function SpacesTab({
  spaces,
  shelves,
  onChanged,
}: {
  spaces: StorageSpace[];
  shelves: Shelf[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StorageSpace | null>(null);
  const [search, setSearch] = useState('');

  const form = useForm<SpaceForm>({
    resolver: zodResolver(spaceSchema),
    defaultValues: { name: '', type: 'store_floor', code: '', address: '', description: '', capacity: 0 },
  });

  const openNew = () => {
    setEditing(null);
    form.reset({ name: '', type: 'store_floor', code: '', address: '', description: '', capacity: 0 });
    setOpen(true);
  };

  const openEdit = (s: StorageSpace) => {
    setEditing(s);
    form.reset({
      name: s.name,
      type: s.type,
      code: s.code || '',
      address: s.address || '',
      description: s.description || '',
      capacity: s.capacity,
    });
    setOpen(true);
  };

  const onSubmit = async (data: SpaceForm) => {
    try {
      if (editing) {
        await StorageService.updateSpace(editing.id, data);
        toast.success('فضا ویرایش شد');
      } else {
        await StorageService.createSpace(data as Required<SpaceForm>);
        toast.success('فضا اضافه شد');
      }
      setOpen(false);
      onChanged();
    } catch (e: any) {
      toast.error(e?.message || 'خطا');
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm('با حذف این فضا، تمام بخش‌ها و قفسه‌های آن نیز حذف می‌شوند. ادامه می‌دهید؟')) return;
    await StorageService.deleteSpace(id);
    toast.success('فضا حذف شد');
    onChanged();
  };

  const list = spaces.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || (s.code || '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
        <div>
          <CardTitle>فضاهای ذخیره‌سازی</CardTitle>
          <CardDescription>هر فضای فیزیکی یا منطقی برای نگهداری کالا</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="جستجو…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
          />
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" /> فضای جدید
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="هنوز فضایی تعریف نشده"
            desc="برای شروع یک فضای ذخیره‌سازی اضافه کنید یا از پیش‌تنظیم‌های بالا استفاده کنید"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((s) => {
              const Icon = spaceIcon[s.type];
              const shelfCount = shelves.filter((sh) => sh.spaceId === s.id).length;
              const pct = usagePct(s.used, s.capacity);
              return (
                <div
                  key={s.id}
                  className="group rounded-xl border bg-card p-4 hover:border-primary/50 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{StorageSpaceTypeLabels[s.type]}</div>
                      </div>
                    </div>
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(s.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {s.code && (
                    <Badge variant="secondary" className="mb-2 font-mono text-xs">
                      {s.code}
                    </Badge>
                  )}
                  {s.address && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3" />
                      {s.address}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">اشغال</span>
                    <span className="font-medium">
                      {s.used.toLocaleString('fa-IR')} / {s.capacity.toLocaleString('fa-IR')}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full ${usageColor(pct)} transition-all`} style={{ width: `${pct}%` }} />
                  </div>

                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <Boxes className="h-3.5 w-3.5" />
                    {shelfCount.toLocaleString('fa-IR')} قفسه
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{editing ? 'ویرایش فضا' : 'فضای جدید'}</DialogTitle>
            <DialogDescription>اطلاعات فضای ذخیره‌سازی را وارد کنید.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نام</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: سالن فروش" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع فضا</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="انتخاب نوع" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(Object.keys(StorageSpaceTypeLabels) as StorageSpaceType[]).map((k) => (
                            <SelectItem key={k} value={k}>
                              <div className="flex flex-col">
                                <span>{StorageSpaceTypeLabels[k]}</span>
                                <span className="text-xs text-muted-foreground">{StorageSpaceTypeDescriptions[k]}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>کد (اختیاری)</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: MAIN" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ظرفیت (واحد)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>آدرس (برای فروشگاه‌های زنجیره‌ای)</FormLabel>
                    <FormControl>
                      <Input placeholder="آدرس کامل (اختیاری)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>توضیحات</FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="توضیحات (اختیاری)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit">{editing ? 'ذخیره' : 'افزودن'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ===== Zones tab =====
function ZonesTab({
  spaces,
  zones,
  shelves,
  onChanged,
}: {
  spaces: StorageSpace[];
  zones: StorageZone[];
  shelves: Shelf[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StorageZone | null>(null);
  const [filterSpace, setFilterSpace] = useState<string>('all');

  const form = useForm<ZoneForm>({
    resolver: zodResolver(zoneSchema),
    defaultValues: { spaceId: undefined, name: '', code: '', description: '' },
  });

  const openNew = () => {
    setEditing(null);
    form.reset({ spaceId: spaces[0]?.id, name: '', code: '', description: '' });
    setOpen(true);
  };
  const openEdit = (z: StorageZone) => {
    setEditing(z);
    form.reset({ spaceId: z.spaceId, name: z.name, code: z.code || '', description: z.description || '' });
    setOpen(true);
  };

  const onSubmit = async (data: ZoneForm) => {
    try {
      if (editing) {
        await StorageService.updateZone(editing.id, data);
        toast.success('بخش ویرایش شد');
      } else {
        await StorageService.createZone(data as Required<ZoneForm>);
        toast.success('بخش اضافه شد');
      }
      setOpen(false);
      onChanged();
    } catch (e: any) {
      toast.error(e?.message || 'خطا');
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm('این بخش حذف شود؟ قفسه‌های مرتبط بدون بخش باقی می‌مانند.')) return;
    await StorageService.deleteZone(id);
    toast.success('حذف شد');
    onChanged();
  };

  const list = filterSpace === 'all' ? zones : zones.filter((z) => z.spaceId === Number(filterSpace));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
        <div>
          <CardTitle>بخش‌ها (Zones)</CardTitle>
          <CardDescription>گروه‌بندی اختیاری قفسه‌ها — مثلاً «راهرو A»، «بخش سرد»</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterSpace} onValueChange={setFilterSpace}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="فیلتر بر اساس فضا" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه فضاها</SelectItem>
              {spaces.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openNew} disabled={spaces.length === 0} className="gap-2">
            <Plus className="h-4 w-4" /> بخش جدید
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="بخشی تعریف نشده"
            desc="بخش‌ها اختیاری‌اند و فقط برای گروه‌بندی قفسه‌ها در فضاهای بزرگ مفیدند"
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام بخش</TableHead>
                  <TableHead>کد</TableHead>
                  <TableHead>فضا</TableHead>
                  <TableHead>تعداد قفسه</TableHead>
                  <TableHead className="text-left">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((z) => {
                  const space = spaces.find((s) => s.id === z.spaceId);
                  const count = shelves.filter((sh) => sh.zoneId === z.id).length;
                  return (
                    <TableRow key={z.id}>
                      <TableCell className="font-medium">{z.name}</TableCell>
                      <TableCell>
                        {z.code ? <Badge variant="secondary" className="font-mono">{z.code}</Badge> : '—'}
                      </TableCell>
                      <TableCell>{space?.name || '—'}</TableCell>
                      <TableCell>{count.toLocaleString('fa-IR')}</TableCell>
                      <TableCell className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(z)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(z.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'ویرایش بخش' : 'بخش جدید'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
              <FormField
                control={form.control}
                name="spaceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>فضا</FormLabel>
                    <Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب فضا" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {spaces.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نام</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: راهرو A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>کد</FormLabel>
                      <FormControl>
                        <Input placeholder="A1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>توضیحات</FormLabel>
                    <FormControl>
                      <Textarea rows={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">{editing ? 'ذخیره' : 'افزودن'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ===== Shelves tab =====
function ShelvesTab({
  spaces,
  zones,
  shelves,
  onChanged,
}: {
  spaces: StorageSpace[];
  zones: StorageZone[];
  shelves: Shelf[];
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Shelf | null>(null);
  const [filterSpace, setFilterSpace] = useState<string>('all');
  const [filterZone, setFilterZone] = useState<string>('all');
  const [search, setSearch] = useState('');

  const form = useForm<ShelfForm>({
    resolver: zodResolver(shelfSchema),
    defaultValues: { spaceId: undefined, zoneId: undefined, code: '', name: '', capacity: 0 },
  });

  const watchedSpace = form.watch('spaceId');
  const availableZones = zones.filter((z) => z.spaceId === watchedSpace);

  const openNew = () => {
    setEditing(null);
    form.reset({ spaceId: spaces[0]?.id, zoneId: undefined, code: '', name: '', capacity: 0 });
    setOpen(true);
  };
  const openEdit = (s: Shelf) => {
    setEditing(s);
    form.reset({
      spaceId: s.spaceId,
      zoneId: s.zoneId,
      code: s.code,
      name: s.name || '',
      capacity: s.capacity,
      level: s.level,
      row: s.row,
      column: s.column,
    });
    setOpen(true);
  };

  const onSubmit = async (data: ShelfForm) => {
    try {
      if (editing) {
        await StorageService.updateShelf(editing.id, data);
        toast.success('قفسه ویرایش شد');
      } else {
        await StorageService.createShelf(data as Required<ShelfForm>);
        toast.success('قفسه اضافه شد');
      }
      setOpen(false);
      onChanged();
    } catch (e: any) {
      toast.error(e?.message || 'خطا');
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm('این قفسه حذف شود؟')) return;
    await StorageService.deleteShelf(id);
    toast.success('حذف شد');
    onChanged();
  };

  const list = shelves
    .filter((s) => filterSpace === 'all' || s.spaceId === Number(filterSpace))
    .filter((s) => filterZone === 'all' || s.zoneId === Number(filterZone))
    .filter(
      (s) =>
        s.code.toLowerCase().includes(search.toLowerCase()) ||
        (s.name || '').toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
        <div>
          <CardTitle>قفسه‌ها</CardTitle>
          <CardDescription>کوچک‌ترین واحد قابل اشاره برای قرار دادن یا برداشت محصول</CardDescription>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Input
            placeholder="جستجو در کد یا نام…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
          />
          <Select value={filterSpace} onValueChange={(v) => { setFilterSpace(v); setFilterZone('all'); }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="فضا" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه فضاها</SelectItem>
              {spaces.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterZone} onValueChange={setFilterZone}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="بخش" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه بخش‌ها</SelectItem>
              {zones
                .filter((z) => filterSpace === 'all' || z.spaceId === Number(filterSpace))
                .map((z) => (
                  <SelectItem key={z.id} value={z.id.toString()}>
                    {z.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button onClick={openNew} disabled={spaces.length === 0} className="gap-2">
            <Plus className="h-4 w-4" /> قفسه جدید
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {list.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="قفسه‌ای پیدا نشد"
            desc="ابتدا یک فضا بسازید سپس قفسه‌ها را تعریف کنید"
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>کد</TableHead>
                  <TableHead>نام</TableHead>
                  <TableHead>فضا</TableHead>
                  <TableHead>بخش</TableHead>
                  <TableHead>طبقه</TableHead>
                  <TableHead>اشغال</TableHead>
                  <TableHead className="text-left">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((s) => {
                  const space = spaces.find((sp) => sp.id === s.spaceId);
                  const zone = zones.find((z) => z.id === s.zoneId);
                  const pct = usagePct(s.used, s.capacity);
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">{s.code}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{s.name || '—'}</TableCell>
                      <TableCell>{space?.name || '—'}</TableCell>
                      <TableCell>{zone?.name || '—'}</TableCell>
                      <TableCell>{s.level ? s.level.toLocaleString('fa-IR') : '—'}</TableCell>
                      <TableCell className="min-w-[180px]">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">
                            {s.used.toLocaleString('fa-IR')} / {s.capacity.toLocaleString('fa-IR')}
                          </span>
                          <span className="font-medium">{pct}٪</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full ${usageColor(pct)}`} style={{ width: `${pct}%` }} />
                        </div>
                      </TableCell>
                      <TableCell className="flex gap-1 justify-end">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(s.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editing ? 'ویرایش قفسه' : 'قفسه جدید'}</DialogTitle>
            <DialogDescription>کد قفسه باید یکتا باشد تا انباردار در زمان برداشت دقیقاً بداند کجا برود.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="spaceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>فضا</FormLabel>
                      <Select onValueChange={(v) => { field.onChange(Number(v)); form.setValue('zoneId', undefined); }} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="انتخاب فضا" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {spaces.map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zoneId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>بخش (اختیاری)</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(v === 'none' ? undefined : Number(v))}
                        value={field.value ? field.value.toString() : 'none'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="انتخاب بخش" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">بدون بخش</SelectItem>
                          {availableZones.map((z) => (
                            <SelectItem key={z.id} value={z.id.toString()}>{z.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>کد قفسه</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: S-A1-01" {...field} />
                      </FormControl>
                      <FormDescription>این کد روی برچسب قفسه چاپ می‌شود</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نام (اختیاری)</FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: قفسه نوشابه" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ظرفیت</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>طبقه</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="۱" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="row"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ردیف</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="column"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ستون</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="submit">{editing ? 'ذخیره' : 'افزودن'}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ===== Empty state =====
function EmptyState({ icon: Icon, title, desc }: { icon: typeof Building2; title: string; desc: string }) {
  return (
    <div className="text-center py-12 border-2 border-dashed rounded-xl">
      <div className="h-14 w-14 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <div className="font-medium">{title}</div>
      <div className="text-sm text-muted-foreground mt-1">{desc}</div>
    </div>
  );
}
