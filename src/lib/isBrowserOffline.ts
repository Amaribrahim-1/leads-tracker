import { toast } from "sonner";

export const OFFLINE_SAVE_MESSAGE =
  "You're offline. This change was not saved.";

export function isBrowserOffline() {
  return typeof navigator !== "undefined" && !navigator.onLine;
}

export function blockIfOffline() {
  if (!isBrowserOffline()) {
    return false;
  }

  toast.error(OFFLINE_SAVE_MESSAGE);
  return true;
}
