import { toast } from "sonner";

export const sonner13 = (title: string, description?: string) =>
  toast.success(title, { description });

export const sonner14 = (title: string, description?: string) =>
  toast.info(title, { description });

export const sonner15 = (title: string, description?: string) =>
  toast.warning(title, { description });

export const sonner16 = (title: string, description?: string) =>
  toast.error(title, { description });
