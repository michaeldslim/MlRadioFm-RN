# ML Radio FM - React Native

A modern React Native radio streaming app with TypeScript and Expo, migrated from the original Swift iOS app. Features Korean radio stations (KBS, MBC, SBS), international stations, and podcast support with a beautiful modern UI.

## Features

- 🎵 **Korean Radio Stations**: KBS, MBC, SBS with live API integration
- 🌍 **International Radio**: Popular US radio stations
- 🎙️ **Podcast Support**: RSS feed parsing with episode tracking
- 🎨 **Modern UI**: Beautiful gradient designs and smooth animations
- 🔍 **Search**: Real-time station search functionality
- 📱 **Categories**: Organized station browsing by broadcaster
- 🎛️ **Audio Controls**: Play/pause, stop, volume control, and seeking
- 📊 **Progress Tracking**: Real-time progress for podcast episodes

## Korean Radio API Integration

The app integrates with official Korean broadcaster APIs:

- **KBS**: Live stream URLs via official API
- **MBC**: Dynamic stream URL fetching
- **SBS**: HTTPS streaming with SSL support
- **Other**: BBS, YTN, Arirang with direct HTTPS streams

## Development

To add new radio stations, edit `data/stations.ts`:

```typescript
{
  id: 'unique-id',
  name: 'Station Name',
  url: 'stream-url-or-api-scheme',
  type: RadioStationType.KOREAN | INTERNATIONAL | PODCAST,
}
```

For Korean stations, use URL schemes:
- `kbs://channelCode` for KBS stations
- `mbc://channel` for MBC stations  
- `sbs://channel` for SBS stations

## EAS / OTA Updates

This project uses [Expo Application Services (EAS)](https://expo.dev/eas) for builds and Over-the-Air (OTA) updates via `expo-updates`.

### Setup

Install EAS CLI globally:

```bash
npm install -g eas-cli
```

Log in to your Expo account:

```bash
eas login
```

Initialize the project (links to your EAS account and fills in `projectId` in `app.json`):

```bash
eas init
```

### Building

```bash
# Build for production (Android AAB + iOS IPA)
eas build --platform android --profile production
eas build --platform ios --profile production

# Build both platforms at once
eas build --platform all --profile production

# Build for internal testing
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

### Pushing OTA Updates

Send a JS/asset update to users without a new store release:

```bash
# Push to production branch
eas update --branch production --message "Fix: station stream URLs"

# Push to preview branch
eas update --branch preview --message "Test: new feature"
```

Users on a matching `runtimeVersion` receive the update automatically on next app load.

### Runtime Version Policy

The project uses `"policy": "appVersion"`. This means:
- Users on the same native build (same `version` in `app.json`) can receive OTA updates.
- Bumping `version` in `app.json` creates a new runtime version and requires a new native build.

## License

MIT License - see LICENSE file for details.
