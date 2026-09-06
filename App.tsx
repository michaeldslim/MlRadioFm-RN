import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { deactivateKeepAwake, ExpoKeepAwakeTag } from 'expo-keep-awake';
import { Header } from './components/Header';
import { CategoryTabs } from './components/CategoryTabs';
import { StationList } from './components/StationList';
import { MiniPlayerBar } from './components/MiniPlayerBar';
import { LandscapeDecorPanel } from './components/LandscapeDecorPanel';
import { useRadioPlayer } from './hooks/useRadioPlayer';
import { useDeviceLayout } from './hooks/useDeviceLayout';
import { useOrientationLock } from './hooks/useOrientationLock';
import { radioStations } from './data/stations';
import { StationCategory } from './types';
import { filterStationsByCategory } from './utils/categoryUtils';
import {
  LANDSCAPE_PANEL_WIDTH,
  LANDSCAPE_PANEL_MAX_WIDTH_RATIO,
} from './utils/deviceUtils';
import { LanguageProvider } from './contexts/LanguageContext';

function AppContent() {
  useEffect(() => {
    // Expo dev builds wrap the app with withDevTools(), which keeps the screen awake on Android.
    // Parent keep-awake activates asynchronously, so deactivate again after it settles.
    const deactivateDevKeepAwake = () => {
      void deactivateKeepAwake(ExpoKeepAwakeTag);
    };

    deactivateDevKeepAwake();
    const timeoutId = setTimeout(deactivateDevKeepAwake, 300);

    return () => clearTimeout(timeoutId);
  }, []);

  const [searchText, setSearchText] = useState('');
  const [showingSearch, setShowingSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<StationCategory>(StationCategory.ALL);

  useOrientationLock();
  const { isLandscapeTablet } = useDeviceLayout();

  const {
    playerState,
    playStation,
    togglePlayPause,
    stop,
  } = useRadioPlayer();

  const filteredStations = useMemo(() => {
    let stations = radioStations;

    if (selectedCategory !== StationCategory.ALL) {
      stations = filterStationsByCategory(stations, selectedCategory);
    }

    if (showingSearch && searchText.trim()) {
      stations = stations.filter(station =>
        station.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return stations;
  }, [selectedCategory, showingSearch, searchText]);

  const handleSearchToggle = () => {
    setShowingSearch(!showingSearch);
    if (showingSearch) {
      setSearchText('');
    }
  };

  const handleStationSelect = async (station: any) => {
    await playStation(station);
  };

  const radioMain = (
    <>
      <Header
        playerState={playerState}
        searchText={searchText}
        showingSearch={showingSearch}
        onSearchToggle={handleSearchToggle}
        onSearchTextChange={setSearchText}
      />
      <CategoryTabs
        selectedCategory={selectedCategory}
        stations={radioStations}
        onCategorySelect={setSelectedCategory}
      />
      <View style={styles.stationListContainer}>
        <StationList
          stations={filteredStations}
          playerState={playerState}
          onStationSelect={handleStationSelect}
          selectedCategory={selectedCategory}
        />
      </View>
    </>
  );

  const miniPlayer = playerState.currentStation ? (
    <MiniPlayerBar
      playerState={playerState}
      onPlayPause={togglePlayPause}
      onStop={stop}
      onRetry={() => {
        if (playerState.currentStation) {
          void playStation(playerState.currentStation);
        }
      }}
    />
  ) : null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {isLandscapeTablet ? (
        <View style={styles.landscapeRoot}>
          <View style={styles.landscapePanel}>
            <View style={styles.panelBody}>
              <View style={styles.content}>{radioMain}</View>
              {miniPlayer ? (
                <View style={styles.miniPlayerOverlay}>{miniPlayer}</View>
              ) : null}
            </View>
          </View>
          <LandscapeDecorPanel playerState={playerState} />
        </View>
      ) : (
        <View style={styles.phoneBody}>
          <View style={styles.content}>{radioMain}</View>
          {miniPlayer ? (
            <View style={styles.miniPlayerOverlay}>{miniPlayer}</View>
          ) : null}
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  landscapeRoot: {
    flex: 1,
    flexDirection: 'row',
  },
  landscapePanel: {
    width: LANDSCAPE_PANEL_WIDTH,
    maxWidth: `${LANDSCAPE_PANEL_MAX_WIDTH_RATIO * 100}%`,
    flexShrink: 0,
    flexDirection: 'column',
    backgroundColor: '#f8f9fa',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: 'rgba(142, 142, 147, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  phoneBody: {
    flex: 1,
  },
  panelBody: {
    flex: 1,
  },
  miniPlayerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  content: {
    flex: 1,
  },
  stationListContainer: {
    flex: 1,
  },
});
