import { Mail, Check, X, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFriendRequests, useFriendActions } from "@/hooks/useUser";
import { LoadingState, EmptyState } from "./FriendCommon";
import { BlockButton } from "./FriendAction";

export const FriendRequestsList = () => {
  const { data: requests, isLoading } = useFriendRequests();
  const { acceptRequest, rejectRequest } = useFriendActions();
  const requestList = requests?.data || [];

  if (isLoading) return <LoadingState />;

  if (requestList.length === 0) {
    return (
      <EmptyState
        icon={<Mail className="h-10 w-10" />}
        text="Không có lời mời nào."
      />
    );
  }

  return (
    <div className="grid gap-3">
      {requestList.map((user: any) => (
        <Card
          key={user.id || user.user_id}
          className="border-l-4 border-l-primary/60"
        >
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback>
                  {user.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-sm">{user.username}</p>
                <p className="text-xs text-muted-foreground">Muốn kết bạn</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 h-8 px-2 sm:px-4"
                onClick={() => acceptRequest.mutate(user.id || user.user_id)}
                disabled={acceptRequest.isPending}
              >
                {acceptRequest.isPending ? (
                  <Loader2 className="animate-spin h-3 w-3" />
                ) : (
                  <Check className="h-4 w-4 mr-1" />
                )}
                <span className="hidden sm:inline">Chấp nhận</span>
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                onClick={() => rejectRequest.mutate(user.id || user.user_id)}
                disabled={rejectRequest.isPending}
              >
                <X className="h-4 w-4" />
              </Button>

              <BlockButton
                userId={user.id || user.user_id}
                username={user.username}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
