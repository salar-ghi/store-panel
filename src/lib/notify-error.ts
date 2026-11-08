import { toast } from 'sonner';
import { persianNotification } from './notification-message';

let lastToastTime = 0;
let lastToastMessage = '';

export function notifyApiError(error: any, fallbackMessage = 'خطا در ارتباط با سرور') {
  const status = error?.response?.status;
  const rawMessage =
    error?.response?.data?.message ||
    error?.response?.data?.title ||
    error?.message ||
    (status ? `HTTP ${status}` : fallbackMessage);

  const translated = persianNotification(rawMessage, fallbackMessage);

  // Throttle toasts within 2 seconds for the same message
  const now = Date.now();
  if (now - lastToastTime < 2000 && lastToastMessage === translated) {
    return;
  }

  lastToastTime = now;
  lastToastMessage = translated;

  toast.error(translated, {
    id: `api-err-${translated}`,
  });
}
