import React, { useEffect, useRef, useState } from 'react';
import { Chat, MessageType } from '@flyerhq/react-native-chat-ui'
import { v4 as uuidv4 } from 'uuid';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import { RootDrawerParamList } from '../App';
import { useIsFocused } from '@react-navigation/native';

type Props = DrawerScreenProps<RootDrawerParamList, 'Ingest'>;

const Ingest: React.FC<Props> = ({ route, navigation }: Props) => {
  const [location, setLocation] = useState<string>(route.params.location);
  const [messages, setMessages] = useState<MessageType.Any[]>([]);
  const questionAsked = useRef(false);

  const questions = [
    `Did you discover any hidden culinary gems in ${location}?`,
    `Were there any unique activities or attractions in ${location}?`,
    `Do you have any recommendations for future travelers visiting ${location}?`,
  ];
  const questionsIndex = useRef(0);

  const user = { id: "06c33e8b-e835-4736-80f4-63f44b66666c" };
  const system = { id: "06c33e8b-e835-4736-80f4-63f44b66666d" };

  const addMessage = (message: MessageType.Any) => {
    setMessages([message, ...messages]);
  };

  const askQuestion = async () => {
    const systemMessage: MessageType.Text = {
      author: system,
      createdAt: Date.now(),
      id: uuidv4(),
      text: questions[questionsIndex.current],
      type: "text",
    };  
    addMessage(systemMessage);
    questionsIndex.current += 1;
    questionAsked.current = true;
    
    // For future use: 
    // const url = `http://localhost:8080/system/question/${location}?question=${questions[questionsIndex.current]}`;
    
    // await fetch(url)
    //   .then((response) => response.json())
    //   .then((data) => {
    //     console.log(data);
    //     const systemMessage: MessageType.Text = {
    //       author: system,
    //       createdAt: Date.now(),
    //       id: uuidv4(),
    //       text: data,
    //       type: "text",
    //     };
    //     addMessage(systemMessage);
    //     questionsIndex.current += 1;
    //   });
    // questionAsked.current = true;
  };

  const handleSendPress = async (message: MessageType.PartialText) => {
    const userMessage: MessageType.Text = {
      author: user,
      createdAt: Date.now(),
      id: uuidv4(),
      text: message.text,
      type: "text",
    };
    addMessage(userMessage);
    ingest(userMessage, questions[questionsIndex.current - 1]); // subtract 1 becuase questionsIndex was already incremented in askQuestion()
    questionAsked.current = false;

    console.log(questionsIndex.current);
    if (questionsIndex.current === questions.length) {
      console.log("here");
      navigation.navigate('LocationIngest', { process: 'ingest' });
    };
  };

  const ingest = async (message: MessageType.Text, question: string) => {
    console.log("User message:" + message.text);
    const url: string = `http://localhost:8080/system/ingest/${location}?question=${question}`;
    const body: MessageType.Text = message;
    await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Entry count:" + data);
      });
  };

  useEffect(() => {
    if (!questionAsked.current) {
      askQuestion();
    }
  }, [messages]);

  return (
    <Chat
      messages={messages}
      onSendPress={handleSendPress}
      user={user}
    />
  );
};

export default Ingest;