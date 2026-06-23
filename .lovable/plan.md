# Enterprise Order Module Rebuild

Transforms `OrderFormDialog` into a 4-step enterprise wizard, plus adds a returns flow, wired to products, inventory, finance and users.

## Step 1 — Customer (lookup or quick-create)
`CustomerPicker` component:
- Debounced search over `UserService.getAllUsers()` filtered by phone/firstName/lastName/username. Dropdown shows matches with name + phone + role badge; click selects and locks `customerId`.
- "ثبت سریع مشتری جدید" inline panel: firstName, lastName, phone (required), email/address (optional). Submits via `UserService.createUser({ ..., roleIds: [customerRoleId] })`. Customer role id resolved from `UserService.getAllRoles()` (matches "Customer"/"مشتری"); auto-creates it via `createRole` if missing. Cached with React Query.
- `Order` gains `customerId?: string`.

## Step 2 — Products (hundreds-scale picker)
Rewrite `ProductSelector` UI:
- Left rail: **category tree** via existing `buildCategoryTree`, with:
  - Sticky search (matches name; auto-expands ancestors of hits).
  - Pinned recent/favorite categories (per-user `localStorage`).
  - Keyboard nav (↑/↓/Enter), product-count badges.
- Top: **brand chips** (multi-select) loaded from `BrandService`, filtered by selected category.
- Main: product results with search, weight/piece badge, qty stepper (existing behavior preserved).
- Categories/brands via React Query (`staleTime: 5min`) with skeletons.

## Step 3 — Payment & Discount
New `PaymentPanel`:
- Discount: percent | amount → updates `discountAmount`, `finalTotal`.
- Hybrid payment splits — repeatable rows `{ method, amount, reference?, gatewayTxnId?, dueDate? }`.
  - Methods: cash, card, bank_transfer, online_gateway, wallet, cheque, credit (طلب/قسط).
  - Live validator: Σ splits === `finalTotal` (badge shows remaining/overpaid).
  - `card`/`online_gateway` require `gatewayTxnId`; `credit` requires `dueDate`.
- Computed `paymentStatus`: paid | partial | unpaid.

## Step 4 — Summary
Customer card + items table + totals breakdown (subtotal, discount, final) + payments recap + submit.

## Backend sync (planned endpoints, mirrors existing service patterns)
- New `OrderService` → POST `/api/Order/orders` with full payload `{ customerId, items, discount, payments, total, finalTotal, paymentStatus, notes }`.
- `submitOrderWithFinance()` helper: after order create, loops `payments` and calls `FinanceService.createTransaction({ type:'sale', method, amount, reference: orderId, gatewayTxnId })` so finance dashboards stay in sync.
- Inventory: existing `InventoryEngine` shelf-decrement already wired; backend is source of truth.

## Returns flow (new)
- `ReturnOrderDialog` in `src/pages/orders/ReturnedOrders.tsx`:
  - Pick order (search by code/customer), list items with return-qty inputs + per-item reason (defect/wrong-item/changed-mind/expired/other).
  - Refund panel reuses `PaymentPanel` splits (cash, card-reverse w/ gatewayTxnId, wallet/store-credit).
  - Submit → `OrderService.createReturn(orderId, ...)` restocks inventory and creates `FinanceService.createTransaction({ type:'refund', ... })` per refund split.

## Files

**New**
- `src/components/orders/CustomerPicker.tsx`
- `src/components/orders/CategoryTreePicker.tsx`
- `src/components/orders/BrandChips.tsx`
- `src/components/orders/PaymentPanel.tsx`
- `src/components/orders/ReturnOrderDialog.tsx`
- `src/services/order-service.ts`
- `src/types/payment.ts`

**Edited**
- `src/types/order.ts` — add `customerId`, `discount`, `payments[]`, `finalTotal`, `paymentStatus`.
- `src/components/orders/OrderFormDialog.tsx` — 4-tab wizard.
- `src/components/orders/ProductSelector.tsx` — replace flat filters with `CategoryTreePicker` + `BrandChips`.
- `src/pages/orders/ReturnedOrders.tsx` — wire return dialog.

## Out of scope
- Real backend implementation (uses planned endpoints + optimistic UI, same pattern as `inventory-input-service`).
- Tax engine (handled separately by finance).

## Conventions
- All money via existing `PriceInput` / `formatPrice` / `formatPersianNumber` (Latin in inputs, Persian in display).
- Validation via Zod on submit + inline `toast.error`.
- React Query for all server data with cached role/category/brand lookups.
