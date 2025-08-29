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

## License

MIT License - see LICENSE file for details.
