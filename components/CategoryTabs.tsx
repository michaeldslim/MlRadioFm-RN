import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StationCategory, IRadioStation } from '../types';
import { categoryInfo, filterStationsByCategory } from '../utils/categoryUtils';

interface ICategoryTabsProps {
  selectedCategory: StationCategory;
  stations: IRadioStation[];
  onCategorySelect: (category: StationCategory) => void;
}

export const CategoryTabs: React.FC<ICategoryTabsProps> = ({
  selectedCategory,
  stations,
  onCategorySelect,
}) => {
  const categories = Object.values(StationCategory);

  const renderTabButton = (category: StationCategory) => {
    const isSelected = selectedCategory === category;
    const categoryData = categoryInfo[category];
    const stationCount = filterStationsByCategory(stations, category).length;

    return (
      <TouchableOpacity
        key={category}
        style={styles.tabButton}
        onPress={() => onCategorySelect(category)}
      >
        {isSelected ? (
          <LinearGradient
            colors={[categoryData.color, `${categoryData.color}CC`]}
            style={styles.selectedTabBackground}
          >
            <View style={styles.tabContent}>
              <Ionicons name="radio" size={11} color="white" />
              <Text style={[styles.tabText, styles.selectedTabText]}>
                {category}
              </Text>
              {stationCount > 0 && (
                <View style={[styles.countBadge, { backgroundColor: 'white' }]}>
                  <Text style={[styles.countText, { color: categoryData.color }]}>
                    {stationCount}
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.unselectedTabBackground}>
            <View style={styles.tabContent}>
              <Ionicons name="radio" size={11} color={categoryData.color} />
              <Text style={[styles.tabText, { color: '#1C1C1E' }]}>
                {category}
              </Text>
              {stationCount > 0 && (
                <View style={[styles.countBadge, { backgroundColor: categoryData.color }]}>
                  <Text style={[styles.countText, { color: 'white' }]}>
                    {stationCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.navigationContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {categories.map(renderTabButton)}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(242, 242, 247, 0.3)',
  },
  navigationContainer: {
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  tabButton: {
    marginRight: 8,
  },
  selectedTabBackground: {
    borderRadius: 14,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  unselectedTabBackground: {
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(142, 142, 147, 0.3)',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 7,
    minWidth: 51,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 4,
  },
  selectedTabText: {
    color: 'white',
  },
  countBadge: {
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  countText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
});
