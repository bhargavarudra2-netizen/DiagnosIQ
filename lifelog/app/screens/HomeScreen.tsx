import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';

export default function HomeScreen() {
  const [text, setText] = useState('');
  const [committing, setCommitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const { user } = useAuthStore();

  const handleCommit = async () => {
    if (!text.trim()) return;
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setCommitting(true);
    setStatusMsg(null);

    try {
      const { error } = await supabase.from('entries').insert({
        user_id: user.id,
        raw_text: text.trim(),
        timestamp: new Date().toISOString(),
      });

      if (error) throw error;

      setText('');
      setStatusMsg('Moment committed.');
      // Auto-clear success message after 2 seconds
      setTimeout(() => setStatusMsg(null), 2000);
    } catch (err: any) {
      Alert.alert('Failed to Commit', err.message || 'Unknown database error');
    } finally {
      setCommitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.header}>What's happening right now?</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Type a moment..."
            placeholderTextColor="#666"
            value={text}
            onChangeText={setText}
            autoCorrect={true}
            autoFocus={true}
          />
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.statusText}>{statusMsg || ''}</Text>
          <TouchableOpacity
            style={[styles.button, !text.trim() && styles.buttonDisabled]}
            onPress={handleCommit}
            disabled={committing || !text.trim()}
          >
            {committing ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Text style={styles.buttonText}>Commit</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0c',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  inputContainer: {
    flex: 0.6,
    backgroundColor: '#16161a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a30',
    padding: 16,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 18,
    textAlignVertical: 'top',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  statusText: {
    color: '#30d158',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#3a3a3c',
    opacity: 0.5,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});
