# Language Toggle Implementation

## Overview
This document describes the implementation of English/Korean language toggle feature in ML Radio FM.

## Features
- **Default Language**: English (as requested)
- **Toggle Button**: Located in the header next to the search button
- **Persistent Storage**: Language preference is saved using AsyncStorage
- **Complete Translation**: All UI text is translated including:
  - App title and headers
  - Category names (All, KBS, MBC, SBS, Other, International, Podcast)
  - Station types
  - Search placeholder
  - Empty state messages
  - Episode labels

## File Structure

### Translation Files
- **`locales/en.ts`**: English translations
- **`locales/ko.ts`**: Korean translations
- **`locales/index.ts`**: Export and type definitions

### Context
- **`contexts/LanguageContext.tsx`**: React Context for language management
  - Provides `useLanguage()` hook
  - Manages language state and persistence
  - Exposes `t` (translations), `language`, and `setLanguage()`

### Updated Components
1. **`App.tsx`**: Wrapped with `LanguageProvider`
2. **`components/Header.tsx`**: 
   - Added language toggle button
   - Uses translations for title and subtitle
3. **`components/CategoryTabs.tsx`**: 
   - Uses `getCategoryDisplayName()` for translated category names
4. **`components/StationList.tsx`**: 
   - Uses translations for empty state and episode labels
   - Passes language to `getStationTypeText()`

### Utilities
- **`utils/categoryUtils.ts`**: 
  - Added `getCategoryDisplayName()` function
  - Updated `getStationTypeText()` to accept language parameter

## Usage

### In Components
```typescript
import { useLanguage } from '../contexts/LanguageContext';

const MyComponent = () => {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <Text>{t.appTitle}</Text>
  );
};
```

### Toggle Language
```typescript
const toggleLanguage = () => {
  setLanguage(language === 'en' ? 'ko' : 'en');
};
```

## How It Works

1. **Initialization**: 
   - App loads with English as default
   - Checks AsyncStorage for saved preference
   - Updates to saved language if found

2. **Language Toggle**:
   - User clicks language button in header
   - Language switches between 'en' and 'ko'
   - Preference saved to AsyncStorage
   - All components re-render with new translations

3. **Translation Access**:
   - Components use `useLanguage()` hook
   - Access translations via `t` object (e.g., `t.appTitle`)
   - TypeScript ensures type safety for all translation keys

## Adding New Translations

1. Add key to `locales/en.ts`:
```typescript
export const en = {
  // ... existing keys
  newKey: 'New English Text',
};
```

2. Add corresponding Korean translation to `locales/ko.ts`:
```typescript
export const ko: TranslationKeys = {
  // ... existing keys
  newKey: '새로운 한국어 텍스트',
};
```

3. Use in components:
```typescript
const { t } = useLanguage();
<Text>{t.newKey}</Text>
```

## Language Button Design
- **Location**: Top right of header, next to search button
- **Style**: Blue background with border, matching app theme
- **Display**: Shows opposite language (EN when Korean is active, 한국어 when English is active)
- **Responsive**: Smooth toggle with immediate UI update

## Notes
- Language preference persists across app restarts
- All text content is fully translated
- Category names maintain consistency across the app
- Station type labels are context-aware
