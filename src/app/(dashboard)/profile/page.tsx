"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Trash2, Loader2, Phone as PhoneIcon, Camera, Link as LinkIcon, User as UserIcon, Shield } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<{
    email?: string;
    name?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
    bio?: string | null;
    linkedinUrl?: string | null;
    roles?: string[];
  } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const csrf = () => document.cookie.split(";").find(c => c.trim().startsWith("csrf_token="))?.split("=")[1];

  useEffect(() => {
    fetch("/api/users/me").then(r => r.json()).then(d => {
      setProfile(d.data);
      setName(d.data?.name ?? "");
      setPhone(d.data?.phone ?? "");
      setAvatarUrl(d.data?.avatarUrl ?? "");
      setBio(d.data?.bio ?? "");
      setLinkedinUrl(d.data?.linkedinUrl ?? "");
    });
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "avatars");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { ...(csrf() ? { "x-csrf-token": csrf()! } : {}) },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to upload image.");
      } else {
        setAvatarUrl(data.data.url);
        toast.success("Image uploaded. Remember to save your profile!");
      }
    } catch {
      toast.error("Network error during upload");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSave = async () => {
    if (phone && !/^\d{10}$/.test(phone)) {
      toast.error("Phone must be exactly 10 digits");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/users/me", {
      method: "PATCH", headers: { "Content-Type": "application/json", ...(csrf() ? { "x-csrf-token": csrf()! } : {}) },
      body: JSON.stringify({ 
        name: name || undefined, 
        phone: phone || undefined, 
        avatarUrl: avatarUrl || undefined,
        bio: bio || undefined,
        linkedinUrl: linkedinUrl || undefined
      }),
    });
    if (res.ok) {
      toast.success("Profile updated!");
      const d = await res.json();
      setProfile(d.data);
    } else {
      toast.error("Failed to update");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure? This will permanently delete your account.")) return;
    setDeleting(true);
    await fetch("/api/users/me", { method: "DELETE", headers: { ...(csrf() ? { "x-csrf-token": csrf()! } : {}) } });
    toast.success("Account deleted");
    router.push("/login");
  };

  if (!profile) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-cyan-400" /></div>;

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <p className="hud-label mb-2">Account</p>
        <h1 className="display-heading text-xl text-white glitch-text">Profile</h1>
      </div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="hud-card p-6 space-y-5 scan-overlay">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0 clip-cyber">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-white">{profile.email?.[0]?.toUpperCase()}</span>
              )}
            </div>
            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity rounded-xl">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Camera className="w-5 h-5 text-white" />}
              <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarUpload} disabled={uploading} />
            </label>
            {/* Neon border */}
            <div className="absolute inset-[-3px] rounded-xl border border-cyan-400/20 pointer-events-none" style={{ animation: "hud-breathe 3s ease-in-out infinite" }} />
          </div>
          <div>
            <p className="font-semibold text-white">{profile.name || "No name set"}</p>
            <p className="text-sm text-slate-400 font-mono text-xs">{profile.email}</p>
            {profile.phone && (
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                <PhoneIcon className="w-3 h-3" /> {profile.phone}
              </p>
            )}
            <div className="flex gap-1 mt-1 flex-wrap">
              {profile.roles?.map((r: string) => (
                <span key={r} className="text-[9px] font-medium text-cyan-400 font-mono uppercase tracking-wider bg-cyan-400/10 px-2 py-0.5 rounded">{r}</span>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-medium text-slate-400 mb-1.5 block font-mono uppercase tracking-wider">Display Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="input-dark" placeholder="Your name" />
        </div>
        <div>
          <label className="text-[10px] font-medium text-slate-400 mb-1.5 block font-mono uppercase tracking-wider">Phone Number</label>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="input-dark"
            placeholder="10-digit phone number"
            inputMode="numeric"
            maxLength={10}
          />
          {phone && !/^\d{10}$/.test(phone) && (
            <p className="text-xs text-red-400 mt-1 font-mono">Must be exactly 10 digits</p>
          )}
        </div>

        {profile.roles?.some(r => ['member', 'treasurer', 'admin'].includes(r)) ? (
          <>
            <div>
              <label className="text-[10px] font-medium text-slate-400 mb-1.5 block font-mono uppercase tracking-wider">Short Bio</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value.slice(0, 500))}
                className="input-dark resize-none h-24"
                placeholder="Tell us about yourself..."
              />
              <p className="text-[10px] text-slate-500 text-right mt-1 font-mono">{bio.length}/500</p>
            </div>

            <div>
              <label className="text-[10px] font-medium text-slate-400 mb-1.5 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                <LinkIcon className="w-3.5 h-3.5" /> LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={linkedinUrl}
                onChange={e => setLinkedinUrl(e.target.value)}
                className="input-dark"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </>
        ) : (
          <div className="hud-card p-4 text-center">
            <Shield className="w-6 h-6 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Bio & LinkedIn fields are available for <span className="text-cyan-400 font-medium">Members</span> and above.</p>
            <p className="text-xs text-slate-500 mt-1 font-mono">Contact an admin to get promoted.</p>
          </div>
        )}
        <button onClick={handleSave} disabled={saving} className="cyber-btn w-full disabled:opacity-50">
          <span className="flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
          </span>
        </button>
      </motion.div>

      {/* Danger zone */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <div className="hud-card p-5 border-red-500/15">
          {/* HUD-style warning brackets */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-red-400" style={{ animation: "dot-pulse 2s ease-in-out infinite" }} />
            <h3 className="font-medium text-red-400 display-heading text-xs">Danger Zone</h3>
          </div>
          <p className="text-xs text-slate-500 mb-3 font-mono">Once deleted, your account cannot be recovered. All data will be anonymised.</p>
          <button onClick={handleDelete} disabled={deleting} className="cyber-btn-danger">
            <span className="flex items-center gap-2">
              {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4" /> Delete Account</>}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
