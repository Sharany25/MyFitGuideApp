import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useChatbot } from '../hooks/useChatbot';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  fromUser: boolean;
}

export const ChatbotScreen: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const { sendMessage, loading, error } = useChatbot();
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input,
      fromUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    const reply = await sendMessage(input);

    const botMessage = {
      id: (Date.now() + 1).toString(),
      text: reply,
      fromUser: false,
    };

    setMessages((prev) => [...prev, botMessage]);
  };

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const keyboardVerticalOffset = Platform.OS === 'ios' ? insets.bottom + 10 : 0;

  const renderBubble = ({ item }: { item: Message }) => {
    return (
      <View
        style={[
          styles.messageBubble,
          item.fromUser ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    return (
      <View style={styles.typingIndicatorContainer}>
        <LottieView
          source={require('../../assets/animations/Anima Bot.json')}
          autoPlay
          loop
          style={styles.typingIndicatorLottie}
        />
      </View>
    );
  };

  return (
    <LinearGradient colors={['#1D2A32', '#163B48', '#1D2A32']} style={styles.container}>
      <SafeAreaView style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <KeyboardAvoidingView
          style={styles.innerContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.flexOne}>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                  <Feather name="arrow-left" size={28} color="#2CFD89" />
                </TouchableOpacity>
              </View>

              {messages.length === 0 ? (
                <View style={styles.welcomeContainer}>
                  <LottieView
                    source={require('../../assets/animations/Anima Bot.json')}
                    autoPlay
                    loop
                    style={styles.lottie}
                  />
                  <Text style={styles.welcomeText}>
                    Soy tu asistente virtual para el uso de MyFitGuide. ¡Pregunta lo que necesites!
                  </Text>
                </View>
              ) : (
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  keyExtractor={(item) => item.id}
                  renderItem={renderBubble}
                  contentContainerStyle={styles.messages}
                  keyboardShouldPersistTaps="handled"
                />
              )}

              {loading && renderTypingIndicator()}
              {error && <Text style={styles.error}>{error}</Text>}

              <View style={styles.inputWrapper}>
                <LinearGradient
                  colors={['#1D2A32', '#163B48']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.inputContainer}
                >
                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Escribe tu mensaje..."
                    placeholderTextColor="#7a8a94"
                    style={styles.input}
                    multiline
                    maxLength={500}
                    returnKeyType="send"
                    onSubmitEditing={handleSend}
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity onPress={handleSend} style={styles.sendButton} activeOpacity={0.7}>
                    <Feather name="send" size={22} color="#1D2A32" />
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#1D2A32',
  },
  innerContainer: {
    flex: 1,
  },
  flexOne: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 15 : 20,
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#163B48',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  backButton: {
    backgroundColor: '#0f292f',
    padding: 10,
    borderRadius: 50,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  lottie: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 25,
  },
  welcomeText: {
    color: '#2CFD89',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  messages: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    flexGrow: 1,
  },
  messageBubble: {
    padding: 14,
    marginVertical: 6,
    borderRadius: 20,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  userBubble: {
    backgroundColor: '#2CFD89',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  botBubble: {
    backgroundColor: '#34495E',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 22,
  },
  inputWrapper: {
    paddingHorizontal: 15,
    backgroundColor: 'transparent',
    paddingBottom: Platform.OS === 'ios' ? 15 : 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#2CFD89',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    backgroundColor: 'transparent',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 12 : 10,
    paddingBottom: Platform.OS === 'ios' ? 12 : 10,
    color: '#fff',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#2CFD89',
    padding: 14,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2CFD89',
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  error: {
    color: '#FF6B6B',
    textAlign: 'center',
    marginVertical: 10,
  },
  typingIndicatorContainer: {
    alignSelf: 'flex-start',
    marginLeft: 15,
    marginVertical: 10,
    backgroundColor: '#34495E',
    borderRadius: 20,
    padding: 8,
  },
  typingIndicatorLottie: {
    width: 50,
    height: 30,
  },
});

export default ChatbotScreen;