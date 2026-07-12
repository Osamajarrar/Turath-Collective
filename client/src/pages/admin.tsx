// Internal admin view — DEFERRED groundwork, deliberately NOT registered in
// App.tsx (same pattern as the unrouted auth pages) and never linked from the
// public site. It talks to the /api/admin/* routes in server/admin.ts, which
// are themselves disabled until AUTH_ENABLED + ADMIN_ENABLED are flipped and
// the caller's email is in ADMIN_EMAILS. To try it, add a route for it in
// App.tsx locally.
//
// Internal-only tool: copy is intentionally English-only (not run through
// i18n) — it is for the founder, not customers.

import { useCallback, useEffect, useState } from "react";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@shared/schema";

interface InventoryEntry {
  quantity: number;
  updatedAt: string;
}

type Inventory = Record<string, InventoryEntry>;
type Categories = Record<string, string>;

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.message ?? `${res.status}`);
  return res.json();
}

async function putJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.message ?? `${res.status}`);
  return res.json();
}

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
      {children}
    </h2>
  );
}

function ErrorNote({ message }: { message: string }) {
  return <p className="text-sm text-destructive">{message}</p>;
}

export default function AdminPage() {
  const [inventory, setInventory] = useState<Inventory>({});
  const [categories, setCategories] = useState<Categories>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newSku, setNewSku] = useState("");
  const [newHandle, setNewHandle] = useState("");

  const load = useCallback(async () => {
    const next: Record<string, string> = {};
    await Promise.all([
      getJson<{ inventory: Inventory }>("/api/admin/inventory")
        .then((d) => setInventory(d.inventory))
        .catch((e) => (next.inventory = e.message)),
      getJson<{ categories: Categories }>("/api/admin/categories")
        .then((d) => setCategories(d.categories))
        .catch((e) => (next.categories = e.message)),
      getJson<{ orders: Order[] }>("/api/admin/orders")
        .then((d) => setOrders(d.orders))
        .catch((e) => (next.orders = e.message)),
    ]);
    setErrors(next);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveQuantity = async (sku: string, quantity: number) => {
    try {
      await putJson(`/api/admin/inventory/${encodeURIComponent(sku)}`, { quantity });
      await load();
    } catch (e) {
      setErrors((prev) => ({ ...prev, inventory: (e as Error).message }));
    }
  };

  const saveCategory = async (handle: string, category: string) => {
    try {
      await putJson(`/api/admin/categories/${encodeURIComponent(handle)}`, { category });
      await load();
    } catch (e) {
      setErrors((prev) => ({ ...prev, categories: (e as Error).message }));
    }
  };

  const saveOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      await putJson(`/api/admin/orders/${encodeURIComponent(id)}/status`, { status });
      await load();
    } catch (e) {
      setErrors((prev) => ({ ...prev, orders: (e as Error).message }));
    }
  };

  const inputClass =
    "border-b border-border bg-transparent py-1 text-sm focus:border-primary focus:outline-none";

  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-12 md:px-12">
      <div className="mx-auto max-w-3xl space-y-16">
        <header>
          <h1 className="font-serif text-4xl mb-2">Admin</h1>
          <p className="text-sm text-muted-foreground">
            Internal tools — inventory, orders, categories. Not linked from the public site.
          </p>
        </header>

        <section>
          <SectionHeading>Inventory per SKU</SectionHeading>
          {errors.inventory && <ErrorNote message={errors.inventory} />}
          <ul className="space-y-3">
            {Object.entries(inventory).map(([sku, entry]) => (
              <li key={sku} className="flex items-center gap-4">
                <span className="flex-1 text-sm">{sku}</span>
                <input
                  type="number"
                  min={0}
                  defaultValue={entry.quantity}
                  className={`${inputClass} w-24 text-right`}
                  onBlur={(e) => {
                    const q = Number(e.target.value);
                    if (Number.isInteger(q) && q >= 0 && q !== entry.quantity) saveQuantity(sku, q);
                  }}
                />
                <span className="text-xs text-muted-foreground">
                  updated {new Date(entry.updatedAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
          <form
            className="mt-4 flex gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const sku = newSku.trim();
              if (sku) {
                saveQuantity(sku, 0);
                setNewSku("");
              }
            }}
          >
            <input
              value={newSku}
              onChange={(e) => setNewSku(e.target.value)}
              placeholder="Add SKU"
              className={`${inputClass} flex-1`}
            />
            <button type="submit" className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Add
            </button>
          </form>
        </section>

        <section>
          <SectionHeading>Order tracking</SectionHeading>
          {errors.orders && <ErrorNote message={errors.orders} />}
          {orders.length === 0 && !errors.orders && (
            <p className="text-sm text-muted-foreground">No orders recorded.</p>
          )}
          <ul className="space-y-3">
            {orders.map((order) => (
              <li key={order.id} className="flex items-center gap-4">
                <span className="flex-1 text-sm">
                  {order.id.slice(0, 8)} — {order.totalAmount} {order.currencyCode} —{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
                <select
                  value={order.status}
                  onChange={(e) => saveOrderStatus(order.id, e.target.value as OrderStatus)}
                  className={`${inputClass} cursor-pointer`}
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <SectionHeading>Category per product</SectionHeading>
          {errors.categories && <ErrorNote message={errors.categories} />}
          <ul className="space-y-3">
            {Object.entries(categories).map(([handle, category]) => (
              <li key={handle} className="flex items-center gap-4">
                <span className="flex-1 text-sm">{handle}</span>
                <input
                  defaultValue={category}
                  className={`${inputClass} w-40`}
                  onBlur={(e) => {
                    const c = e.target.value.trim();
                    if (c && c !== category) saveCategory(handle, c);
                  }}
                />
              </li>
            ))}
          </ul>
          <form
            className="mt-4 flex gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const handle = newHandle.trim();
              if (handle) {
                saveCategory(handle, "ceramics");
                setNewHandle("");
              }
            }}
          >
            <input
              value={newHandle}
              onChange={(e) => setNewHandle(e.target.value)}
              placeholder="Add product handle"
              className={`${inputClass} flex-1`}
            />
            <button type="submit" className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Add
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
