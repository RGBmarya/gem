import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Chat, MessageType } from '@flyerhq/react-native-chat-ui'
import { v4 as uuidv4 } from 'uuid';

export type Props = {
  location: string;
};

const Thread: React.FC<Props> = ({ location = "Mumbai" }) => {
  const [messages, setMessages] = useState<MessageType.Any[]>([])
  const [currentUserMessage, setCurrentUserMessage] = useState<string>("")
  const pageRendered = useRef(false)
  const userSent = useRef(false)
  
  const user = { id: '06c33e8b-e835-4736-80f4-63f44b66666c' }
  const system = { id: '06c33e8b-e835-4736-80f4-63f44b66666d' }

  const addMessage = (message: MessageType.Any) => {
    setMessages([message, ...messages])
  }

  const handleSendPress = (message: MessageType.PartialText) => {
    setCurrentUserMessage(message.text)
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

  const handleResponse = async () => {
    const url = `http://localhost:8080/system/query/${location}`
    const body: MessageType.Text = {
      author: system,
      createdAt: Date.now(),
      id: uuidv4(),
      text: currentUserMessage,
      type: "text",
    }

    await fetch(url, {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
      body: JSON.stringify(body)
    })
    .then(response => response.json())
    .then (data => {
      console.log(data)
      const systemMessage: MessageType.Text = {
        author: data.author,
        createdAt: data.createdAt,
        id: data.id,
        text: data.text,
        type: data.type,
      }
      addMessage(systemMessage)
    })


    // addMessage(textMessage)
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
