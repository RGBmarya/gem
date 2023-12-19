import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Chat, MessageType } from '@flyerhq/react-native-chat-ui'
import { v4 as uuidv4 } from 'uuid';

const Thread = () => {
  const [messages, setMessages] = useState<MessageType.Any[]>([])
  const pageRendered = useRef(false)
  const userSent = useRef(false)
  
  const user = { id: '06c33e8b-e835-4736-80f4-63f44b66666c' }
  const system = { id: '06c33e8b-e835-4736-80f4-63f44b66666d' }

  const addMessage = (message: MessageType.Any) => {
    setMessages([message, ...messages])
  }

  const handleSendPress = (message: MessageType.PartialText) => {
    const textMessage: MessageType.Text = {
      author: user,
      createdAt: Date.now(),
      id: uuidv4(),
      text: message.text,
      type: 'text',
    }
    addMessage(textMessage)
    userSent.current = true;
  }

  const handleResponse = () => {
    const textMessage: MessageType.Text = {
      author: system,
      createdAt: Date.now(),
      id: uuidv4(),
      text: "[System response]",
      type: "text",
    }
    addMessage(textMessage)
  }

  useEffect(() => {
    if (userSent.current && pageRendered.current) {
      handleResponse()
      userSent.current = false
    }
    else {
      pageRendered.current = true;
    }
  }, [messages])

  return (
      <Chat
        messages={messages}
        onSendPress={handleSendPress}
        user={user}
      />
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});

export default Thread;
