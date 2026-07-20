import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';

interface Project {
  id: string;
  name: string;
  color: string;
  count?: number;
}

export default function AnalyticsScreen() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [streak, setStreak] = useState(0);
  const [categories, setCategories] = useState<{ [key: string]: number }>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#0a84ff'); // default blue

  const colors = ['#0a84ff', '#30d158', '#ff9f0a', '#ff453a', '#bf5af2', '#64d2ff'];
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`${apiBaseUrl}/analytics?user_id=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');

      const data = await response.json();
      setStreak(data.streak || 0);
      setCategories(data.categories || {});
      setProjects(data.projects || []);
    } catch (error: any) {
      console.warn('Analytics API error, falling back to local projects list:', error);
      // Fallback: fetch projects directly from Supabase
      const { data } = await supabase.from('projects').select('*').eq('user_id', user.id);
      if (data) setProjects(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleAddProject = async () => {
    if (!newProjectName.trim() || !user) return;
    try {
      const { error } = await supabase.from('projects').insert({
        user_id: user.id,
        name: newProjectName.trim(),
        color: selectedColor,
      });

      if (error) throw error;

      setNewProjectName('');
      fetchAnalytics();
      Alert.alert('Success', 'Project created successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not create project');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const totalEntries = Object.values(categories).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
      }
    >
      {/* Streak Dashboard Card */}
      <View style={styles.streakCard}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <View style={styles.streakDetails}>
          <Text style={styles.streakNumber}>{streak}</Text>
          <Text style={styles.streakSub}>Day Commit Streak</Text>
        </View>
      </View>

      {/* Category Distribution Dashboard */}
      <View style={styles.dashboardSection}>
        <Text style={styles.sectionHeader}>Category Distribution</Text>
        <View style={styles.sectionCard}>
          {totalEntries === 0 ? (
            <Text style={styles.emptyText}>No categorized logs yet.</Text>
          ) : (
            Object.entries(categories).map(([category, count]) => {
              const percentage = Math.round((count / totalEntries) * 100);
              return (
                <View key={category} style={styles.barRow}>
                  <View style={styles.barLabels}>
                    <Text style={styles.barLabelText}>{category}</Text>
                    <Text style={styles.barPercentText}>{percentage}%</Text>
                  </View>
                  <View style={styles.barBackground}>
                    <View style={[styles.barFill, { width: `${percentage}%` }]} />
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>

      {/* Projects Management Section */}
      <View style={styles.dashboardSection}>
        <Text style={styles.sectionHeader}>Active Projects</Text>
        <View style={styles.sectionCard}>
          {projects.length === 0 ? (
            <Text style={styles.emptyText}>No projects active.</Text>
          ) : (
            projects.map((project) => (
              <View key={project.id} style={styles.projectRow}>
                <View style={styles.projectNameGroup}>
                  <View style={[styles.projectColorCircle, { backgroundColor: project.color }]} />
                  <Text style={styles.projectNameText}>{project.name}</Text>
                </View>
                {project.count !== undefined && (
                  <Text style={styles.projectCountText}>{project.count} commits</Text>
                )}
              </View>
            ))
          )}
        </View>
      </View>

      {/* Create Project Form */}
      <View style={styles.dashboardSection}>
        <Text style={styles.sectionHeader}>Create New Project</Text>
        <View style={styles.sectionCard}>
          <TextInput
            style={styles.input}
            placeholder="Project Name (e.g. Fitness, Study)"
            placeholderTextColor="#666"
            value={newProjectName}
            onChangeText={setNewProjectName}
          />
          <Text style={styles.colorLabel}>Select Color</Text>
          <View style={styles.colorRow}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorBubble,
                  { backgroundColor: color },
                  selectedColor === color && styles.selectedColorBubble,
                ]}
                onPress={() => setSelectedColor(color)}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.button} onPress={handleAddProject}>
            <Text style={styles.buttonText}>Add Project</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0c',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0a0a0c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakCard: {
    backgroundColor: '#16161a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a30',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
  },
  streakEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  streakDetails: {
    justifyContent: 'center',
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  streakSub: {
    fontSize: 14,
    color: '#8e8e93',
    marginTop: 2,
  },
  dashboardSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#16161a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a30',
    padding: 20,
  },
  emptyText: {
    color: '#8e8e93',
    fontSize: 14,
    textAlign: 'center',
  },
  barRow: {
    marginBottom: 16,
  },
  barLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  barLabelText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  barPercentText: {
    color: '#8e8e93',
    fontSize: 13,
  },
  barBackground: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  projectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  projectNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectColorCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  projectNameText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  projectCountText: {
    color: '#8e8e93',
    fontSize: 13,
  },
  input: {
    backgroundColor: '#0a0a0c',
    borderWidth: 1,
    borderColor: '#2a2a30',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 15,
    marginBottom: 16,
  },
  colorLabel: {
    color: '#8e8e93',
    fontSize: 13,
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  colorBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  selectedColorBubble: {
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  button: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '600',
  },
});
