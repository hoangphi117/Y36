import { useState } from "react";
import { Star, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  useMyRating,
  useAverageRating,
  useSubmitRating,
  useDeleteRating,
} from "@/hooks/useRatings";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface Props {
  gameId: number;
}

export function GameRating({ gameId }: Props) {
  const { data: myRating } = useMyRating(gameId);
  const { data: avgData, isLoading: isLoadingAvg } = useAverageRating(gameId);
  const submitMutation = useSubmitRating();
  const deleteMutation = useDeleteRating();

  const [hoverRating, setHoverRating] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const userRatingData = (myRating as any)?.data;
  const isRated = !!userRatingData;
  const currentRating = userRatingData?.rating || 0;

  const handleRate = (rating: number) => {
    if (isRated) return;
    submitMutation.mutate({ gameId, rating });
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(gameId, {
      onSuccess: () => {
        setOpenDeleteDialog(false);
        setHoverRating(0);
      },
    });
  };

  const renderStaticStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFull = rating >= star;
          const isHalf = rating >= star - 0.5 && rating < star;

          return (
            <div key={star} className="relative">
              <Star
                className={cn(
                  "w-5 h-5",
                  isFull
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground/30",
                )}
              />
              {isHalf && (
                <div className="absolute inset-0 overflow-hidden w-[50%]">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoadingAvg)
    return <div className="h-24 bg-muted/20 animate-pulse rounded-xl" />;

  const average = avgData?.average_rating ? Number(avgData.average_rating) : 0;
  const total = avgData?.total_ratings || 0;

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 md:gap-12 justify-between">
      {/* 1. Phần hiển thị Rating Trung Bình */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center justify-center bg-primary/5 min-w-[60px] h-[60px] rounded-2xl border-2 border-primary/10">
          <span className="text-2xl font-black text-primary">
            {average.toFixed(1)}
          </span>
        </div>
        <div className="space-y-1">
          <div className="font-bold text-md">Đánh giá trung bình</div>
          {renderStaticStars(average)}
          <p className="text-sm text-muted-foreground">{total} lượt đánh giá</p>
        </div>
      </div>

      <div className="h-px w-full md:w-px md:h-16 bg-border" />

      {/* 2. Phần User đánh giá (Interactive) */}
      <div className="flex flex-col items-center md:items-end gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          {isRated ? "Đánh giá của bạn" : "Gửi đánh giá của bạn"}
        </span>

        <div
          className="flex items-center gap-1"
          onMouseLeave={() => !isRated && setHoverRating(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => {
            const isActive = isRated
              ? star <= currentRating
              : hoverRating
                ? star <= hoverRating
                : false;

            return (
              <button
                key={star}
                type="button"
                disabled={isRated || submitMutation.isPending}
                onMouseEnter={() => !isRated && setHoverRating(star)}
                onClick={() => handleRate(star)}
                className={cn(
                  "transition-all duration-200 focus:outline-none p-1",
                  !isRated && "hover:scale-110 cursor-pointer",
                  isRated && "cursor-default",
                  submitMutation.isPending && "opacity-50 cursor-not-allowed",
                )}
              >
                <Star
                  className={cn(
                    "w-8 h-8 transition-colors",
                    isActive
                      ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                      : "text-muted-foreground/30 hover:text-yellow-400/50",
                  )}
                />
              </button>
            );
          })}
        </div>

        {myRating && (
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-6 text-xs mt-1"
            onClick={() => setOpenDeleteDialog(true)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <XCircle className="w-3 h-3 mr-1" />
            )}
            Xóa đánh giá
          </Button>
        )}
      </div>

      {/* GIỮ NGUYÊN DIALOG XÁC NHẬN */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa đánh giá của bạn?</AlertDialogTitle>
            <AlertDialogDescription>
              Đánh giá này sẽ bị xóa vĩnh viễn. Bạn có thể thực hiện đánh giá
              mới sau khi xóa.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xác nhận xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
