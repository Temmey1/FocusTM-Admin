"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { AdminUser } from "@/types";
import { Users as UsersIcon } from "lucide-react";

function TableSkeleton() {
  return (
    <div className="border border-ftm-line p-1">
      {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 ftm-skeleton my-1" />)}
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers]           = useState<AdminUser[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  const load = (pageToken?: string) => {
    const setter = pageToken ? setLoadingMore : setLoading;
    setter(true);
    api.get("/admin/users", { params: pageToken ? { pageToken } : {} })
      .then((r) => {
        setUsers((prev) => pageToken ? [...prev, ...r.data.users] : r.data.users);
        setNextPageToken(r.data.nextPageToken || null);
      })
      .catch(() => setUsers([]))
      .finally(() => setter(false));
  };
  useEffect(() => load(), []);

  const thCls = "text-left px-5 py-3 text-[8px] uppercase tracking-[0.25em] text-ftm-muted font-normal border-b border-ftm-line";
  const tdCls = "px-5 py-4 text-[12px]";

  return (
    <div>
      <div className="mb-8">
        <p className="text-[9px] uppercase tracking-[0.35em] text-ftm-muted mb-2">Manage</p>
        <h1 className="font-display font-light text-[clamp(26px,3.5vw,44px)] mb-2">Customers</h1>
        <p className="text-[12px] text-ftm-muted max-w-md">
          Everyone who has created an account on the store, pulled directly from Firebase Authentication.
        </p>
      </div>

      {loading ? <TableSkeleton /> : users.length === 0 ? (
        <div className="border border-ftm-line p-10 text-center">
          <UsersIcon className="h-6 w-6 mx-auto mb-3 text-ftm-dim" />
          <p className="text-ftm-muted text-[12px]">No registered customers yet — accounts appear here as people sign up on the store.</p>
        </div>
      ) : (
        <>
          <div className="border border-ftm-line overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ftm-deep">
                <tr>
                  <th className={thCls}>Email</th><th className={thCls}>Phone</th>
                  <th className={thCls}>Joined</th><th className={thCls}>Last Sign-In</th>
                  <th className={thCls}>Role</th><th className={thCls}>Orders</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.uid} className={`border-t border-ftm-line ${i%2===0?"bg-ftm-black":"bg-ftm-deep"}`}>
                    <td className={`${tdCls} text-ftm-white`}>{u.email || "—"}</td>
                    <td className={`${tdCls} text-ftm-muted`}>{u.phoneNumber || "—"}</td>
                    <td className={`${tdCls} text-ftm-muted`}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-NG") : "—"}</td>
                    <td className={`${tdCls} text-ftm-muted`}>{u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleDateString("en-NG") : "—"}</td>
                    <td className={tdCls}>
                      {u.admin ? (
                        <span className="text-[9px] uppercase tracking-wider border border-ftm-white text-ftm-white px-2 py-1">Admin</span>
                      ) : (
                        <span className="text-[9px] uppercase tracking-wider text-ftm-dim">Customer</span>
                      )}
                    </td>
                    <td className={tdCls}>
                      <Link href={`/orders?uid=${u.uid}`} className="text-ftm-muted hover:text-ftm-white transition-colors text-[10px] uppercase tracking-wider underline-slide">View Orders</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {nextPageToken && (
            <div className="mt-6 text-center">
              <button onClick={() => load(nextPageToken)} disabled={loadingMore}
                className="px-8 py-3 border border-ftm-line text-[10px] uppercase tracking-[0.2em] text-ftm-muted hover:border-ftm-offwhite hover:text-ftm-white transition-colors disabled:opacity-40"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
