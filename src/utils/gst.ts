// Indian GST calculation utilities

export interface GSTBreakdown {
  baseAmount: number
  gstRate: number
  gstAmount: number
  cgst: number
  sgst: number
  igst: number
  total: number
  isInterState: boolean
}

/**
 * Calculate GST breakdown for an amount
 * @param amount - Base amount (excluding GST)
 * @param gstRate - GST rate in percentage (e.g. 18 for 18%)
 * @param isInterState - If buyer and seller are in different states (IGST applies)
 */
export function calculateGST(
  amount: number,
  gstRate: number,
  isInterState = false
): GSTBreakdown {
  const gstAmount = parseFloat(((amount * gstRate) / 100).toFixed(2))
  const halfGST = parseFloat((gstAmount / 2).toFixed(2))

  return {
    baseAmount: amount,
    gstRate,
    gstAmount,
    cgst: isInterState ? 0 : halfGST,
    sgst: isInterState ? 0 : halfGST,
    igst: isInterState ? gstAmount : 0,
    total: parseFloat((amount + gstAmount).toFixed(2)),
    isInterState,
  }
}

/**
 * Extract base price from GST-inclusive price
 */
export function extractBaseFromInclusive(
  inclusivePrice: number,
  gstRate: number
): { baseAmount: number; gstAmount: number } {
  const baseAmount = parseFloat((inclusivePrice / (1 + gstRate / 100)).toFixed(2))
  const gstAmount = parseFloat((inclusivePrice - baseAmount).toFixed(2))
  return { baseAmount, gstAmount }
}

/**
 * Format price in Indian format (₹1,23,456.78)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercent(price: number, comparePrice: number): number {
  if (!comparePrice || comparePrice <= price) return 0
  return Math.round(((comparePrice - price) / comparePrice) * 100)
}

/**
 * GST rates by product category (common Indian rates)
 */
export const GST_RATES: Record<string, number> = {
  essentials: 0,        // Food grains, fresh vegetables
  reduced: 5,           // Household necessities
  standard_low: 12,     // Processed food, medicines
  standard: 18,         // Electronics, clothing > ₹1000
  luxury: 28,           // Luxury cars, tobacco, aerated drinks
}

/**
 * Indian state codes for GST
 */
export const STATE_CODES: Record<string, string> = {
  'Andhra Pradesh': '37',
  'Arunachal Pradesh': '12',
  'Assam': '18',
  'Bihar': '10',
  'Chhattisgarh': '22',
  'Delhi': '07',
  'Goa': '30',
  'Gujarat': '24',
  'Haryana': '06',
  'Himachal Pradesh': '02',
  'Jharkhand': '20',
  'Karnataka': '29',
  'Kerala': '32',
  'Madhya Pradesh': '23',
  'Maharashtra': '27',
  'Manipur': '14',
  'Meghalaya': '17',
  'Mizoram': '15',
  'Nagaland': '13',
  'Odisha': '21',
  'Punjab': '03',
  'Rajasthan': '08',
  'Sikkim': '11',
  'Tamil Nadu': '33',
  'Telangana': '36',
  'Tripura': '16',
  'Uttar Pradesh': '09',
  'Uttarakhand': '05',
  'West Bengal': '19',
}

// Seller state (configure based on your registration)
export const SELLER_STATE = 'Delhi'

export function isInterState(buyerState: string): boolean {
  return buyerState !== SELLER_STATE
}
