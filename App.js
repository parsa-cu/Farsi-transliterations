import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
const { Configuration, OpenAIApi } = require("openai");
import { NativeBaseProvider, Box, Button, Input, ScrollView, TextArea } from "native-base";

import { setupURLPolyfill } from 'react-native-url-polyfill';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { GiftedChat, Bubble, Send } from 'react-native-gifted-chat'
//import react native vector icons
import Ionicons from '@expo/vector-icons/Ionicons';


setupURLPolyfill();

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);


export default function App() {
  const [messages, setMessages] = useState([
    /**
     * Mock message data
     */
    // example of system message
    {
      _id: 0,
      text: 'New seesion started.',
      createdAt: new Date().getTime(),
      system: true
    },
    // example of chat message
    {
      _id: 1,
      text: 'Hello! I can help you translate your Finglish to Farsi! \n \n سلام! من می‌توانم به شما در ترجمه‌ی متن فینگلیشتان به فارسی کمک کنم',

      user: {
        _id: 2,
        name: 'Open AI'
      }
    }
  ]);

  // helper method that is sends a message
  function handleSend(newMessage = []) {
    setMessages(GiftedChat.append(messages, newMessage));
  }
  const [textInput, setTextInput] = useState('');
  const [answer, setAnswer] = useState('');



  const copyToClipboard = () => {
    Clipboard.setStringAsync(answer);
    console.log(Clipboard.getStringAsync())
  }

  const askOpenAi = async (messageText) => {
    const prompt = `Convert my input from Finglish to Farsi. Don't translate english to farsi, but only convert the english letters to farsi: ${messageText}`;
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
      temperature: 0,
      stream: false,
    });
    console.log(response.data.choices[0].message.content);
    const answer = response.data.choices[0].message.content;
    setAnswer(answer);
    setMessages(previousMessages => GiftedChat.append(previousMessages, [
      {
        _id: Math.random().toString(36).substring(7),
        text: answer,
        user: {
          _id: 2,
          name: 'Test User'
        }
      }
    ]));
    copyToClipboard();
  };
  function renderBubble(props) {
    return (
      // Step 3: return the component
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            // Here is the color change
            backgroundColor: '#E74C3C'
          },
          left: {
            backgroundColor: '#84A59D'
          }
        }}
        textStyle={{
          right: {
            color: '#fff'
          },
          left: {
            color: '#fff'
          }
        }}
      />
    );
  }

  function renderSend(props) {
    const handleSend = useCallback(() => {
      if (props.text && props.text.trim().length > 0) {
        console.log(props.text)
        askOpenAi(props.text.trim());
      }
    }, [props]);

    return (
      <Send {...props} >
        <View style={styles.sendingContainer}>
          <Ionicons onPress={handleSend} name="caret-forward-circle" size={32} color="#E74C3C" />
        </View>
      </Send>
    );
  }

  return (
    
    <NativeBaseProvider>
      <GiftedChat
        messages={messages}
        onSend={newMessage => handleSend(newMessage)}
        user={{ _id: 1 }}
        renderBubble={renderBubble}
        placeholder='Type your message here...'
        alwaysShowSend
        renderSend={renderSend}
      />

      <SafeAreaView>
          {/* <View style={styles.textField}>
          <ScrollView>
            {answer && (<Text>{answer}</Text>)}
          </ScrollView>
            </View>
        <TextArea
          autoCorrect={false}
          autoCapitalize="none"
          placeholder="Enter your question"
          value={textInput}
          onChangeText={setTextInput}
        
        />
          <Button
            title="Ask OpenAI"
            onPress={askOpenAi}
            disabled={!textInput}
          >
            Ask OpenAI
          </Button>
 */}

          <StatusBar style="auto" />
      </SafeAreaView>
      

    </NativeBaseProvider>
  );
}

const styles = StyleSheet.create({
  textField: {
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingRight: '4%',
  },
  sendingContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});
