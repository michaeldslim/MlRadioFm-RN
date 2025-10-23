import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { IPlayerState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface IHeaderProps {
  playerState: IPlayerState;
  searchText: string;
  showingSearch: boolean;
  onSearchToggle: () => void;
  onSearchTextChange: (text: string) => void;
}

export const Header: React.FC<IHeaderProps> = ({
  playerState,
  searchText,
  showingSearch,
  onSearchToggle,
  onSearchTextChange,
}) => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ko' : 'en');
  };

  return (
    <LinearGradient
      colors={['#f8f9fa', '#e9ecef']}
      style={styles.container}
    >
      <View style={styles.headerContent}>
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <LinearGradient
              colors={['#007AFF', '#AF52DE']}
              style={styles.iconGradient}
            >
              <Ionicons name="radio" size={24} color="white" />
            </LinearGradient>
            <Text style={styles.title}>{t.appTitle}</Text>
          </View>
          
          {playerState.currentStation ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {playerState.currentStation.name}
            </Text>
          ) : (
            <Text style={styles.subtitle}>{t.selectStation}</Text>
          )}
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.languageButton}
            onPress={toggleLanguage}
          >
            <Text style={styles.languageText}>
              {language === 'en' ? 'KO' : 'EN'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.searchButton}
            onPress={onSearchToggle}
          >
            <Ionicons
              name={showingSearch ? 'close-circle' : 'search'}
              size={24}
              color="#007AFF"
            />
          </TouchableOpacity>
        </View>
      </View>

      {showingSearch && (
        <Animated.View style={styles.searchContainer}>
          <Ionicons name="search" size={16} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={t.searchPlaceholder}
            value={searchText}
            onChangeText={onSearchTextChange}
            placeholderTextColor="#8E8E93"
          />
        </Animated.View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 50, // Account for status bar
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  languageText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  searchButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
});
