import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  text: string;
}

const STUB_RESPONSES = [
  "На основе вашего профиля — рекомендую сократить быстрые углеводы во второй половине дня и увеличить белок в завтраке до 30–35 г. Это ускорит метаболизм с утра.",
  "Оптимальный дефицит для вашего метаболического типа — около 300–400 ккал/день. Это позволит снижать вес стабильно, без потери мышечной массы.",
  "При вашем уровне активности рекомендую кардио 2–3 раза в неделю по 25–30 минут. Это дополнит план питания и ускорит жиросжигание.",
  "Распределите приёмы пищи равномерно — каждые 3–4 часа. Это стабилизирует уровень сахара и снизит тягу к сладкому во второй половине дня.",
  "Греческий йогурт, творог, яйца и рыба — отличные источники белка для вашего плана. Они быстро усваиваются и дают длительное насыщение.",
  "Гидратация напрямую влияет на метаболизм. При вашем весе рекомендую 2–2,5 литра воды в день. Стакан воды за 20 минут до еды снижает аппетит на 15–20%.",
  "Периодическое чувство усталости после обеда — признак слишком большой порции углеводов. Попробуйте уменьшить обед на 20% и добавить лёгкий белковый перекус в 15:00.",
  "Ваш текущий план уже учитывает суточную норму КБЖУ. Главное — придерживаться режима и не пропускать завтрак: он запускает обмен веществ на весь день.",
];

let idx = 0;
function getReply(): Promise<string> {
  return new Promise(r => setTimeout(() => r(STUB_RESPONSES[idx++ % STUB_RESPONSES.length]), 900 + Math.random() * 900));
}

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Привет! Я ваш персональный AI-нутрициолог 🥗\n\nЗадайте вопрос о питании, калориях, рецептах или стратегии достижения вашей цели — я помогу разобраться." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); inputRef.current?.focus(); }, 120);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text }]);
    setLoading(true);
    try {
      const reply = await getReply();
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } finally { setLoading(false); }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-20 right-4 sm:right-6 z-50 flex flex-col bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
          style={{ width: "min(360px, calc(100vw - 2rem))", height: "min(520px, calc(100dvh - 120px))" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-foreground text-background shrink-0">
            <div className="h-9 w-9 rounded-full bg-background/15 flex items-center justify-center shrink-0">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold leading-none">AI-нутрициолог</p>
              <p className="text-xs text-background/60 mt-0.5 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 inline-block" />
                Онлайн
              </p>
            </div>
            <button onClick={() => setOpen(false)}
              className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-background/10 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" && (
                  <div className="h-7 w-7 rounded-full bg-foreground flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-background" />
                  </div>
                )}
                <div className={`max-w-[82%] text-sm rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-foreground text-background rounded-br-sm"
                    : "bg-secondary rounded-bl-sm"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="h-7 w-7 rounded-full bg-foreground flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-background" />
                </div>
                <div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-border p-2.5 flex gap-2 items-end bg-background">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Спросите о питании..."
              rows={1}
              className="flex-1 rounded-xl border border-input bg-secondary px-3 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              style={{ minHeight: "42px", maxHeight: "100px" }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="h-[42px] w-[42px] shrink-0 rounded-xl bg-foreground text-background flex items-center justify-center hover:bg-foreground/90 disabled:opacity-40 transition-all active:scale-95"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`fixed bottom-4 right-4 sm:right-6 z-50 h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-all active:scale-95 ${
          open ? "bg-secondary text-foreground hover:bg-secondary/80" : "bg-foreground text-background hover:scale-105"
        }`}
        title="AI-нутрициолог"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-6 w-6" />}
        {!open && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
            <Sparkles className="h-2 w-2 text-white" />
          </span>
        )}
      </button>
    </>
  );
}
