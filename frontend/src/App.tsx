import { useState, type FormEvent } from 'react'
import './App.css'

export type ChatMessage = {
  id: number
  username: string
  text: string
  timestamp: string
}

type ConnectionStatus = 'Connected' | 'Disconnected' | 'Connecting'

const mockMessages: ChatMessage[] = [
  { id: 1, username: 'Maya', text: 'Hey everyone! Welcome to the chat 👋', timestamp: '10:32 AM' },
  { id: 2, username: 'Jordan', text: 'Thanks! Excited to try this out.', timestamp: '10:33 AM' },
  { id: 3, username: 'You', text: 'This is looking good so far.', timestamp: '10:34 AM' },
  { id: 4, username: 'Sam', text: 'Nice and simple. Just what we need.', timestamp: '10:35 AM' },
]

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

function MessageItem({ message }: { message: ChatMessage }) {
  const isOwnMessage = message.username === 'You'
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

function MessageList({ messages }: { messages: ChatMessage[] }) {
  return (
    <section className="messages" aria-label="Chat messages" aria-live="polite">
      <div className="date-divider"><span>Today</span></div>
      {messages.map((message) => <MessageItem key={message.id} message={message} />)}
    </section>
  )
}

function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedText = text.trim()
    if (!trimmedText) return
    onSend(trimmedText)
    setText('')
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
      <button type="submit" disabled={!text.trim()}>Send <span aria-hidden="true">↑</span></button>
    </form>
  )
}

function App() {
  const [username, setUsername] = useState('Alex')
  const [messages, setMessages] = useState(mockMessages)
  const status: ConnectionStatus = 'Disconnected'

  function addMessage(text: string) {
    const now = new Date()
    setMessages((currentMessages) => [...currentMessages, {
      id: Date.now(),
      username: username.trim() || 'You',
      text,
      timestamp: now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    }])
  }

  return (
    <main className="page-shell">
      <div className="chat-card">
        <ChatHeader username={username} onUsernameChange={setUsername} status={status} />
        <MessageList messages={messages} />
        <footer className="chat-footer">
          <MessageInput onSend={addMessage} />
          <p className="helper-text">Messages are just a local preview for now.</p>
        </footer>
      </div>
    </main>
  )
}

export default App
