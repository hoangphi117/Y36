import { UserCheck, Clock, Loader2, UserPlus, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFriendActions } from "@/hooks/useUser";

// --- Nút Chặn (Block) ---
export const BlockButton = ({
  userId,
  username,
}: {
  userId: string;
  username: string;
}) => {
  const { blockUser } = useFriendActions();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Chặn người dùng"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Ban className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Chặn người dùng?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn chặn <b>{username}</b> không? Họ sẽ không thể
            gửi tin nhắn hay tìm thấy bạn nữa.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive hover:bg-destructive/90"
            onClick={() => blockUser.mutate(userId)}
          >
            {blockUser.isPending ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              "Chặn"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// --- Nút Hành động chung (Kết bạn / Chấp nhận / ...) ---
export const ActionButton = ({
  status,
  userId,
}: {
  status: string;
  userId: string;
}) => {
  const { sendRequest, acceptRequest } = useFriendActions();

  switch (status) {
    case "accepted":
    case "friend":
      return (
        <Button
          variant="ghost"
          size="sm"
          className="text-green-600 gap-1 cursor-default hover:bg-transparent hover:text-green-600"
        >
          <UserCheck className="h-4 w-4" />{" "}
          <span className="hidden sm:inline">Bạn bè</span>
        </Button>
      );
    case "pending_outgoing":
    case "request_sent":
    case "pending":
      return (
        <Button
          variant="secondary"
          size="sm"
          className="text-muted-foreground cursor-default"
        >
          <Clock className="h-4 w-4 mr-1" />{" "}
          <span className="hidden sm:inline">Đã gửi</span>
        </Button>
      );
    case "request_received":
      return (
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700"
          onClick={() => acceptRequest.mutate(userId)}
          disabled={acceptRequest.isPending}
        >
          {acceptRequest.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Chấp nhận"
          )}
        </Button>
      );
    default:
      return (
        <Button
          variant="outline"
          size="sm"
          className="gap-1 hover:border-primary hover:text-primary"
          onClick={() => sendRequest.mutate(userId)}
          disabled={sendRequest.isPending}
        >
          {sendRequest.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <UserPlus className="h-4 w-4" />{" "}
              <span className="hidden sm:inline">Kết bạn</span>
            </>
          )}
        </Button>
      );
  }
};
