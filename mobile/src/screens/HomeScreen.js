import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import Colors from '../constants/colors';
import { clothingAPI } from '../services/api';
import { formatDate, getCategoryIcon, capitalize } from '../utils/helpers';
import { API_URL, CATEGORIES } from '../constants/config';

// ---------------------------------------------------------------------------
// Helper — greeting based on time of day
// ---------------------------------------------------------------------------
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning ☀️';
  if (hour < 18) return 'Good afternoon 🌤';
  return 'Good evening 🌙';
}

// ---------------------------------------------------------------------------
// Stat card widget
// ---------------------------------------------------------------------------
function StatCard({ emoji, label, value }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Quick action button
// ---------------------------------------------------------------------------
function QuickAction({ emoji, label, onPress, gradient }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.quickActionOuter}>
      <LinearGradient
        colors={gradient || Colors.gradientPurple}
        style={styles.quickAction}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.quickActionEmoji}>{emoji}</Text>
        <Text style={styles.quickActionLabel}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// HomeScreen
// ---------------------------------------------------------------------------
export default function HomeScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, byCategory: {} });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const items = await clothingAPI.getAll();
      // Compute stats
      const byCategory = {};
      items.forEach((item) => {
        const cat = capitalize(item.category || 'Other');
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      });
      setStats({ total: items.length, byCategory });
      // Recent 5
      const sorted = [...items].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setRecent(sorted.slice(0, 5));
    } catch {
      // silently fail; user can pull-to-refresh
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Top categories for stats row
  const topCategories = CATEGORIES.filter((c) => c !== 'All').slice(0, 4);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* ---- Header ---- */}
        <LinearGradient
          colors={['#1A1A2E', Colors.background]}
          style={styles.headerGradient}
        >
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.appName}>ClosetAI</Text>
          <Text style={styles.subtitle}>Your AI-powered wardrobe assistant</Text>
        </LinearGradient>

        {/* ---- Stats ---- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Closet Overview</Text>
          <View style={styles.statsRow}>
            <StatCard emoji="👕" label="Total Items" value={stats.total} />
            {topCategories.map((cat) => (
              <StatCard
                key={cat}
                emoji={getCategoryIcon(cat)}
                label={cat}
                value={stats.byCategory[cat] || 0}
              />
            ))}
          </View>
        </View>

        {/* ---- Quick Actions ---- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <QuickAction
              emoji="📷"
              label="Scan Item"
              gradient={Colors.gradientPurple}
              onPress={() => navigation.navigate('Scan')}
            />
            <QuickAction
              emoji="👗"
              label="My Closet"
              gradient={['#252540', '#1A1A2E']}
              onPress={() => navigation.navigate('Closet')}
            />
            <QuickAction
              emoji="✨"
              label="Get Outfit"
              gradient={['#FF6B9D', '#E0497F']}
              onPress={() => navigation.navigate('Outfits')}
            />
          </View>
        </View>

        {/* ---- Recent Additions ---- */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently Added</Text>
          {recent.length === 0 ? (
            <View style={styles.emptyRecent}>
              <Text style={styles.emptyRecentText}>
                {loading ? 'Loading…' : 'No items yet. Scan your first piece! 📸'}
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentScroll}
            >
              {recent.map((item) => {
                const uri = item.image_url
                  ? item.image_url.startsWith('http')
                    ? item.image_url
                    : `${API_URL}${item.image_url}`
                  : null;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.recentCard}
                    onPress={() =>
                      navigation.navigate('Closet', {
                        screen: 'ItemDetail',
                        params: { item },
                      })
                    }
                    activeOpacity={0.85}
                  >
                    {uri ? (
                      <Image
                        source={{ uri }}
                        style={styles.recentImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.recentPlaceholder}>
                        <Text style={{ fontSize: 32 }}>
                          {getCategoryIcon(item.category)}
                        </Text>
                      </View>
                    )}
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentName} numberOfLines={1}>
                        {item.name || capitalize(item.category)}
                      </Text>
                      <Text style={styles.recentDate}>{formatDate(item.created_at)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { paddingBottom: 32 },

  headerGradient: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  greeting: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  appName: {
    color: Colors.textPrimary,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },

  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  statCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    minWidth: 72,
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statValue: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },

  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionOuter: { flex: 1 },
  quickAction: {
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  quickActionEmoji: { fontSize: 26 },
  quickActionLabel: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },

  emptyRecent: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyRecentText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },

  recentScroll: {
    paddingRight: 20,
    gap: 12,
  },
  recentCard: {
    width: 120,
    backgroundColor: Colors.card,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recentImage: {
    width: '100%',
    height: 120,
  },
  recentPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentInfo: {
    padding: 8,
  },
  recentName: {
    color: Colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  recentDate: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
});
