import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking,
  Alert,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuthStore } from '../store/auth';
import { supabase } from '../lib/supabase';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const [guardianEmail, setGuardianEmail] = useState('');
  const [guardians, setGuardians] = useState<string[]>([]);
  const [loadingGuardians, setLoadingGuardians] = useState(true);
  const [granting, setGranting] = useState(false);

  const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

  const fetchGuardians = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('guardian_access')
        .select('guardian_email')
        .eq('owner_id', user.id);

      if (error) throw error;
      setGuardians((data || []).map((g) => g.guardian_email));
    } catch (err: any) {
      console.warn('Error fetching guardians:', err.message);
    } finally {
      setLoadingGuardians(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGuardians();
  }, [fetchGuardians]);

  const handleExport = (type: 'json' | 'csv') => {
    if (!user) return;
    const url = `${apiBaseUrl}/export/${type}?user_id=${user.id}`;
    Linking.openURL(url).catch((err) => {
      Alert.alert('Error', `Failed to open export link: ${err.message}`);
    });
  };

  const handleGrantAccess = async () => {
    if (!guardianEmail.trim() || !user) return;
    setGranting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/guardian/grant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          owner_id: user.id,
          guardian_email: guardianEmail.trim(),
        }),
      });

      if (!response.ok) throw new Error('Grant access request failed.');

      Alert.alert('Success', `Shared log access with ${guardianEmail.trim()}`);
      setGuardianEmail('');
      fetchGuardians();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Server connection failed.');
    } finally {
      setGranting(false);
    }
  };

  const handleRevokeAccess = async (email: string) => {
    if (!user) return;
    Alert.alert(
      'Revoke Access',
      `Are you sure you want to stop sharing logs with ${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('guardian_access')
                .delete()
                .eq('owner_id', user.id)
                .eq('guardian_email', email);

              if (error) throw error;
              fetchGuardians();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to revoke access');
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <FlatList
        data={guardians}
        keyExtractor={(item) => item}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Account Settings</Text>

            {/* Profile Info */}
            <View style={styles.card}>
              <Text style={styles.label}>Email Address</Text>
              <Text style={styles.value}>{user?.email || 'Not logged in'}</Text>
            </View>

            {/* Data Portability / Export */}
            <Text style={styles.sectionHeader}>Data Portability</Text>
            <View style={styles.card}>
              <Text style={styles.cardInfo}>Export all your logged moments and AI metadata.</Text>
              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.exportBtn} onPress={() => handleExport('json')}>
                  <Text style={styles.exportBtnText}>Export JSON</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.exportBtn} onPress={() => handleExport('csv')}>
                  <Text style={styles.exportBtnText}>Export CSV</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Guardian Mode Grant */}
            <Text style={styles.sectionHeader}>Guardian Mode</Text>
            <View style={styles.card}>
              <Text style={styles.cardInfo}>
                Grant parents, mentors, or coaches read-only access to your timeline logs.
              </Text>
              <TextInput
                style={styles.input}
                placeholder="guardian@example.com"
                placeholderTextColor="#666"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={guardianEmail}
                onChangeText={setGuardianEmail}
              />
              <TouchableOpacity
                style={[styles.grantBtn, !guardianEmail.trim() && styles.btnDisabled]}
                onPress={handleGrantAccess}
                disabled={granting || !guardianEmail.trim()}
              >
                {granting ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.grantBtnText}>Grant Access</Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionHeader}>Current Guardians</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.guardianRow}>
            <Text style={styles.guardianText}>{item}</Text>
            <TouchableOpacity onPress={() => handleRevokeAccess(item)}>
              <Text style={styles.revokeText}>Revoke</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          loadingGuardians ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No active guardians.</Text>
            </View>
          )
        }
        ListFooterComponent={
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        }
        contentContainerStyle={styles.scrollContent}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0c',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#16161a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a30',
    padding: 20,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#8e8e93',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  cardInfo: {
    color: '#8e8e93',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  exportBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a30',
  },
  exportBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
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
  grantBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: '#3a3a3c',
    opacity: 0.5,
  },
  grantBtnText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 15,
  },
  guardianRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#16161a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a30',
    padding: 16,
    marginBottom: 8,
  },
  guardianText: {
    color: '#ffffff',
    fontSize: 15,
  },
  revokeText: {
    color: '#ff453a',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: '#16161a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a30',
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    color: '#8e8e93',
    fontSize: 14,
  },
  signOutButton: {
    backgroundColor: '#ff453a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  signOutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
