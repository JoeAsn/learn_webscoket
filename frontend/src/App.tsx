import { useEffect, useRef, useState, type FormEvent } from 'react'
import './App.css'

export type ChatMessage = {
  id: number
  username: string
  text: string
  timestamp: string
}

type ConnectionStatus = 'Connected' | 'Disconnected' | 'Connecting'

function ChatHeader({
  username,
  onUsernameChange,
  status,
}: {
  username: string
  onUsernameChange: (value: string) => void
  status: ConnectionStatus
}) {
  return (
    <header className="chat-header">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">💬</div>
        <div>
          <h1>Group chat</h1>
          <p>A little room to talk</p>
        </div>
      </div>
      <div className="header-controls">
        <label className="username-field">
          <span>Your name</span>
          <input value={username} onChange={(event) => onUsernameChange(event.target.value)} maxLength={24} />
        </label>
        <div className={`connection connection-${status.toLowerCase()}`} aria-live="polite">
          <span className="status-dot" />{status}
        </div>
      </div>
    </header>
  )
}

function MessageItem({ message, currentUsername }: { message: ChatMessage; currentUsername: string }) {
  const isOwnMessage = message.username === currentUsername
  return (
    <article className={`message ${isOwnMessage ? 'message-own' : ''}`}>
      <div className="avatar" aria-hidden="true">{message.username.charAt(0).toUpperCase()}</div>
      <div className="message-content">
        <div className="message-meta">
          <span className="message-username">{message.username}</span>
          <time>{message.timestamp}</time>
        </div>
        <p className="message-bubble">{message.text}</p>
      </div>
    </article>
  )
}

function MessageList({ messages, currentUsername }: { messages: ChatMessage[]; currentUsername: string }) {
  return (
    <section className="messages" aria-label="Chat messages" aria-live="polite">
      {messages.length > 0
        ? <div className="date-divider"><span>Today</span></div>
        : <p className="empty-state">No messages yet</p>}
      {messages.map((message) => <MessageItem key={message.id} message={message} currentUsername={currentUsername} />)}
    </section>
  )
}

function MessageInput({ onSend, connected }: { onSend: (text: string) => boolean; connected: boolean }) {
  const [text, setText] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedText = text.trim()
    if (!trimmedText) return
    if (onSend(trimmedText)) setText('')
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="message">Write a message</label>
      <input
        id="message"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Write a message..."
        maxLength={500}
      />
      <button type="submit" disabled={!text.trim() || !connected}>Send <span aria-hidden="true">↑</span></button>
    </form>
  )
}

function App() {
  const [username, setUsername] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<ConnectionStatus>('Connecting')
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const socket = new WebSocket(`${protocol}//${window.location.hostname}:5300`)
    socketRef.current = socket

    socket.addEventListener('open', () => setStatus('Connected'))
    socket.addEventListener('close', () => setStatus('Disconnected'))
    socket.addEventListener('error', () => setStatus('Disconnected'))
    socket.addEventListener('message', (event) => {
      try {
        const incoming = JSON.parse(String(event.data)) as Omit<ChatMessage, 'id'>
        if (typeof incoming.text !== 'string' || typeof incoming.username !== 'string') return
        setMessages((currentMessages) => [...currentMessages, { ...incoming, id: Date.now() + currentMessages.length }])
      } catch {
        // Ignore messages that do not match the chat message format.
      }
    })

    return () => {
      socketRef.current = null
      socket.close()
    }
  }, [])

  function addMessage(text: string) {
    const socket = socketRef.current
    if (!socket || socket.readyState !== WebSocket.OPEN) return false
    const now = new Date()
    socket.send(JSON.stringify({
      username: username.trim() || 'You',
      text,
      timestamp: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    }))
    return true
  }

  return (
    <main className="page-shell">
      <div className="chat-card">
        <ChatHeader username={username} onUsernameChange={setUsername} status={status} />
        <MessageList messages={messages} currentUsername={username.trim() || 'You'} />
        <footer className="chat-footer">
          <MessageInput onSend={addMessage} connected={status === 'Connected'} />
        </footer>
      </div>
    </main>
  )
}

export default App
