"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { updateProfile } from "./actions";
import type { Profile } from "@/lib/types";
import { UserIcon, LandmarkIcon, CreditCardIcon, UserCheckIcon } from "lucide-react";
import { toast } from "sonner";

export default function AccountFormPopup({
  open,
  onOpenChange,
  profile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
}) {
  const [name, setName] = useState(profile.full_name || "");
  const [bankName, setBankName] = useState(profile.bank_name || "");
  const [bankAccountName, setBankAccountName] = useState(profile.bank_account_name || "");
  const [bankAccountNumber, setBankAccountNumber] = useState(profile.bank_account_number || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("full_name", name);
    formData.append("bank_name", bankName);
    formData.append("bank_account_name", bankAccountName);
    formData.append("bank_account_number", bankAccountNumber);
    const { error } = await updateProfile(formData);
    setLoading(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Đã cập nhật thông tin thành công!");
      onOpenChange(false);
    }
  };

  const hasChanges = 
    name !== (profile.full_name || "") ||
    bankName !== (profile.bank_name || "") ||
    bankAccountName !== (profile.bank_account_name || "") ||
    bankAccountNumber !== (profile.bank_account_number || "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="size-5 text-cyan-600" />
            Thông tin tài khoản
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cá nhân và tài khoản ngân hàng để xuất báo cáo lương.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Họ và tên</Label>
            <div className="relative">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="pl-9 h-11 rounded-xl"
                disabled={loading}
                required
              />
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-4 rounded-2xl bg-slate-50/50 p-4 border border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-widest text-cyan-700">Thông tin chuyển khoản</p>
            
            <div className="grid gap-2">
              <Label htmlFor="bank_name" className="text-xs text-slate-500">Tên Ngân hàng</Label>
              <div className="relative">
                <Input
                  id="bank_name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Vietcombank, MB Bank..."
                  className="pl-9 h-10 rounded-lg"
                  disabled={loading}
                />
                <LandmarkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bank_account_name" className="text-xs text-slate-500">Chủ tài khoản</Label>
              <div className="relative">
                <Input
                  id="bank_account_name"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  placeholder="NGUYEN VAN A"
                  className="pl-9 h-10 rounded-lg"
                  disabled={loading}
                />
                <UserCheckIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bank_account_number" className="text-xs text-slate-500">Số tài khoản</Label>
              <div className="relative">
                <Input
                  id="bank_account_number"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="0123456789..."
                  className="pl-9 h-10 rounded-lg"
                  disabled={loading}
                />
                <CreditCardIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={loading} className="rounded-xl">
              Hủy
            </Button>
            <Button type="submit" disabled={loading || !name.trim() || !hasChanges} className="rounded-xl px-8">
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
