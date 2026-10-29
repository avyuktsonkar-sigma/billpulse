# BillPulse - Enterprise Invoice & Billing Engine

BillPulse is a lightweight, client-side B2B invoicing solution built with React, Vite, and Tailwind CSS. It empowers freelancers and small businesses to generate GST-compliant invoices, track settlement states, and print physical documents with zero external database configuration.

## Features
- **Dynamic Calculation Engine**: Auto-computes item subtotals, configurable discounts, and regional tax brackets (GST/VAT).
- **Print & PDF Layout Engine**: Native `@media print` stylesheets designed to isolate the physical invoice document and omit web interface controls.
- **Settlement Ledger**: Persistent storage tracking Paid vs Outstanding receivables.
- **1-Click Demo Hydration**: Built-in enterprise sample data for quick demonstration.

## Setup & Local Run
```bash
npm install
npm run dev
