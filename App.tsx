import React, { useState, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { CategoryTabs } from './components/CategoryTabs';
import { StationList } from './components/StationList';
import { useRadioPlayer } from './hooks/useRadioPlayer';
import { radioStations } from './data/stations';
import { StationCategory } from './types';
import { filterStationsByCategory } from './utils/categoryUtils';

export default function App() {
  const [searchText, setSearchText] = useState('');
  const [showingSearch, setShowingSearch] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<StationCategory>(StationCategory.ALL);

  const {
    playerState,
    playStation,
    togglePlayPause,
    stop,
    setVolume,
    seek,
  } = useRadioPlayer();

  const filteredStations = useMemo(() => {
    let stations = radioStations;

    // Apply category filter
    if (selectedCategory !== StationCategory.ALL) {
      stations = filterStationsByCategory(stations, selectedCategory);
    }

    // Apply search filter
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

  const handleVolumeChange = async (volume: number) => {
    await setVolume(volume);
  };

  const handleSeek = async (progress: number) => {
    await seek(progress);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      <View style={styles.content}>
        {/* Header */}
        <Header
          playerState={playerState}
          searchText={searchText}
          showingSearch={showingSearch}
          onSearchToggle={handleSearchToggle}
          onSearchTextChange={setSearchText}
        />

        {/* Control Panel */}
        <ControlPanel
          playerState={playerState}
          onPlayPause={togglePlayPause}
          onStop={stop}
          onVolumeChange={handleVolumeChange}
        />

        {/* Category Tabs */}
        <CategoryTabs
          selectedCategory={selectedCategory}
          stations={radioStations}
          onCategorySelect={setSelectedCategory}
        />

        {/* Station List */}
        <View style={[
          styles.stationListContainer,
          playerState.currentStation?.type === 'podcast' && playerState.isPlaying && styles.stationListWithPodcast
        ]}>
          <StationList
            stations={filteredStations}
            playerState={playerState}
            onStationSelect={handleStationSelect}
            onSeek={handleSeek}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  stationListContainer: {
    flex: 1,
  },
  stationListWithPodcast: {
    marginBottom: 60, // Extra space for podcast progress bar
  },
});
