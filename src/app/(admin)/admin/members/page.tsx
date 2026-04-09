"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Users, Save, X } from "lucide-react";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/fetch-with-auth";

function MemberModal({ user, onClose, onSaved }: { user: any | null, onClose: () => void, onSaved: () => void }) {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState(user?.id || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [linkedinUrl, setLinkedinUrl] = useState(user?.linkedinUrl || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [directoryRole, setDirectoryRole] = useState(user?.directoryRole || "");
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) {
      fetchWithAuth("/api/admin/users?limit=10000")
        .then(res => res.json())
        .then(d => setAllUsers(d.data || []));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) { toast.error("Select a user first"); return; }
    
    setSaving(true);
    const csrf = () => document.cookie.split(";").find(c => c.trim().startsWith("csrf_token="))?.split("=")[1];
    
    const res = await fetchWithAuth("/api/admin/members", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(csrf() ? { "x-csrf-token": csrf()! } : {}) },
      body: JSON.stringify({ userId: selectedUserId, showInDirectory: true, bio, linkedinUrl, avatarUrl, directoryRole })
    });
    
    if (res.ok) {
      toast.success("Member updated in directory");
      onSaved();
    } else {
      toast.error("Failed to save member");
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md hud-card p-6">
        <div className="flex justify-between mb-4">
          <h3 className="font-bold text-white display-heading text-sm">{user ? 'Edit Member' : 'Add to Directory'}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {user ? (
            <div>
               <label className="text-[10px] font-medium text-slate-400 block mb-1 font-mono uppercase tracking-wider">User</label>
               <input disabled value={user.name || user.email} className="input-dark opacity-50 cursor-not-allowed" />
            </div>
          ) : (
             <div className="flex flex-col gap-2">
               <label className="text-[10px] font-medium text-slate-400 block mb-1 font-mono uppercase tracking-wider">Select User</label>
               <input 
                 type="text" 
                 placeholder="Search by name or email..." 
                 className="input-dark mb-2" 
                 value={searchTerm} 
                 onChange={e => setSearchTerm(e.target.value)} 
               />
               <div className="max-h-48 overflow-y-auto space-y-1 bg-navy-950 p-2 rounded-lg border border-navy-800/60">
                  {allUsers
                    .filter(u => !u.isDeleted && (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())))
                    .map(u => (
                    <button 
                      type="button"
                      key={u.id} 
                      onClick={() => setSelectedUserId(u.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedUserId === u.id ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-300 hover:bg-navy-800/60'}`}
                    >
                      <div className="font-medium">{u.name || "Anonymous User"}</div>
                      <div className="text-xs opacity-60 font-mono">{u.email}</div>
                    </button>
                  ))}
                  {allUsers.length > 0 && allUsers.filter(u => !u.isDeleted && (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))).length === 0 && (
                     <div className="text-xs text-slate-500 text-center py-2 font-mono">No users found.</div>
                  )}
               </div>
             </div>
          )}

          <div>
            <label className="text-[10px] font-medium text-slate-400 block mb-1 font-mono uppercase tracking-wider">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} className="input-dark h-24 resize-none" placeholder="Short bio..." />
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-400 block mb-1 font-mono uppercase tracking-wider">LinkedIn URL</label>
            <input type="url" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} className="input-dark" placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-400 block mb-1 font-mono uppercase tracking-wider">Avatar Image URL</label>
            <input type="url" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} className="input-dark" placeholder="https://..." />
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-400 block mb-1 font-mono uppercase tracking-wider">Display Role Override</label>
            <input type="text" value={directoryRole} onChange={e => setDirectoryRole(e.target.value)} className="input-dark" placeholder="e.g. Graphic Designer, Web Lead" />
            <p className="text-[10px] text-slate-500 mt-1 font-mono">Leave blank to default to system role.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="cyber-btn flex-1 disabled:opacity-50">
               <span>{saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save to Directory"}</span>
            </button>
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  const loadMembers = () => {
    setLoading(true);
    fetchWithAuth("/api/members")
      .then(r => r.json())
      .then(d => { setMembers(d.data || []); setLoading(false); });
  };

  useEffect(() => { loadMembers(); }, []);

  const handleRemove = async (userId: string) => {
    if (!confirm("Remove this user from the public directory?")) return;
    const csrf = () => document.cookie.split(";").find(c => c.trim().startsWith("csrf_token="))?.split("=")[1];
    
    await fetchWithAuth("/api/admin/members", {
      method: "POST", headers: { "Content-Type": "application/json", ...(csrf() ? { "x-csrf-token": csrf()! } : {}) },
      body: JSON.stringify({ userId, showInDirectory: false })
    });
    toast.success("Removed from directory");
    loadMembers();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
         <div>
            <p className="hud-label mb-2">Admin</p>
            <h1 className="display-heading text-xl text-white">Directory Management</h1>
            <p className="text-slate-500 text-sm font-mono mt-1">Manage public Members page listings</p>
         </div>
         <button onClick={() => { setEditingUser(null); setShowModal(true); }} className="cyber-btn">
           <span className="flex items-center gap-2"><Plus className="w-4 h-4" /> Add Member</span>
         </button>
      </div>

      <div className="hud-card overflow-hidden scan-overlay">
        <table className="data-table">
          <thead>
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Role</th>
              <th className="p-4">LinkedIn</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-slate-500 font-mono">No members in directory.</td></tr>
            )}
            {members.map(member => (
               <tr key={member.id} className="hover:bg-cyan-500/[0.03] transition-colors">
                 <td className="p-4 font-medium text-white flex items-center gap-3">
                   {member.avatarUrl ? (
                     <div className="relative">
                       <img src={member.avatarUrl} className="w-8 h-8 rounded-lg clip-cyber-sm object-cover" />
                     </div>
                   ) : (
                     <Users className="w-8 h-8 p-1.5 bg-navy-800/60 rounded-lg clip-cyber-sm" />
                   )}
                   {member.name || 'Anonymous User'}
                 </td>
                 <td className="p-4">
                   {member.directoryRole ? (
                     <span className="text-[10px] font-medium text-cyan-400 font-mono uppercase tracking-wider bg-cyan-400/10 px-2 py-0.5 rounded">{member.directoryRole}</span>
                   ) : (
                     <div className="flex gap-1 flex-wrap">
                       {member.roles?.map((r: string) => <span key={r} className="text-[10px] font-medium text-cyan-400 font-mono uppercase tracking-wider bg-cyan-400/10 px-2 py-0.5 rounded">{r}</span>)}
                     </div>
                   )}
                 </td>
                 <td className="p-4 text-slate-400 font-mono text-xs">
                   {member.linkedinUrl ? <a href={member.linkedinUrl} target="_blank" className="hover:text-cyan-400 neon-underline">View</a> : <span className="text-slate-600">None</span>}
                 </td>
                 <td className="p-4 text-right">
                   <button onClick={() => { setEditingUser(member); setShowModal(true); }} className="text-cyan-400 hover:text-cyan-300 mr-4 text-xs font-medium neon-underline">Edit</button>
                   <button onClick={() => handleRemove(member.id)} className="text-red-400 hover:text-red-300 text-xs font-medium neon-underline">Remove</button>
                 </td>
               </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <MemberModal user={editingUser} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); loadMembers(); }} />
      )}
    </div>
  );
}
