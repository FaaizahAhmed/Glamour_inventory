import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Sparkles, Cpu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('auth_token');

function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: string; mode?: string }[]>([
    { role: "assistant", content: "Hello! I'm your inventory assistant. I can answer questions about stock levels, values, low stock alerts, and more. How can I help?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-6),
        }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message || 'Failed to get response');

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.data.reply,
        mode: data.data.mode,
      }]);
    } catch (err: any) {
      toast({ title: 'Chat Error', description: err.message, variant: 'destructive' });
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        size="icon"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "hsl(var(--primary))",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }}
      >
        <MessageCircle style={{ width: "24px", height: "24px" }} />
      </Button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "384px",
        height: "520px",
        background: "white",
        borderRadius: "8px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #e0e0e0"
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px",
        borderBottom: "1px solid #e0e0e0",
        background: "#f9fafb"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <MessageCircle style={{ width: "20px", height: "20px", color: "hsl(var(--primary))" }} />
          <h3 style={{ fontWeight: "600", fontSize: "14px", margin: 0 }}>Inventory Assistant</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          style={{ padding: "6px" }}
        >
          <X style={{ width: "16px", height: "16px" }} />
        </Button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: message.role === "user" ? "flex-end" : "flex-start",
              flexDirection: "column",
              alignItems: message.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                borderRadius: "8px",
                padding: "10px 12px",
                background: message.role === "user" ? "hsl(var(--primary))" : "#f0f0f0",
                color: message.role === "user" ? "white" : "black",
                wordWrap: "break-word",
                whiteSpace: "pre-wrap",
                fontSize: "13px",
                lineHeight: "1.5",
              }}
            >
              {message.content}
            </div>
            {/* Mode badge for assistant messages */}
            {message.role === 'assistant' && message.mode && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "3px",
                marginTop: "4px",
                fontSize: "10px",
                color: "#9ca3af",
              }}>
                {message.mode === 'ai'
                  ? <><Sparkles style={{ width: "10px", height: "10px" }} /> Gemini AI</>
                  : <><Cpu style={{ width: "10px", height: "10px" }} /> Smart Mode</>}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              background: "#f0f0f0",
              borderRadius: "8px",
              padding: "10px 16px",
              display: "flex",
              gap: "4px",
              alignItems: "center",
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "#9ca3af",
                  animation: "bounce 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid #e0e0e0",
        display: "flex",
        gap: "8px",
      }}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Ask about your inventory..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid #d0d0d0",
            borderRadius: "4px",
            fontSize: "13px",
          }}
        />
        <Button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          size="icon"
          style={{
            backgroundColor: "hsl(var(--primary))",
            padding: "8px",
            width: "36px",
            height: "36px",
            opacity: isLoading || !input.trim() ? 0.6 : 1,
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          <Send style={{ width: "16px", height: "16px" }} />
        </Button>
      </div>
    </div>
  );
}

export default AIChat;
