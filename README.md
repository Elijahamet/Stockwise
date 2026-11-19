# Stockwise 📦

> **Next-Generation Mobile Inventory Management, Sales POS & Barcode Expiry Tracking**  
> *Built with Expo SDK 58, React Native, TypeScript, and Offline-First Local Storage.*

Stockwise is a professional retail inventory and point-of-sale mobile application designed for retail shops, supermarkets, and provision stores. It operates **100% offline-first**, allowing store operators to checkout customers, manage multi-batch inventory, and scan barcodes even without internet connectivity.

---

## ✨ Key Features

### 🔍 1. Barcode & Expiry Scanner
- **Native Camera Scanner:** Instant optical barcode recognition powered by `expo-camera` (`CameraView`) with custom laser reticle and flashlight toggle.
- **Local Inventory Search:** Instant query against local device inventory with zero external network lag.
- **Expiry Detection Engine:** Evaluates product expiration dates and flags items with clear status badges:
  - 🟢 **NOT EXPIRED:** Within safe recorded shelf-life (> 30 days).
  - 🟡 **EXPIRING SOON:** Approaching expiry within configurable warning period (<= 30 days).
  - 🔴 **EXPIRED:** Date passed — triggers prominent alert banner:  
    `WARNING: THIS PRODUCT HAS EXPIRED. DO NOT SELL IT.`
  - ⚪ **EXPIRY DATE UNKNOWN:** Unrecorded shelf-life (never incorrectly marked expired).
- **One-Tap Actions:** View product details, update expiration date, write off expired stock, or create a new product if the barcode is not recognized.
- **Manual Barcode Fallback:** Dedicated keyboard input modal for devices/environments without camera hardware access.

### 📅 2. Multi-Batch Expiry Management
- **Dedicated Expiry Dashboard:** Track all expired, expiring soon, and healthy stock at a glance.
- **Multi-Batch Architecture (`ProductBatch`):** Track separate shipments, lot numbers, received quantities, and unique expiration dates under a single SKU.
- **Damage & Expiry Write-Offs:** Direct one-tap stock removal for expired goods with automatic inventory adjustments and movement logging.

### 🛒 3. Point of Sale (POS) & Checkout
- **Instant Cart Management:** Add items via barcode scan or product catalog search.
- **Safety Expiry Gate:** Prohibits selling expired products to customers with clear safety warnings.
- **Real-Time Financial Math:** Subtotals, flexible discounts, and multi-currency formatting.
- **Stock Guardrails:** Prevents checkout when exceeding on-hand quantities or selling into negative stock.
- **Payment Methods:** Support for Cash, Mobile Money (MoMo), and Cards with digital receipt generation.

### 📊 4. Inventory Catalog & Multi-Select
- **Bulk Operations:** Multi-select mode with checkboxes, select-all, and bulk product deletion with confirmation protection.
- **Real-Time Stock Alerts:** Low-stock threshold indicators, out-of-stock warnings, and margin calculations.
- **Filtering & Search:** Real-time search across product name, SKU, and barcode.

### 📈 5. Stock Operations & Reports
- **Stock-In & Restocking:** Record purchase prices, suppliers, invoice numbers, batch numbers, and delivery dates.
- **Audit Adjustments:** Reconcile physical inventory counts against recorded balances with audit reason logging.
- **Movement History:** Full immutable ledger of sales, restocks, deductions, and adjustments.
- **Embedded Analytics:** Gross margins, cost vs. retail valuation, and category distribution charts.

### 👥 6. Employee & Access Control
- **Role Presets:** Store Owner, Manager, and Staff accounts.
- **Granular Permissions:** Independent switches for inventory management, stock-in, stock-out, sales checkout, reports access, and settings.

### 💾 7. 100% Offline-First Persistence
- **Local Storage Engine:** Powered by `@react-native-async-storage/async-storage` for seamless data durability across app restarts and power outages.
- **Offline Sync Queue:** Transparent local mutation tracking and conflict resolution simulation without fake cloud claims.

---

## 🎨 Design System

Stockwise follows a modern, professional visual aesthetic:
- **Clean Cards:** Crisp white cards (`#FFFFFF`) with subtle borders and shadows.
- **Primary Actions:** Deep Emerald accents (`#0A241D`, `#0F332A`).
- **Highlights & Accents:** Fresh Green (`#16986C`, `#2CE5A7`).
- **Alert Colors:** Soft Red (`#EF4444`) for expired items and Amber (`#F59E0B`) for expiring-soon warnings.

---

## 🛠️ Tech Stack

- **Framework:** [Expo](https://expo.dev/) (SDK 58)
- **Runtime:** React Native 0.88.1 / React 19
- **Language:** TypeScript 5.8+ (Strict typechecking, 0 errors)
- **Routing:** Expo Router (File-based navigation)
- **Camera & Scanning:** `expo-camera` (`CameraView`)
- **Icons:** `lucide-react-native`
- **Gradients & Blur:** `expo-linear-gradient`, `expo-blur`
- **Persistence:** `@react-native-async-storage/async-storage`

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Expo Go app on iOS or Android

### Installation
```bash
# Clone the repository
git clone https://github.com/Elijahamet/Stockwise.git
cd Stockwise

# Install dependencies (SDK-compatible)
npx expo install

# Start the Expo development server
npx expo start

# Start with remote tunnel (for testing on mobile across networks)
npx expo start --tunnel
```

### Quality & Diagnostics
```bash
# Run TypeScript compilation check
npx tsc --noEmit

# Run Expo Doctor dependency diagnostics
npx expo-doctor
```

---

## 📄 License
This project is licensed under the MIT License.
