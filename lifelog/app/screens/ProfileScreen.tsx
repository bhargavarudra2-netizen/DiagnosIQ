import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuthStore } from '../store/auth';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email || 'Not logged in'}</Text>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0c',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#16161a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a30',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  signOutButton: {
    backgroundColor: '#ff453a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  signOutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
