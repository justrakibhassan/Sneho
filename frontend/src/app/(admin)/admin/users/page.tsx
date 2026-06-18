"use client";

import React, { useEffect, useState } from "react";
import proxy from "@/lib/proxy";
import { toast } from "sonner";
import {
  Search,
  Trash2,
  Ban,
  MoreVertical,
  ShieldAlert,
  Filter,
  Undo2,
  Download,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  ShieldCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

// Types
interface IUser {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  role: "PARENT" | "BABYSITTER" | "ADMIN";
  isApproved: boolean;
  isBanned: boolean;
  createdAt: string;
}

export default function AllUsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; 

  const [actionData, setActionData] = useState<{
    id: number;
    type: "ban" | "unban" | "delete" | "change-role";
    targetRole?: string;
  } | null>(null);

  // 1. Fetch Users
  const fetchUsers = async () => {
    try {
      const res = await proxy.get("/admin/users");
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Filter Logic
  useEffect(() => {
    let result = users;

    if (search) {
      result = result.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(search.toLowerCase())) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (roleFilter !== "ALL") {
      result = result.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(result);
    setCurrentPage(1); 
  }, [search, roleFilter, users]);

  // 3. Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // 4. Handle Actions (Confirm Logic)
  const confirmAction = async (overriddenRole?: string) => {
    if (!actionData) return;
    const { id, type } = actionData;

    // Optimistic UI Update
    const previousUsers = [...users];
    const typeStr = type as string;
    if (typeStr === "delete") {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } else if (typeStr === "change-role") {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, role: overriddenRole as IUser["role"] } : u
        )
      );
    } else {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, isBanned: typeStr === "ban" } : u
        )
      );
    }

    try {
      const payload = type === "change-role" ? { action: type, role: overriddenRole } : { action: type };
      const res = await proxy.patch(`/admin/users/${id}`, payload);
      if (res.data.success) {
        toast.success(res.data.message);
        if (type === "change-role") fetchUsers(); // Refresh to sync profiles
      }
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      toast.error("Action failed");
      setUsers(previousUsers); // Rollback
    } finally {
      setActionData(null); 
    }
  };

  const handleSitterApproval = async (id: number) => {
    const toastId = toast.loading("Approving sitter...");
    try {
      const res = await proxy.put(`/admin/approve-sitter/${id}`);
      if (res.data.success) {
        toast.success("Sitter approved", { id: toastId });
        fetchUsers();
      }
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
       toast.error("Approval failed", { id: toastId });
    }
  };

  // 5. Export CSV Feature
  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Name,Email,Role,Status,Joined Date\n" +
      filteredUsers
        .map(
          (u) =>
            `${u.id},${u.name},${u.email},${u.role},${
              u.isBanned ? "Banned" : "Active"
            },${u.createdAt}`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading)
    return (
      <div className="max-w-[1600px] mx-auto space-y-8 pb-10">
        {/* Header Skeleton */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100">
          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-9 w-48" />
              </div>
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-16 w-32 rounded-2xl" />
              <Skeleton className="h-16 w-40 rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Filter Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div className="md:col-span-2 lg:col-span-3">
            <Skeleton className="h-14 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-[2.5rem] border border-slate-50 p-6">
          <div className="space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-14 w-14 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-8 w-24 rounded-xl" />
                <Skeleton className="h-8 w-24 rounded-xl" />
                <Skeleton className="h-10 w-10 rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );


  return (
    <div className="max-w-[1600px] mx-auto space-y-8 pb-10 animate-in fade-in duration-700">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50/50 rounded-full blur-3xl -z-0" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-slate-900 rounded-xl">
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Users</h1>
          </div>
          <p className="text-slate-500 font-medium max-w-md">
            Advanced management interface for parents, sitters and staff. Monitor activity and maintain platform safety.
          </p>
        </div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 flex flex-col items-center min-w-[120px]">
            <span className="text-2xl font-black text-slate-900">{users.length}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Accounts</span>
          </div>
          <button 
             onClick={handleExport}
             className="flex items-center gap-2 px-6 py-4 bg-teal-600 text-white font-black rounded-2xl hover:bg-teal-700 transition-all shadow-xl shadow-teal-600/20 active:scale-95 text-sm uppercase tracking-widest"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* --- FILTER & SEARCH TOOLBAR --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div className="md:col-span-2 lg:col-span-3 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by identity or email address..."
            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <select
            className="w-full pl-14 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-slate-800 font-bold focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 outline-none transition-all shadow-sm appearance-none cursor-pointer"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">All Roles</option>
            <option value="PARENT">Parents</option>
            <option value="BABYSITTER">Babysitters</option>
            <option value="ADMIN">Admins</option>
            <option value="USER">Base Users</option>
          </select>
        </div>
        <div className="hidden lg:flex items-center justify-center p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center leading-tight">
            Use filters to refine <br/> the view
          </p>
        </div>
      </div>

      {/* --- DATA TABLE --- */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">User Identity</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Accessibility</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Security Status</th>
                <th className="px-8 py-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Onboarding</th>
                <th className="px-8 py-6 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentUsers.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-32 opacity-40">No matching users.</td></tr>
              ) : (
                currentUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50/70 transition-all">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ${user.isBanned ? "bg-slate-300" : "bg-gradient-to-br from-teal-500 to-teal-600"}`}>
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="space-y-1">
                          <p className={`text-lg font-black tracking-tight ${user.isBanned ? "text-slate-400 line-through" : "text-slate-900"}`}>
                            {user.name || "Unknown User"}
                          </p>
                          <p className="text-slate-400 font-bold text-xs uppercase tracking-tight flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 bg-slate-50 text-slate-700`}>
                        {user.role}
                      </span>
                    </td>

                    <td className="px-8 py-6">
                      {user.isBanned ? (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-xl w-fit border border-red-100 font-black text-xs uppercase tracking-widest">
                          <Ban className="h-3.5 w-3.5" /> Blocked
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-teal-700 bg-teal-50 px-4 py-2 rounded-xl w-fit border border-teal-100 font-black text-xs uppercase tracking-widest">
                          <ShieldCheck className="h-3.5 w-3.5" /> Active
                        </div>
                      )}
                    </td>

                    <td className="px-8 py-6 text-slate-400 font-bold text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-8 py-6 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-3 bg-slate-50 text-slate-400 rounded-2xl outline-none hover:bg-slate-900 hover:text-white transition-all">
                          <MoreVertical className="h-5 w-5" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-64 p-3 rounded-[2rem] shadow-2xl border-slate-100">
                           <p className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Standard Actions</p>
                           {user.isBanned ? (
                            <DropdownMenuItem onClick={() => setActionData({ id: user.id, type: "unban" })} className="flex items-center gap-3 p-3 text-green-600 font-black uppercase text-[10px] tracking-widest cursor-pointer hover:bg-green-50 rounded-xl">
                              <Undo2 className="h-4 w-4" /> Restore Access
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => setActionData({ id: user.id, type: "ban" })} className="flex items-center gap-3 p-3 text-orange-600 font-black uppercase text-[10px] tracking-widest cursor-pointer hover:bg-orange-50 rounded-xl">
                              <Ban className="h-4 w-4" /> Revoke Access
                            </DropdownMenuItem>
                          )}
                          
                          <div className="h-px bg-slate-100 my-2" />
                          <p className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Overpowered Actions</p>
                          
                          {/* Role Change Logic */}
                          {["ADMIN", "PARENT", "BABYSITTER", "USER"].map((role) => (
                             user.role !== role && (
                               <DropdownMenuItem key={role} onClick={() => setActionData({ id: user.id, type: "change-role", targetRole: role } as { id: number; type: "change-role"; targetRole: IUser["role"] })} className="flex items-center gap-3 p-3 text-indigo-600 font-black uppercase text-[10px] tracking-widest cursor-pointer hover:bg-indigo-50 rounded-xl">
                                  <ShieldAlert className="h-4 w-4" /> Set as {role}
                               </DropdownMenuItem>
                             )
                          ))}

                          <div className="h-px bg-slate-100 my-2" />
                          <DropdownMenuItem onClick={() => setActionData({ id: user.id, type: "delete" })} className="flex items-center gap-3 p-3 text-red-600 font-black uppercase text-[10px] tracking-widest cursor-pointer hover:bg-red-50 rounded-xl">
                            <Trash2 className="h-4 w-4" /> Erase Entire Profile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION FOOTER --- */}
        {filteredUsers.length > itemsPerPage && (
          <div className="px-8 py-10 bg-slate-50/40 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Cataloged Entries <span className="text-slate-900 mx-2">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)}</span> out of <span className="text-slate-900 ml-2">{filteredUsers.length}</span>
            </p>
            <div className="flex gap-3">
              <button
                disabled={currentPage === 1}
                onClick={() => {
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                   setCurrentPage((prev) => prev - 1);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-30 disabled:pointer-events-none uppercase text-[10px] tracking-widest"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => {
                   window.scrollTo({ top: 0, behavior: 'smooth' });
                   setCurrentPage((prev) => prev + 1);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-30 disabled:pointer-events-none uppercase text-[10px] tracking-widest"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- CONFIRMATION ENGINE --- */}
      <AlertDialog open={!!actionData} onOpenChange={() => setActionData(null)}>
        <AlertDialogContent className="rounded-[3rem] border-0 p-10 shadow-3xl bg-white">
          <AlertDialogHeader className="space-y-5">
             <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center ${actionData?.type === 'unban' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                <ShieldAlert className="w-10 h-10" />
             </div>
            <AlertDialogTitle className="text-3xl font-black text-slate-900 tracking-tight">Security Protocol</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium text-lg leading-relaxed">
              Confirm authorization for <span className="text-slate-900 font-black">{(actionData as { targetRole?: string })?.targetRole || actionData?.type}</span> operation. 
              This will immediately restructure the user&apos;s platform permissions and identity.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-4">
            <AlertDialogCancel className="rounded-2xl py-6 px-8 font-black uppercase text-[10px] tracking-widest border-2 hover:bg-slate-50 transition-all">Decline</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction((actionData as { targetRole?: string })?.targetRole)}
              className={`rounded-2xl py-6 px-10 font-black uppercase text-[10px] tracking-widest shadow-2xl transition-all active:scale-95 ${
                actionData?.type === "unban" ? "bg-green-600 hover:bg-green-700" : "bg-slate-900 hover:bg-black text-white"
              }`}
            >
              Confirm Authorization
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
