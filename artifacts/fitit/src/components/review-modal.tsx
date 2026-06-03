import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X, Star, ImagePlus, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface ReviewModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewModal({ onClose, onSuccess }: ReviewModalProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 4 - photos.length;
    files.slice(0, remaining).forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Файл слишком большой (максимум 5 МБ)", variant: "destructive" });
        return;
      }
      const reader = new FileReader();
      reader.onload = ev => {
        const b64 = ev.target?.result as string;
        if (b64) setPhotos(prev => [...prev, b64].slice(0, 4));
      };
      reader.readAsDataURL(file);
    });
    if (e.target) e.target.value = "";
  };

  const removePhoto = (i: number) => setPhotos(prev => prev.filter((_, idx) => idx !== i));

  const submit = async () => {
    if (!rating) { toast({ title: "Поставьте оценку", variant: "destructive" }); return; }
    if (!text.trim() || text.trim().length < 10) {
      toast({ title: "Напишите отзыв (минимум 10 символов)", variant: "destructive" }); return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, text: text.trim(), photos }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Ошибка");
      toast({ title: "Отзыв отправлен!", description: "После модерации он появится на странице." });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    } finally { setLoading(false); }
  };

  const displayRating = hoverRating || rating;
  const ratingLabels = ["", "Очень плохо", "Плохо", "Нормально", "Хорошо", "Отлично!"];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-background w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border border-border shadow-2xl flex flex-col max-h-[92dvh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border shrink-0">
          <h2 className="text-lg font-bold">Оставить отзыв</h2>
          <button onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-secondary transition-colors text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* Stars */}
          <div className="space-y-2.5">
            <label className="text-sm font-semibold">Оценка</label>
            <div className="flex gap-2" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  className="transition-transform hover:scale-110 active:scale-95">
                  <Star className={`h-9 w-9 transition-colors ${n <= displayRating ? "fill-yellow-400 text-yellow-400" : "text-border"}`} />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground h-5">
              {displayRating > 0 ? ratingLabels[displayRating] : "Выберите оценку"}
            </p>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Ваш отзыв</label>
            <textarea value={text} onChange={e => setText(e.target.value.slice(0, 1000))} rows={5}
              placeholder="Расскажите о своём опыте: каких результатов достигли, что понравилось в плане питания..."
              className="flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
            <p className="text-xs text-muted-foreground text-right">{text.length} / 1000</p>
          </div>

          {/* Photos */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Фотографии результата</label>
              <span className="text-xs text-muted-foreground">{photos.length} / 4</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {photos.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group cursor-pointer">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => removePhoto(i)}
                    className="absolute inset-0 bg-black/50 items-center justify-center hidden group-hover:flex rounded-xl transition-all">
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
              ))}
              {photos.length < 4 && (
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-foreground/50 flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-xs font-medium">Фото</span>
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">До 4 фотографий, не более 5 МБ каждая</p>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={addPhoto} />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 pb-5 pt-4 border-t border-border">
          <Button className="w-full h-12 rounded-xl text-base font-semibold" onClick={submit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Отправляю..." : "Отправить отзыв"}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-2">Отзыв появится после проверки модератором</p>
        </div>
      </div>
    </div>
  );
}
