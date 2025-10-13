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
  Animated,
} from 'react-native';
import { useChatbot } from '../hooks/useChatbot';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

const PALETTE = {
  background_gradient: ['#1D2A32', '#163B48', '#1D2A32'] as const,
  primary_gradient: ['#2CFD89', '#00A3FF'] as const,
  primary: '#2CFD89',
  text_primary: '#FFFFFF',
  text_secondary: '#B0C4DE',
  bot_bubble: '#2C3E50',
  dark: '#1D2A32',
  danger: '#FF4757',
};

interface Message {
  id: string;
  text: string;
  fromUser: boolean;
}

const AnimatedBubble = ({ item }: { item: Message }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const isUser = item.fromUser;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const bubbleContent = (
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
            <Text style={isUser ? styles.userMessageText : styles.botMessageText}>{item.text}</Text>
        </View>
    );

    return (
        <Animated.View style={{ opacity: fadeAnim, alignSelf: isUser ? 'flex-end' : 'flex-start' }}>
            {isUser ? (
                <LinearGradient
                    colors={PALETTE.primary_gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.userBubbleGradient}
                >
                    {bubbleContent}
                </LinearGradient>
            ) : (
                bubbleContent
            )}
        </Animated.View>
    );
};


export const ChatbotScreen: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const { sendMessage, loading, error } = useChatbot();
  const navigation = useNavigation();
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const sendButtonScale = useRef(new Animated.Value(1)).current;

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { id: Date.now().toString(), text: input, fromUser: true };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');

    const reply = await sendMessage(currentInput);

    const botMessage = { id: (Date.now() + 1).toString(), text: reply, fromUser: false };
    setMessages((prev) => [...prev, botMessage]);
  };

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const onPressInSend = () => {
    Animated.spring(sendButtonScale, { toValue: 0.9, useNativeDriver: true }).start();
  };

  const onPressOutSend = () => {
    Animated.spring(sendButtonScale, { toValue: 1, useNativeDriver: true }).start();
    handleSend();
  };

  const renderTypingIndicator = () => (
    <View style={styles.typingIndicatorContainer}>
      <LottieView
        source={require('../../assets/animations/Anima Bot.json')}
        autoPlay
        loop
        style={styles.typingIndicatorLottie}
      />
    </View>
  );

  return (
    <LinearGradient colors={PALETTE.background_gradient} style={styles.container}>
      <SafeAreaView style={styles.flexOne}>
        <KeyboardAvoidingView
          style={styles.flexOne}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? -insets.bottom : 0}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.flexOne}>
              <BlurView intensity={80} tint="dark" style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                  <Feather name="arrow-left" size={24} color={PALETTE.primary} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Asistente Virtual</Text>
                    <View style={styles.statusContainer}>
                        <View style={styles.onlineIndicator} />
                        <Text style={styles.statusText}>En línea</Text>
                    </View>
                </View>
                <View style={styles.headerRightPlaceholder} />
              </BlurView>

              {messages.length === 0 && !loading ? (
                <View style={styles.welcomeContainer}>
                  <LottieView
                    source={require('../../assets/animations/Anima Bot.json')}
                    autoPlay
                    loop
                    style={styles.lottie}
                  />
                  <Text style={styles.welcomeText}>
                    Soy tu asistente de MyFitGuide.
                  </Text>
                  <Text style={styles.welcomeSubtext}>
                    ¡Pregúntame lo que necesites!
                  </Text>
                </View>
              ) : (
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  keyExtractor={(item) => item.id}
                  renderItem={({item}) => <AnimatedBubble item={item}/>}
                  contentContainerStyle={[styles.messages, { paddingBottom: insets.bottom + 80, paddingTop: insets.top + 80 }]}
                  keyboardShouldPersistTaps="handled"
                />
              )}

              {loading && renderTypingIndicator()}
              {error && <Text style={styles.error}>{error}</Text>}

              <View style={[styles.inputWrapper, { paddingBottom: insets.bottom || 15 }]}>
                <BlurView intensity={80} tint="dark" style={styles.inputContainer}>
                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Escribe tu mensaje..."
                    placeholderTextColor={PALETTE.text_secondary}
                    style={styles.input}
                    multiline
                    returnKeyType="send"
                    onSubmitEditing={handleSend}
                    blurOnSubmit={false}
                  />
                  <TouchableOpacity
                    onPressIn={onPressInSend}
                    onPressOut={onPressOutSend}
                    activeOpacity={1}
                    disabled={!input.trim()}
                  >
                    <Animated.View style={[styles.sendButton, { transform: [{ scale: sendButtonScale }] }]}>
                      {loading ? <ActivityIndicator size="small" color={PALETTE.dark} /> : <Feather name="send" size={20} color={PALETTE.dark} />}
                    </Animated.View>
                  </TouchableOpacity>
                </BlurView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flexOne: { flex: 1 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 15,
    paddingHorizontal: 15,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(44, 62, 80, 0.5)',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: PALETTE.text_primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PALETTE.primary,
    marginRight: 6,
    shadowColor: PALETTE.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  statusText: {
    color: PALETTE.text_secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  headerRightPlaceholder: {
    width: 44,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  lottie: {
    width: width * 0.6,
    height: width * 0.6,
  },
  welcomeText: {
    color: PALETTE.text_primary,
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: -20
  },
  welcomeSubtext:{
    color: PALETTE.primary,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 8
  },
  messages: {
    paddingHorizontal: 15,
  },
  messageBubble: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginVertical: 5,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: 'transparent',
  },
  userBubbleGradient: {
    borderRadius: 20,
    borderBottomRightRadius: 5,
    alignSelf: 'flex-end',
    marginVertical: 5,
  },
  botBubble: {
    backgroundColor: PALETTE.bot_bubble,
    alignSelf: 'flex-start',
    borderRadius: 20,
    borderBottomLeftRadius: 5,
  },
  userMessageText: {
    color: PALETTE.dark,
    fontSize: 16,
    fontWeight: '500',
  },
  botMessageText: {
    color: PALETTE.text_primary,
    fontSize: 16,
  },
  inputWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: 'transparent',
    color: PALETTE.text_primary,
    fontSize: 16,
    paddingTop: Platform.OS === 'ios' ? 2 : 0,
    paddingBottom: Platform.OS === 'ios' ? 2 : 0,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: PALETTE.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: PALETTE.danger,
    textAlign: 'center',
    marginVertical: 10,
  },
  typingIndicatorContainer: {
    alignSelf: 'flex-start',
    marginLeft: 15,
    marginVertical: 10,
    backgroundColor: PALETTE.bot_bubble,
    borderRadius: 20,
    padding: 8,
  },
  typingIndicatorLottie: {
    width: 50,
    height: 30,
  },
});

export default ChatbotScreen;