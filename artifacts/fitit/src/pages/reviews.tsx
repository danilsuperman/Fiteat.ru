import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Star, PenLine, ChevronLeft, ChevronRight, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewModal } from "@/components/review-modal";
import { useAuth } from "@/hooks/use-auth";

interface Review {
  id: number;
  user_name: string;
  text: string;
  rating: number;
  photos: string[];
  created_at: string;
}

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "md" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <Star key={n} className={`${cls} ${n <= rating ? "fill-yellow-400 text-yellow-400" : "text-border"}`} />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const photos = review.photos || [];

  return (
    <div className="bg-background border border-border rounded-2xl p-5 flex flex-col gap-4">
      {/* Photos */}
      {photos.length > 0 && (
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-secondary">
          <img src={photos[photoIdx]} alt="" className="w-full h-full object-cover" />
          {photos.length > 1 && (
            <>
              <button onClick={() => setPhotoIdx(i => (i - 1 + photos.length) % photos.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => setPhotoIdx(i => (i + 1) % photos.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {photos.map((_, i) => (
                  <button key={i} onClick={() => setPhotoIdx(i)}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${i === photoIdx ? "bg-white" : "bg-white/50"}`} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Rating + meta */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-sm">{review.user_name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(review.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <StarRow rating={review.rating} />
      </div>

      {/* Text */}
      <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
    </div>
  );
}

const PAGE_SIZE = 9;

export default function ReviewsPage() {
  const { isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/reviews?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`);
      const data = await r.json();
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-bold text-lg">Отзывы</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-secondary rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            Реальные результаты
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">Что говорят пользователи</h2>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            Истории людей, которые изменили своё питание и достигли результатов с ФИТИТ
          </p>

          <div className="mt-6">
            {isAuthenticated ? (
              <Button onClick={() => setShowModal(true)} className="h-11 px-6 rounded-xl gap-2">
                <PenLine className="h-4 w-4" />
                Оставить отзыв
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="outline" className="h-11 px-6 rounded-xl gap-2">
                  <PenLine className="h-4 w-4" />
                  Войдите, чтобы оставить отзыв
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats bar */}
        {total > 0 && (
          <div className="flex items-center justify-center gap-6 mb-10 py-5 border-y border-border">
            <div className="text-center">
              <p className="text-3xl font-bold">{total}</p>
              <p className="text-sm text-muted-foreground">отзывов</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center flex flex-col items-center">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-3xl font-bold">4.9</span>
                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              </div>
              <p className="text-sm text-muted-foreground">средняя оценка</p>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <p className="text-3xl font-bold">97%</p>
              <p className="text-sm text-muted-foreground">рекомендуют</p>
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="font-semibold text-lg mb-1">Пока нет отзывов</p>
            <p className="text-muted-foreground text-sm">Будьте первым — поделитесь своим результатом!</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="h-9 w-9 flex items-center justify-center rounded-xl border border-border hover:bg-secondary transition-colors disabled:opacity-30">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`h-9 w-9 text-sm font-medium rounded-xl transition-colors ${
                      i === page ? "bg-foreground text-background" : "border border-border hover:bg-secondary"
                    }`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                  className="h-9 w-9 flex items-center justify-center rounded-xl border border-border hover:bg-secondary transition-colors disabled:opacity-30">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <ReviewModal onClose={() => setShowModal(false)} onSuccess={load} />
      )}
    </div>
  );
}
