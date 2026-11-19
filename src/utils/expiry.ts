import { Colors } from '../constants/colors';
import { Product, ProductBatch, ExpiryStatus } from '../types';

export interface ExpiryCalculationResult {
  status: ExpiryStatus;
  daysRemaining: number | null; // negative if overdue, null if unknown
  label: string;
  badgeText: string;
  color: string;
  bgColor: string;
  borderColor: string;
  isExpired: boolean;
  isExpiringSoon: boolean;
}

/**
 * Normalizes a date string (YYYY-MM-DD or ISO) to local midnight for accurate calendar day comparison
 */
export const parseLocalDate = (dateStr: string): Date | null => {
  if (!dateStr || typeof dateStr !== 'string') return null;

  // Handle YYYY-MM-DD
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day, 0, 0, 0, 0);
    }
  }

  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
};

/**
 * Calculates the difference in full calendar days between today and targetDate
 */
export const calculateDaysDifference = (targetDateStr?: string): number | null => {
  if (!targetDateStr) return null;
  const targetDate = parseLocalDate(targetDateStr);
  if (!targetDate) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  const diffMs = targetDate.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Evaluates the expiry status based on target date string and a configurable warning threshold (default 30 days)
 */
export const calculateExpiryStatus = (
  dateStr?: string,
  warningDays = 30
): ExpiryCalculationResult => {
  if (!dateStr || !dateStr.trim()) {
    return {
      status: 'EXPIRY_DATE_UNKNOWN',
      daysRemaining: null,
      label: 'Expiry Date Unknown',
      badgeText: 'UNKNOWN',
      color: Colors.textMuted,
      bgColor: Colors.surfaceSubtle,
      borderColor: Colors.border,
      isExpired: false,
      isExpiringSoon: false,
    };
  }

  const diffDays = calculateDaysDifference(dateStr);

  if (diffDays === null) {
    return {
      status: 'EXPIRY_DATE_UNKNOWN',
      daysRemaining: null,
      label: 'Invalid Date',
      badgeText: 'INVALID',
      color: Colors.textMuted,
      bgColor: Colors.surfaceSubtle,
      borderColor: Colors.border,
      isExpired: false,
      isExpiringSoon: false,
    };
  }

  // EXPIRED (date has passed)
  if (diffDays < 0) {
    const daysOverdue = Math.abs(diffDays);
    return {
      status: 'EXPIRED',
      daysRemaining: diffDays,
      label: daysOverdue === 1 ? 'Expired yesterday' : `Expired ${daysOverdue} days ago`,
      badgeText: 'EXPIRED',
      color: Colors.softRed,
      bgColor: Colors.redLight,
      borderColor: Colors.softRed,
      isExpired: true,
      isExpiringSoon: false,
    };
  }

  // EXPIRING SOON (within warningDays, including today)
  if (diffDays <= warningDays) {
    const label =
      diffDays === 0
        ? 'Expires today'
        : diffDays === 1
        ? 'Expires tomorrow'
        : `Expires in ${diffDays} days`;

    return {
      status: 'EXPIRING_SOON',
      daysRemaining: diffDays,
      label,
      badgeText: 'EXPIRING SOON',
      color: Colors.amberDark,
      bgColor: Colors.amberLight,
      borderColor: Colors.amber,
      isExpired: false,
      isExpiringSoon: true,
    };
  }

  // NOT EXPIRED (> warningDays)
  return {
    status: 'NOT_EXPIRED',
    daysRemaining: diffDays,
    label: `${diffDays} days remaining`,
    badgeText: 'NOT EXPIRED',
    color: Colors.freshGreen,
    bgColor: Colors.emeraldLight,
    borderColor: Colors.freshGreen,
    isExpired: false,
    isExpiringSoon: false,
  };
};

/**
 * Evaluates a product, checking both its primary expiry date and individual batches.
 * Returns overall product expiry status as well as detailed batch summaries.
 */
export const getProductExpiryOverview = (
  product: Product,
  warningDays = 30
): {
  overall: ExpiryCalculationResult;
  batchesInfo: Array<{ batch: ProductBatch; calculation: ExpiryCalculationResult }>;
  hasMultipleBatches: boolean;
  expiredBatchesCount: number;
  expiringSoonBatchesCount: number;
} => {
  const batches = product.batches || [];
  const batchesInfo = batches.map((batch) => ({
    batch,
    calculation: calculateExpiryStatus(batch.expiryDate, warningDays),
  }));

  const expiredBatches = batchesInfo.filter((b) => b.calculation.isExpired);
  const expiringSoonBatches = batchesInfo.filter((b) => b.calculation.isExpiringSoon);

  // If batches exist, the most urgent batch determines the overall product status
  let overall: ExpiryCalculationResult;

  if (batchesInfo.length > 0) {
    if (expiredBatches.length > 0) {
      // Prioritize expired batch
      const mostExpired = [...expiredBatches].sort(
        (a, b) => (a.calculation.daysRemaining ?? 0) - (b.calculation.daysRemaining ?? 0)
      )[0];
      overall = {
        ...mostExpired.calculation,
        label: `${expiredBatches.length} batch(es) expired`,
      };
    } else if (expiringSoonBatches.length > 0) {
      // Prioritize expiring soon batch
      const soonest = [...expiringSoonBatches].sort(
        (a, b) => (a.calculation.daysRemaining ?? 0) - (b.calculation.daysRemaining ?? 0)
      )[0];
      overall = {
        ...soonest.calculation,
        label: `${expiringSoonBatches.length} batch(es) expiring soon`,
      };
    } else {
      // All batches are either NOT_EXPIRED or UNKNOWN
      const validBatches = batchesInfo.filter((b) => b.calculation.daysRemaining !== null);
      if (validBatches.length > 0) {
        const earliest = [...validBatches].sort(
          (a, b) => (a.calculation.daysRemaining ?? 0) - (b.calculation.daysRemaining ?? 0)
        )[0];
        overall = earliest.calculation;
      } else {
        overall = calculateExpiryStatus(product.expiryDate, warningDays);
      }
    }
  } else {
    overall = calculateExpiryStatus(product.expiryDate, warningDays);
  }

  return {
    overall,
    batchesInfo,
    hasMultipleBatches: batches.length > 1,
    expiredBatchesCount: expiredBatches.length,
    expiringSoonBatchesCount: expiringSoonBatches.length,
  };
};

/**
 * Formats date into readable string e.g. "12 Oct 2026"
 */
export const formatDisplayDate = (dateStr?: string): string => {
  if (!dateStr) return 'Not set';
  const d = parseLocalDate(dateStr);
  if (!d) return dateStr;

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};
