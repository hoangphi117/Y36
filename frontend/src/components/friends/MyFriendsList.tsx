import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, MessageSquare, UserMinus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useFriendsList, useFriendActions } from "@/hooks/useUser";
import { useDebounce } from "@/hooks/useDebounce";
import { LoadingState, EmptyState } from "./FriendCommon";
import { BlockButton } from "./FriendAction";

export const MyFriendsList = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const { unfriend } = useFriendActions();

  // 2. Khởi tạo hook navigate
  const navigate = useNavigate();

  const { data, isLoading } = useFriendsList({
    page: 1,
    limit: 50,
    search: debouncedSearch,
  });

  const friends = data?.data || [];

  // 3. Hàm xử lý khi bấm nút Chat
  const handleChat = (friend: any) => {
    // Chuyển hướng sang trang /messages
    // Kèm theo state chứa thông tin người cần chat để ChatPage tự động chọn
    navigate("/messages", {
      state: {
        selectedUser: {
          id: friend.id || friend.user_id,
          username: friend.username,
          avatar_url: friend.avatar_url,
        },
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Lọc tên bạn bè..."
          className="pl-10 bg-muted/30"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <LoadingState />
      ) : friends.length > 0 ? (
        <div className="grid gap-3">
          {friends.map((friend: any) => (
            <Card
              key={friend.id || friend.user_id}
              className="group hover:border-primary/50 transition-colors"
            >
              <CardContent className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={friend.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {friend.username?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-bold text-sm group-hover:text-primary transition-colors">
                      {friend.username}
                    </p>
                    <p className="text-xs text-muted-foreground">Bạn bè</p>
                  </div>
                </div>

                <div className="flex gap-1">
                  {/* 4. Gắn hàm handleChat vào nút MessageSquare */}
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Nhắn tin"
                    className="h-8 w-8"
                    onClick={() => handleChat(friend)}
                  >
                    <MessageSquare className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Hủy kết bạn"
                        className="h-8 w-8"
                      >
                        <UserMinus className="h-4 w-4 text-muted-foreground hover:text-orange-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hủy kết bạn?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc chắn muốn xóa <b>{friend.username}</b>{" "}
                          khỏi danh sách bạn bè?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-orange-500 hover:bg-orange-600"
                          onClick={() =>
                            unfriend.mutate(friend.id || friend.user_id)
                          }
                        >
                          Xóa bạn
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <BlockButton
                    userId={friend.id || friend.user_id}
                    username={friend.username}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          text={
            debouncedSearch ? "Không tìm thấy ai." : "Danh sách bạn bè trống."
          }
        />
      )}
    </div>
  );
};
