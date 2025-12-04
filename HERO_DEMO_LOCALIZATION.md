# Hero Demo Localization Update

## Overview

Updated the hero demo table to showcase the global nature of the platform with localized currencies and units for different countries.

## Changes Made

### 1. **Hard Drives - United States 🇺🇸**

- **URL**: `realpricedata.com/us/electronics/hard-drives`
- **Currency**: USD ($)
- **Unit**: Price per TB
- **No changes to data** - Already using USD

### 2. **Batteries - Germany 🇩🇪**

- **URL**: `realpricedata.com/de/electronics/batteries`
- **Currency**: EUR (€)
- **Unit**: Price per Unit
- **Price Adjustments**:
  - Converted from USD to EUR (~0.92 conversion rate)
  - Example: $11.99 → €10.99
  - All prices adjusted proportionally

### 3. **Dog Food - India 🇮🇳**

- **URL**: `realpricedata.com/in/groceries/pet-food`
- **Currency**: INR (₹)
- **Unit**: Price per kg (changed from lbs)
- **Price Adjustments**:
  - Converted from USD to INR (~83 conversion rate)
  - Changed weight from lbs to kg
  - Example: $47.99 (35 lbs) → ₹3,999 (15.9 kg)
  - Unit price label: "Price/kg" instead of "Price/lb"

## Display Updates

### Currency Symbols

- **US**: $ (Dollar)
- **Germany**: € (Euro)
- **India**: ₹ (Rupee)

### Number Formatting

- **USD**: 2 decimal places (e.g., $11.99)
- **EUR**: 2 decimal places (e.g., €10.99)
- **INR**: No decimals (e.g., ₹3999) - following Indian convention

### Unit Price Precision

- **Hard Drives (USD)**: 3 decimals (e.g., $11.229)
- **Batteries (EUR)**: 2 decimals (e.g., €0.23)
- **Dog Food (INR)**: 1 decimal (e.g., ₹251.5)

## User Experience Benefits

✅ **Global Perspective**: Users immediately see the platform works across multiple countries
✅ **Localized Experience**: Each country shows appropriate currency and units
✅ **Realistic Data**: Prices and units match what users would expect in each market
✅ **Cultural Awareness**: Number formatting follows local conventions (e.g., no decimals for INR)

## Example Rotation

The hero demo rotates through these three examples every 5 seconds:

1. **US Hard Drives** → Shows storage comparison in USD
2. **Germany Batteries** → Shows battery comparison in EUR
3. **India Dog Food** → Shows pet food comparison in INR with kg units

This creates a compelling demonstration of the platform's international capabilities!

## Technical Details

### Config Structure

```typescript
{
  harddrives: {
    currency: "$",
    unitLabel: "Price/TB",
    url: "realpricedata.com/us/electronics/hard-drives"
  },
  batteries: {
    currency: "€",
    unitLabel: "Price/Unit",
    url: "realpricedata.com/de/electronics/batteries"
  },
  dogfood: {
    currency: "₹",
    unitLabel: "Price/kg",
    url: "realpricedata.com/in/groceries/pet-food"
  }
}
```

### Dynamic Currency Display

```tsx
{
  config.currency;
}
{
  price;
}
```

This ensures each category shows the correct currency symbol automatically.
