"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CustomOrder, CustomOrderStatus } from "@/types";
import toast from "react-hot-toast";
import { PenSquare } from "lucide-react";

const STATUS_OPTIONS: CustomOrderStatus[] = ["new","reviewing","quoted","in_progress","completed","declined"];
const statusStyle: Record<CustomOrderStatus,string> = {
  new: "border-ftm-linelt text-ftm-muted", reviewing: "border-ftm-offwhite text-ftm-offwhite",
  quoted: "border-ftm-offwhite text-ftm-offwhite", in_progress: "border-ftm-white text-ftm-white",
  completed: "border-ftm-white text-ftm-white", declined: "border-red-800 text-red-400",
};

function TableSkeleton() {
  return <div className="border border-ftm-line p-1">{Array.from({length:5}).map((_,i)=><div key={i} className="h-14 ftm-skeleton my-1" />)}</div>;
}

export default function CustomOrdersPage() {
  const [requests, setRequests] = useState<CustomOrder[]>([]);
  const [loading, setLoading]   = useState(true);
  const [detail, setDetail]     = useState<CustomOrder|null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const load = () => {
    api.get<CustomOrder[]>("/custom-orders").then((r)=>setRequests(r.data||[])).catch(()=>setRequests([])).finally(()=>setLoading(false));
  };
  useEffect(load,[]);

  const openDetail = (r: CustomOrder) => { setDetail(r); setNoteDraft(r.adminNote || ""); };

  const updateRequest = async (id: string, patch: Partial<CustomOrder>) => {
    try {
      const r = await api.put(`/custom-orders/${id}`, patch);
      setRequests((rs) => rs.map((x) => x.id === id ? r.data : x));
      if (detail?.id === id) setDetail(r.data);
      toast.success("Updated");
    } catch { toast.error("Update failed"); }
  };

  const thCls = "text-left px-5 py-3 text-[8px] uppercase tracking-[0.25em] text-ftm-muted font-normal border-b border-ftm-line";
  const tdCls = "px-5 py-4 text-[12px]";

  return (
    <div>
      <div className="mb-8">
        <p className="text-[9px] uppercase tracking-[0.35em] text-ftm-muted mb-2">Manage</p>
        <h1 className="font-display font-light text-[clamp(26px,3.5vw,44px)] mb-2">Custom Order Requests</h1>
        <p className="text-[12px] text-ftm-muted max-w-md">Custom apparel requests submitted from the store&apos;s Custom Order page.</p>
      </div>

      {loading ? <TableSkeleton /> : requests.length === 0 ? (
        <div className="border border-ftm-line p-10 text-center">
          <PenSquare className="h-6 w-6 mx-auto mb-3 text-ftm-dim" />
          <p className="text-ftm-muted text-[12px]">No custom order requests yet.</p>
        </div>
      ) : (
        <div className="border border-ftm-line overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ftm-deep">
              <tr>
                <th className={thCls}>Reference</th><th className={thCls}>Customer</th>
                <th className={thCls}>Item</th><th className={thCls}>Budget</th>
                <th className={thCls}>Status</th><th className={thCls}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r,i) => (
                <tr key={r.id} className={`border-t border-ftm-line ${i%2===0?"bg-ftm-black":"bg-ftm-deep"}`}>
                  <td className={`${tdCls} font-mono text-[10px] text-ftm-offwhite`}>{r.requestNumber}</td>
                  <td className={`${tdCls} text-ftm-white`}>
                    <div>{r.fullName}</div>
                    <div className="text-ftm-muted text-[10px]">{r.phone}</div>
                  </td>
                  <td className={`${tdCls} text-ftm-muted`}>{r.itemType}</td>
                  <td className={`${tdCls} text-ftm-muted`}>{r.budget || "—"}</td>
                  <td className={tdCls}>
                    <select value={r.status} onChange={(e)=>updateRequest(r.id, { status: e.target.value as CustomOrderStatus })}
                      className={`bg-transparent border text-[9px] uppercase tracking-wider px-2 py-1 outline-none appearance-none cursor-pointer transition-colors ${statusStyle[r.status]}`}
                    >
                      {STATUS_OPTIONS.map((s)=><option key={s} value={s} className="bg-ftm-black normal-case">{s.replace("_"," ")}</option>)}
                    </select>
                  </td>
                  <td className={tdCls}>
                    <button onClick={()=>openDetail(r)} className="text-ftm-muted hover:text-ftm-white transition-colors text-[10px] uppercase tracking-wider">View</button>
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
              <h2 className="font-display font-light text-[20px]">Request Detail</h2>
              <button onClick={()=>setDetail(null)} className="text-ftm-muted hover:text-ftm-white transition-colors text-xl">×</button>
            </div>

            <p className="text-[9px] uppercase tracking-[0.2em] text-ftm-muted mb-1">Reference</p>
            <p className="font-mono text-[12px] text-ftm-offwhite mb-5">{detail.requestNumber}</p>

            <p className="text-[9px] uppercase tracking-[0.2em] text-ftm-muted mb-1">Customer</p>
            <p className="text-[13px] mb-1">{detail.fullName}</p>
            <p className="text-[12px] text-ftm-muted mb-5">{detail.phone}{detail.email ? ` · ${detail.email}` : ""}</p>

            <p className="text-[9px] uppercase tracking-[0.2em] text-ftm-muted mb-1">Item Type</p>
            <p className="text-[12px] text-ftm-muted mb-5">{detail.itemType}{detail.budget ? ` · Budget: ${detail.budget}` : ""}</p>

            <p className="text-[9px] uppercase tracking-[0.2em] text-ftm-muted mb-1">Description</p>
            <p className="text-[12px] text-ftm-muted mb-5 leading-[1.7] whitespace-pre-wrap">{detail.description}</p>

            {detail.referenceImages?.length > 0 && (
              <>
                <p className="text-[9px] uppercase tracking-[0.2em] text-ftm-muted mb-2">Reference Images</p>
                <div className="flex flex-col gap-1 mb-5">
                  {detail.referenceImages.map((url,i)=>(
                    <a key={i} href={url} target="_blank" rel="noreferrer" className="text-[11px] text-ftm-offwhite underline-slide truncate">{url}</a>
                  ))}
                </div>
              </>
            )}

            <div className="ftm-divider-solid my-5" />
            <p className="text-[9px] uppercase tracking-[0.2em] text-ftm-muted mb-3">Update Status</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {STATUS_OPTIONS.map((s)=>(
                <button key={s} onClick={()=>updateRequest(detail.id,{status:s})}
                  className={`px-3 py-2 text-[9px] uppercase tracking-wider border transition-colors capitalize ${detail.status===s ? "border-ftm-white text-ftm-white" : "border-ftm-line text-ftm-muted hover:border-ftm-offwhite"}`}
                >{s.replace("_"," ")}</button>
              ))}
            </div>

            <p className="text-[9px] uppercase tracking-[0.2em] text-ftm-muted mb-2">Internal Note</p>
            <textarea value={noteDraft} onChange={(e)=>setNoteDraft(e.target.value)} rows={3}
              className="w-full bg-transparent border border-ftm-line px-4 py-3 text-[12px] text-ftm-white placeholder:text-ftm-dim focus:border-ftm-offwhite outline-none resize-none mb-3"
              placeholder="Pricing notes, quote given, etc."
            />
            <button onClick={()=>updateRequest(detail.id,{adminNote:noteDraft})}
              className="w-full py-3 bg-ftm-white text-ftm-black text-[10px] uppercase tracking-[0.2em] hover:bg-ftm-offwhite transition-colors"
            >Save Note</button>
          </div>
        </>
      )}
    </div>
  );
}
