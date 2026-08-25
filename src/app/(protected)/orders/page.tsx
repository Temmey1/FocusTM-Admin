"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, formatNaira } from "@/lib/api";
import { Order, OrderStatus } from "@/types";
import toast from "react-hot-toast";
import { Copy, X as ClearIcon } from "lucide-react";

const STATUS_OPTIONS: OrderStatus[] = ["pending","paid","processing","shipped","completed","cancelled"];
const statusStyle: Record<OrderStatus,string> = {
  pending: "border-ftm-linelt text-ftm-muted", paid: "border-ftm-white text-ftm-white",
  processing: "border-ftm-offwhite text-ftm-offwhite", shipped: "border-ftm-offwhite text-ftm-offwhite",
  completed: "border-ftm-white text-ftm-white", cancelled: "border-red-800 text-red-400",
};

const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL;

function TableSkeleton() {
  return <div className="border border-ftm-line p-1">{Array.from({length:6}).map((_,i)=><div key={i} className="h-14 ftm-skeleton my-1" />)}</div>;
}

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const uidFilter = searchParams.get("uid");

  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail]   = useState<Order|null>(null);

  const load = () => {
    api.get<Order[]>("/orders").then((r)=>setOrders(r.data||[])).catch(()=>setOrders([])).finally(()=>setLoading(false));
  };
  useEffect(load,[]);

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      setOrders((o) => o.map((x) => x.id === id ? { ...x, status } : x));
      if (detail?.id === id) setDetail((d) => d ? { ...d, status } : d);
      toast.success(`Status updated to ${status}`);
    } catch { toast.error("Failed to update status"); }
  };

  const copyTrackLink = (orderNumber: string) => {
    const link = `${STORE_URL}/track/${orderNumber}`;
    navigator.clipboard.writeText(link);
    toast.success("Tracking link copied");
  };

  const visibleOrders = uidFilter ? orders.filter((o: any) => o.userId === uidFilter) : orders;

  const thCls = "text-left px-5 py-3 text-[8px] uppercase tracking-[0.25em] text-ftm-muted font-normal border-b border-ftm-line";
  const tdCls = "px-5 py-4 text-[12px]";

  return (
    <div>
      <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.35em] text-ftm-muted mb-2">Manage</p>
          <h1 className="font-display font-light text-[clamp(26px,3.5vw,44px)]">Orders</h1>
        </div>
        {uidFilter && (
          <a href="/orders" className="flex items-center gap-2 px-4 py-2 border border-ftm-line text-[9px] uppercase tracking-[0.2em] text-ftm-muted hover:text-ftm-white transition-colors">
            <ClearIcon className="h-3 w-3" /> Filtered by customer — clear
          </a>
        )}
      </div>

      {loading ? <TableSkeleton /> : visibleOrders.length === 0 ? (
        <div className="border border-ftm-line p-12 text-center">
          <p className="text-ftm-muted text-[12px] leading-[1.8]">
            {uidFilter ? "This customer has no orders yet." : (
              <>No orders yet. Orders placed on the store appear here via{" "}
                <code className="text-ftm-offwhite bg-ftm-charcoal px-1.5 py-0.5">GET /orders</code>.</>
            )}
          </p>
        </div>
      ) : (
        <div className="border border-ftm-line overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ftm-deep">
              <tr>
                <th className={thCls}>Order #</th><th className={thCls}>Customer</th>
                <th className={thCls}>Total</th><th className={thCls}>Payment</th>
                <th className={thCls}>Status</th><th className={thCls}>Date</th>
                <th className={thCls}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleOrders.map((o,i) => (
                <tr key={o.id} className={`border-t border-ftm-line ${i%2===0?"bg-ftm-black":"bg-ftm-deep"}`}>
                  <td className={`${tdCls} font-mono text-[10px] text-ftm-offwhite`}>{o.orderNumber || o.id}</td>
                  <td className={`${tdCls} text-ftm-white`}>
                    <div>{o.delivery?.fullName}</div>
                    <div className="text-ftm-muted text-[10px]">{o.delivery?.phone}</div>
                  </td>
                  <td className={`${tdCls} font-display text-[14px]`}>{formatNaira(o.total)}</td>
                  <td className={`${tdCls} text-ftm-muted capitalize`}>{o.paymentMethod}</td>
                  <td className={tdCls}>
                    <select value={o.status} onChange={(e)=>updateStatus(o.id,e.target.value as OrderStatus)}
                      className={`bg-transparent border text-[9px] uppercase tracking-wider px-2 py-1 outline-none appearance-none cursor-pointer transition-colors ${statusStyle[o.status]}`}
                    >
                      {STATUS_OPTIONS.map((s)=><option key={s} value={s} className="bg-ftm-black normal-case">{s}</option>)}
                    </select>
                  </td>
                  <td className={`${tdCls} text-ftm-muted text-[10px]`}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-NG") : "—"}</td>
                  <td className={tdCls}>
                    <button onClick={()=>setDetail(o)} className="text-ftm-muted hover:text-ftm-white transition-colors text-[10px] uppercase tracking-wider mr-4">View</button>
                    <button onClick={()=>copyTrackLink(o.orderNumber || o.id)} className="text-ftm-muted hover:text-ftm-white transition-colors inline-flex items-center gap-1 text-[10px] uppercase tracking-wider">
                      <Copy className="h-3 w-3" /> Link
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={()=>setDetail(null)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-ftm-deep border-l border-ftm-line overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-7">
              <h2 className="font-display font-light text-[20px]">Order Detail</h2>
              <button onClick={()=>setDetail(null)} className="text-ftm-muted hover:text-ftm-white transition-colors text-xl">×</button>
            </div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-ftm-muted mb-1">Order Number</p>
            <div className="flex items-center gap-2 mb-5">
              <p className="font-mono text-[12px] text-ftm-offwhite">{detail.orderNumber || detail.id}</p>
              <button onClick={()=>copyTrackLink(detail.orderNumber || detail.id)} className="text-ftm-dim hover:text-ftm-white transition-colors"><Copy className="h-3 w-3" /></button>
            </div>

            <p className="text-[9px] uppercase tracking-[0.2em] text-ftm-muted mb-1">Customer</p>
            <p className="text-[13px] mb-1">{detail.delivery?.fullName}</p>
            <p className="text-[12px] text-ftm-muted mb-5">{detail.delivery?.phone}{detail.delivery?.email ? ` · ${detail.delivery.email}` : ""}</p>

            <p className="text-[9px] uppercase tracking-[0.2em] text-ftm-muted mb-1">Delivery</p>
            <p className="text-[12px] text-ftm-muted mb-5 capitalize">
              {detail.delivery?.method} · {detail.delivery?.state}{detail.delivery?.city ? `, ${detail.delivery.city}` : ""}
              {detail.delivery?.address ? <><br />{detail.delivery.address}</> : ""}
            </p>

            <div className="ftm-divider-solid my-5" />
            <p className="text-[9px] uppercase tracking-[0.2em] text-ftm-muted mb-3">Items</p>
            <div className="flex flex-col gap-3 mb-5">
              {detail.items.map((item,i)=>(
                <div key={i} className="flex justify-between text-[12px]">
                  <span className="text-ftm-muted">{item.name} × {item.quantity}<br/>
                    <span className="text-[10px]">{item.size} · {item.color}{item.customNote ? ` · ${item.customNote}` : ""}</span>
                  </span>
                  <span>{formatNaira(item.price*item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="ftm-divider-solid my-3" />
            <div className="flex justify-between text-[12px] text-ftm-muted mb-1"><span>Subtotal</span><span>{formatNaira(detail.subtotal)}</span></div>
            <div className="flex justify-between text-[12px] text-ftm-muted mb-3"><span>Delivery</span><span>{formatNaira(detail.deliveryFee)}</span></div>
            <div className="flex justify-between font-display text-[18px]"><span>Total</span><span>{formatNaira(detail.total)}</span></div>

            <div className="ftm-divider-solid my-5" />
            <p className="text-[9px] uppercase tracking-[0.2em] text-ftm-muted mb-3">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((s)=>(
                <button key={s} onClick={()=>updateStatus(detail.id,s)}
                  className={`px-3 py-2 text-[9px] uppercase tracking-wider border transition-colors ${detail.status===s ? "border-ftm-white text-ftm-white" : "border-ftm-line text-ftm-muted hover:border-ftm-offwhite"}`}
                >{s}</button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
