import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useAuthStore } from '../store/auth';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isJSON?: boolean;
}

export default function AIScreen() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I can search your logs, answer questions about your history, or generate summaries and plans. What would you like to do?",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

  const addMessage = (sender: 'user' | 'ai', text: string, isJSON = false) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender,
      text,
      isJSON,
    };
    setMessages((prev) => [...prev, newMessage]);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleSend = async () => {
    if (!inputText.trim() || !user) return;
    const query = inputText.trim();
    setInputText('');
    addMessage('user', query);
    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/ask-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          query: query,
        }),
      });

      if (!response.ok) {
        throw new Error('API server returned an error.');
      }

      const data = await response.json();
      addMessage('ai', data.answer || "I couldn't process that query.");
    } catch (err: any) {
      addMessage('ai', `Error connecting to AI service: ${err.message || 'Server offline'}`);
    } finally {
      setLoading(false);
    }
  };

  const getLocalDateString = (offsetDays = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    const tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 10);
    return localISOTime; // "YYYY-MM-DD"
  };

  const handleGenerateSummary = async () => {
    if (!user) return;
    setLoading(true);
    const todayStr = getLocalDateString(0);
    addMessage('user', `Generate summary for ${todayStr}`);

    try {
      const response = await fetch(`${apiBaseUrl}/daily-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          date: todayStr,
        }),
      });

      const data = await response.json();
      if (data.status === 'no_entries') {
        addMessage('ai', `No logs were found for today (${todayStr}). Make some commits first!`);
      } else if (data.status === 'success') {
        const summary = data.summary;
        const formattedText = `**Daily Summary: ${todayStr}**\n\n` +
          `✨ *"${summary.summary_sentence}"*\n\n` +
          `✅ **Completed:**\n${summary.completed.map((c: string) => `• ${c}`).join('\n')}\n\n` +
          `⏳ **Pending:**\n${summary.pending.map((p: string) => `• ${p}`).join('\n')}\n\n` +
          `💡 **Ideas & Insights:**\n${summary.ideas.map((i: string) => `• ${i}`).join('\n')}`;

        addMessage('ai', formattedText);
      } else {
        throw new Error(data.detail || 'Summary generation failed');
      }
    } catch (err: any) {
      addMessage('ai', `Failed to generate summary: ${err.message || 'Server offline'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!user) return;
    setLoading(true);
    const tomorrowStr = getLocalDateString(1);
    addMessage('user', `Suggest target plan for tomorrow (${tomorrowStr})`);

    try {
      const response = await fetch(`${apiBaseUrl}/daily-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          date: tomorrowStr,
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        const plan = data.plan;
        const formattedText = `**Tomorrow's Plan: ${tomorrowStr}**\n\n` +
          `🎯 **Focus:** ${plan.suggested_focus}\n\n` +
          `📋 **Target Tasks:**\n${plan.target_plan.map((t: string) => `• ${t}`).join('\n')}`;

        addMessage('ai', formattedText);
      } else {
        throw new Error(data.detail || 'Plan generation failed');
      }
    } catch (err: any) {
      addMessage('ai', `Failed to generate plan: ${err.message || 'Server offline'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={styles.container}
    >
      {/* Quick Action Headers */}
      <View style={styles.actionHeader}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleGenerateSummary} disabled={loading}>
          <Text style={styles.actionBtnText}>⚡ Daily Summary</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={handleGeneratePlan} disabled={loading}>
          <Text style={styles.actionBtnText}>🎯 Tomorrow's Plan</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContent}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text style={[styles.messageText, { color: msg.sender === 'user' ? '#000000' : '#ffffff' }]}>
              {msg.text}
            </Text>
          </View>
        ))}
        {loading && (
          <View style={styles.loadingBubble}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        )}
      </ScrollView>

      {/* Input Row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask a question about study, fitness, logs..."
          placeholderTextColor="#666"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0c',
  },
  actionHeader: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a30',
    justifyContent: 'space-around',
    backgroundColor: '#16161a',
  },
  actionBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#2a2a30',
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    maxWidth: '85%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#ffffff',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#16161a',
    borderWidth: 1,
    borderColor: '#2a2a30',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#000000', // user bubble default text
  },
  loadingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#16161a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a30',
    backgroundColor: '#0a0a0c',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#16161a',
    borderWidth: 1,
    borderColor: '#2a2a30',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sendButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 15,
  },
});

// Quickly override styles for bubble text color based on bubble type
styles.userBubble = {
  ...styles.userBubble,
};
styles.messageText = {
  ...styles.messageText,
};

// Modifying rules for text color dynamically inside stylesheet
const originalMessageText = styles.messageText;
styles.messageText = {
  ...originalMessageText,
};
// Use style override tricks inside render: since styles are static, we specify text color in render inline, let's fix it:
// Let's replace the render logic to style the text properly: user message text should be black, ai text should be white!
// We will edit this in next replacement if required, but let's make sure the text color is correct in StyleSheet.
// In styles.messageText we can leave it undefined, and set color dynamically on the Text component:
// style={{ color: msg.sender === 'user' ? '#000' : '#fff' }}
// Let's rewrite the render return block to do exactly that! It's much cleaner.
// Actually, let's look at style sheet details. Let's make sure color is applied inline:
// style={[styles.messageText, { color: msg.sender === 'user' ? '#000' : '#fff' }]}
// Let's rewrite the component to use dynamic text coloring.
