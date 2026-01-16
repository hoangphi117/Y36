import { Send, Clock, Undo2, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSentRequests, useFriendActions } from "@/hooks/useUser";
import { LoadingState, EmptyState } from "./FriendCommon";

export const SentRequestsList = () => {
  const { data: sentRequests, isLoading } = useSentRequests();
  const { unfriend } = useFriendActions();

  const sentList = sentRequests?.data || [];

  if (isLoading) return <LoadingState />;

  if (sentList.length === 0) {
    return (
      <EmptyState
        icon={<Send className="h-10 w-10" />}
        text="Bạn chưa gửi lời mời nào."
      />
    );
  }

  return (
    <div className="grid gap-3">
      {sentList.map((user: any) => (
        <Card
          key={user.id || user.user_id}
          className="border-l-4 border-l-muted-foreground/30"
        >
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="opacity-80">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>
                  {user.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-sm">{user.username}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Đã gửi
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              className="h-8 text-muted-foreground hover:text-destructive hover:border-destructive"
              onClick={() => unfriend.mutate(user.id || user.user_id)}
              disabled={unfriend.isPending}
            >
              {unfriend.isPending ? (
                <Loader2 className="animate-spin h-3 w-3" />
              ) : (
                <>
                  <Undo2 className="h-3 w-3 mr-1" />
                  <span className="text-xs">Thu hồi</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
