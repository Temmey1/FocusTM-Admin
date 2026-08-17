"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, formatNaira } from "@/lib/api";
import { DeliveryLocation } from "@/types";
import { nigeriaStates } from "@/lib/nigeriaStates";
import toast from "react-hot-toast";
import { X, Plus, MapPin } from "lucide-react";

const inputCls  = "w-full bg-transparent border border-ftm-line px-4 py-2.5 text-[12px] text-ftm-white placeholder:text-ftm-dim focus:border-ftm-offwhite outline-none transition-colors";
const selectCls = "w-full bg-ftm-black border border-ftm-line px-4 py-2.5 text-[12px] text-ftm-white focus:border-ftm-offwhite outline-none transition-colors appearance-none";

const empty = (): Partial<DeliveryLocation> => ({ type: "delivery", state: nigeriaStates[0], city: "", address: "", fee: 0, active: true, note: "" });

function TableSkeleton() {
  return (
    <div className="border border-ftm-line p-1">
      {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 ftm-skeleton my-1" />)}
    </div>
  );
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState<"add"|"edit"|null>(null);
  const [form, setForm]           = useState<Partial<DeliveryLocation>>(empty());
  const [saving, setSaving]       = useState(false);
  const [filter, setFilter]       = useState<"all"|"delivery"|"pickup">("all");

  const load = () => {
    setLoading(true);
    api.get<DeliveryLocation[]>("/locations/all").then((r) => setLocations(r.data || [])).catch(() => setLocations([])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd  = () => { setForm(empty()); setModal("add"); };
  const openEdit = (l: DeliveryLocation) => { setForm({ ...l }); setModal("edit"); };
  const closeModal = () => { setModal(null); setForm(empty()); };

  const handleSave = async () => {
    if (!form.state || form.fee === undefined) { toast.error("State and fee are required."); return; }
    if (form.type === "pickup" && !form.address) { toast.error("Pickup locations need an address."); return; }
    setSaving(true);
    try {
      if (modal === "add") {
        const r = await api.post<DeliveryLocation>("/locations", form);
        setLocations((l) => [r.data, ...l]);
        toast.success("Location added");
      } else {
        const r = await api.put<DeliveryLocation>(`/locations/${form.id}`, form);
        setLocations((l) => l.map((x) => x.id === form.id ? r.data : x));
        toast.success("Location updated");
      }
      closeModal();
    } catch { toast.error("Failed to save — check backend connection"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this location?")) return;
    try { await api.delete(`/locations/${id}`); setLocations((l) => l.filter((x) => x.id !== id)); toast.success("Deleted"); }
    catch { toast.error("Delete failed"); }
  };

  const toggleActive = async (loc: DeliveryLocation) => {
    try {
      const r = await api.put<DeliveryLocation>(`/locations/${loc.id}`, { active: !loc.active });
      setLocations((l) => l.map((x) => x.id === loc.id ? r.data : x));
    } catch { toast.error("Could not update"); }
  };

  const filtered = filter === "all" ? locations : locations.filter((l) => l.type === filter);
  const thCls = "text-left px-5 py-3 text-[8px] uppercase tracking-[0.25em] text-ftm-muted font-normal border-b border-ftm-line";
  const tdCls = "px-5 py-4 text-[12px]";

  return (
    <div>
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.35em] text-ftm-muted mb-2">Manage</p>
          <h1 className="font-display font-light text-[clamp(26px,3.5vw,44px)]">Delivery Locations</h1>
          <p className="text-[12px] text-ftm-muted mt-2 max-w-md">
            States and pickup points shown to customers at checkout, with their delivery fees.
          </p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-5 py-3 bg-ftm-white text-ftm-black text-[10px] uppercase tracking-[0.18em] hover:bg-ftm-offwhite transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add Location
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {(["all","delivery","pickup"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 text-[9px] uppercase tracking-[0.2em] border transition-colors capitalize ${filter===f ? "border-ftm-white text-ftm-white" : "border-ftm-line text-ftm-muted hover:border-ftm-offwhite"}`}
          >{f}</button>
        ))}
      </div>

      {loading ? <TableSkeleton /> : filtered.length === 0 ? (
        <div className="border border-ftm-line p-10 text-center">
          <MapPin className="h-6 w-6 mx-auto mb-3 text-ftm-dim" />
          <p className="text-ftm-muted text-[12px]">No locations yet. The store falls back to a flat ₦2,500 fee for all states until you add some here.</p>
        </div>
      ) : (
        <div className="border border-ftm-line overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ftm-deep">
              <tr>
                <th className={thCls}>Type</th><th className={thCls}>State</th><th className={thCls}>City / Address</th>
                <th className={thCls}>Fee</th><th className={thCls}>Active</th><th className={thCls}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => (
                <tr key={l.id} className={`border-t border-ftm-line ${i%2===0?"bg-ftm-black":"bg-ftm-deep"}`}>
                  <td className={`${tdCls} capitalize text-ftm-muted`}>{l.type}</td>
                  <td className={`${tdCls} text-ftm-white`}>{l.state}</td>
                  <td className={`${tdCls} text-ftm-muted`}>{l.type === "pickup" ? l.address : l.city || "—"}</td>
                  <td className={`${tdCls} font-display text-[14px]`}>{l.fee === 0 ? "Free" : formatNaira(l.fee)}</td>
                  <td className={tdCls}>
                    <button onClick={() => toggleActive(l)}
                      className={`text-[9px] uppercase tracking-wider px-2 py-1 border transition-colors ${l.active ? "border-ftm-white text-ftm-white" : "border-ftm-line text-ftm-dim"}`}
                    >{l.active ? "Active" : "Inactive"}</button>
                  </td>
                  <td className={tdCls}>
                    <button onClick={() => openEdit(l)} className="text-ftm-muted hover:text-ftm-white transition-colors mr-5 text-[10px] uppercase tracking-wider">Edit</button>
                    <button onClick={() => handleDelete(l.id)} className="text-ftm-muted hover:text-red-400 transition-colors text-[10px] uppercase tracking-wider">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" onClick={closeModal} />
            <motion.div initial={{opacity:0,y:32}} animate={{opacity:1,y:0}} exit={{opacity:0,y:20}} transition={{duration:0.35,ease:[.22,1,.36,1]}} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-ftm-deep border border-ftm-line w-full max-w-md p-8">
                <div className="flex items-center justify-between mb-7">
                  <h2 className="font-display font-light text-[22px]">{modal === "add" ? "Add Location" : "Edit Location"}</h2>
                  <button onClick={closeModal} className="text-ftm-muted hover:text-ftm-white transition-colors"><X className="h-5 w-5"/></button>
                </div>

                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-[8px] uppercase tracking-[0.25em] text-ftm-muted block mb-1.5">Type *</label>
                    <div className="flex gap-2">
                      {(["delivery","pickup"] as const).map((t) => (
                        <button key={t} onClick={() => setForm({...form, type: t})}
                          className={`flex-1 py-2.5 text-[10px] uppercase tracking-wider border capitalize transition-colors ${form.type===t ? "border-ftm-white text-ftm-white" : "border-ftm-line text-ftm-muted"}`}
                        >{t}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[8px] uppercase tracking-[0.25em] text-ftm-muted block mb-1.5">State *</label>
                    <select value={form.state} onChange={(e)=>setForm({...form,state:e.target.value})} className={selectCls}>
                      {nigeriaStates.map((s) => <option key={s} value={s} className="bg-ftm-black">{s}</option>)}
                    </select>
                  </div>

                  {form.type === "pickup" ? (
                    <>
                      <div>
                        <label className="text-[8px] uppercase tracking-[0.25em] text-ftm-muted block mb-1.5">City</label>
                        <input value={form.city||""} onChange={(e)=>setForm({...form,city:e.target.value})} className={inputCls} placeholder="Ikorodu" />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase tracking-[0.25em] text-ftm-muted block mb-1.5">Pickup Address *</label>
                        <textarea value={form.address||""} onChange={(e)=>setForm({...form,address:e.target.value})} rows={2} className={`${inputCls} resize-none`} placeholder="Full pickup point address" />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="text-[8px] uppercase tracking-[0.25em] text-ftm-muted block mb-1.5">City (optional)</label>
                      <input value={form.city||""} onChange={(e)=>setForm({...form,city:e.target.value})} className={inputCls} placeholder="Leave blank to cover the whole state" />
                    </div>
                  )}

                  <div>
                    <label className="text-[8px] uppercase tracking-[0.25em] text-ftm-muted block mb-1.5">Fee (₦) *</label>
                    <input type="number" value={form.fee ?? ""} onChange={(e)=>setForm({...form,fee:Number(e.target.value)})} className={inputCls} placeholder="2500" />
                  </div>

                  <div>
                    <label className="text-[8px] uppercase tracking-[0.25em] text-ftm-muted block mb-1.5">Note (optional)</label>
                    <input value={form.note||""} onChange={(e)=>setForm({...form,note:e.target.value})} className={inputCls} placeholder="e.g. 2-3 business days" />
                  </div>

                  <label className="flex items-center gap-2 text-[10px] text-ftm-muted cursor-pointer">
                    <input type="checkbox" checked={!!form.active} onChange={(e)=>setForm({...form,active:e.target.checked})} className="accent-ftm-white" />
                    Active — visible to customers at checkout
                  </label>
                </div>

                <button onClick={handleSave} disabled={saving}
                  className="mt-8 w-full py-4 bg-ftm-white text-ftm-black text-[10px] uppercase tracking-[0.22em] hover:bg-ftm-offwhite transition-colors disabled:opacity-40"
                >
                  {saving ? "Saving..." : modal === "add" ? "Add Location" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
