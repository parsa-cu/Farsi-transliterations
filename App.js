import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
const { Configuration, OpenAIApi } = require("openai");
import { NativeBaseProvider, Box, Button, Input, ScrollView, TextArea, theme } from "native-base";

import { setupURLPolyfill } from 'react-native-url-polyfill';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { GiftedChat, Bubble, Send, InputToolbar } from 'react-native-gifted-chat'
//import react native vector icons
import Ionicons from '@expo/vector-icons/Ionicons';
import { VARIABLE } from "@env"


setupURLPolyfill();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
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
        name: 'Finglish',
        avatar: 'https://github.com/parsa-cu/parsa-cu.github.io/blob/main/Logo.jpg?raw=true'
      }
    }
  ]);

  const [answer, setAnswer] = useState('');
  const [textInput, setTextInput] = useState('');




  const askOpenAi = async (messageText) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, [
      {
        _id: Math.random().toString(36).substring(7),
        text: messageText,
        createdAt: new Date().getTime(),
        user: {
          _id: 1,
          name: 'User'
        }
      }
    ]));



    const prompt = `Convert my input from Finglish to Farsi. Don't translate english to farsi, but only convert the english letters to farsi: ${messageText}`;

    
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",

      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
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
        createdAt: new Date().getTime(),
        user: {
          _id: 2,
          name: 'Finglish',
          avatar: 'https://github.com/parsa-cu/parsa-cu.github.io/blob/main/Logo.jpg?raw=true'
        }
      },


    ]));
    Clipboard.setStringAsync(answer);
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
            backgroundColor: '#2C3E50'
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
        //date style
        timeTextStyle={{
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

      // if (props.text && props.text.trim().length > 0) {
      //   askOpenAi(props.text.trim());
      // }
      askOpenAi(textInput);
      setTextInput('');
    }, [props]);

    return (
      <Send {...props} >
        <View style={styles.sendingContainer}>
          <Ionicons onPress={handleSend} name="caret-forward-circle" size={32} color="#E74C3C" />
        </View>
      </Send>
    );
  }

  const renderInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: '#333', // set the background color for the input toolbar
        }}
        primaryStyle={{
          alignItems: 'center',
          backgroundColor: '#333', // set the background color for the text input
        }}
      />
    );
  }
  const bg = "coolGray.800";

  return (

    <NativeBaseProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <GiftedChat
          messages={messages}
          textInputProps={{
            autoCorrect: false,
            value: textInput,
            onChangeText: setTextInput
          }}
          onSend={newMessage => {
            handleSend(newMessage);
            //clear text input
          }}
          user={{ _id: 1 }}
          renderBubble={renderBubble}
          placeholder='Type your message here...'
          alwaysShowSend
          renderSend={renderSend}
        // renderInputToolbar={renderInputToolbar}
        />

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
