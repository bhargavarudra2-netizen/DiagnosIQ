import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SectionList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';

interface Entry {
  id: string;
  timestamp: string;
  raw_text: string;
  tags?: string[];
  category?: string;
  activity?: string;
}

interface SectionData {
  title: string; // Date string: "YYYY-MM-DD" or "Today", "Yesterday"
  data: Entry[];
}

export default function TimelineScreen() {
  const { user } = useAuthStore();
  const [sections, setSections] = useState<SectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const formatHeaderDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }

      return date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const groupEntriesByDate = (entriesList: Entry[]): SectionData[] => {
    const map: { [key: string]: Entry[] } = {};
    entriesList.forEach((entry) => {
      const dateObj = new Date(entry.timestamp);
      const dateKey = dateObj.toISOString().split('T')[0]; // "YYYY-MM-DD"
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(entry);
    });

    const sortedDates = Object.keys(map).sort((a, b) => b.localeCompare(a)); // Newest date first

    return sortedDates.map((date) => ({
      title: date,
      // Sort entries within the same day by timestamp descending (newest at top or bottom? usually newest at bottom within a day, or descending overall. Let's do descending so newest commits are easy to see).
      data: map[date].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    }));
  };

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('id, timestamp, raw_text, tags, activity')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setSections(groupEntriesByDate(data || []));
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchEntries();

    // Set up realtime channel
    if (!user) return;
    const channel = supabase
      .channel('entries_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'entries',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchEntries]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEntries();
  };

  const renderItem = ({ item }: { item: Entry }) => {
    const timeStr = new Date(item.timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <Text style={styles.entryTime}>{timeStr}</Text>
          {item.activity && (
            <View style={styles.activityBadge}>
              <Text style={styles.activityText}>{item.activity}</Text>
            </View>
          )}
        </View>
        <Text style={styles.entryText}>{item.raw_text}</Text>
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.map((tag) => (
              <View key={tag} style={styles.tagBadge}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeaderContainer}>
            <Text style={styles.sectionHeader}>{formatHeaderDate(title)}</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No commits yet.</Text>
            <Text style={styles.emptySubtext}>Type a moment on the Home screen to get started.</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0c',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0a0a0c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  sectionHeaderContainer: {
    backgroundColor: '#0a0a0c',
    paddingVertical: 12,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  entryCard: {
    backgroundColor: '#16161a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a30',
    padding: 16,
    marginBottom: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryTime: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '500',
  },
  activityBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  activityText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '600',
  },
  entryText: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  tagBadge: {
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#0a84ff',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8e8e93',
    textAlign: 'center',
  },
});
