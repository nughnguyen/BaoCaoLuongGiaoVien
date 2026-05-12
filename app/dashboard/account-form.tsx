"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { updateProfile } from "./actions";
import type { Profile } from "@/lib/types";
import { UserIcon, LandmarkIcon, CreditCardIcon } from "lucide-react";
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

  useEffect(() => {
    setName(profile.full_name || "");
    setBankName(profile.bank_name || "");
    setBankAccountName(profile.bank_account_name || "");
    setBankAccountNumber(profile.bank_account_number || "");
  }, [profile]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-2xl border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <UserIcon className="w-5 h-5 text-primary" />
            Thông tin tài khoản
          </DialogTitle>
          <DialogDescription className="text-xs">
            Cập nhật thông tin cá nhân và tài khoản ngân hàng để xuất báo cáo lương.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          <div>
            <label className="text-xs font-medium text-muted mb-1.5 block">Họ và tên</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              required
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-gray-50 focus:bg-white focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-4 rounded-xl bg-gray-50/50 p-4 border border-border/50">
            <p className="text-[11px] font-bold uppercase tracking-widest text-primary">Thông tin chuyển khoản</p>

            <div>
              <label className="text-xs font-medium text-muted mb-1.5 block">Ngân hàng</label>
              <input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="VCB, Techcombank..."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-white focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted mb-1.5 block">Tên chủ tài khoản</label>
              <input
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                placeholder="NGUYEN VAN A"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-white focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted mb-1.5 block">Số tài khoản</label>
              <input
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                placeholder="123456789"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-border bg-white focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
