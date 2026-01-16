import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Send,
  Search,
  MessageSquare,
  MoreVertical,
  Phone,
  Video,
  Trash2,
  Check,
  CheckCheck,
} from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  useConversations,
  useChatMessages,
  useSendMessage,
  useUnreadCount,
  useMarkMessagesRead,
  useDeleteMessage,
} from "@/hooks/useMessage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { EmojiPickerButton } from "./EmojiPickerButton";

const ChatPage = () => {
  const { user: currentUser } = useAuthStore();
  const location = useLocation();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const { data: conversations, isLoading: loadingList } = useConversations();
  const { data: messagesData, isLoading: loadingMessages } =
    useChatMessages(selectedUserId);
  const { data: globalUnread } = useUnreadCount();

  const sendMessageMutation = useSendMessage();
  const markReadMutation = useMarkMessagesRead();
  const deleteMessageMutation = useDeleteMessage();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.state?.selectedUser) {
      setSelectedUserId(location.state.selectedUser.id);
    }
  }, [location.state]);

  useEffect(() => {
    if (selectedUserId) {
      markReadMutation.mutate(selectedUserId);
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesData?.data]);

  const activeConversation = conversations?.data.find(
    (c) => c.id === selectedUserId
  );
  const currentChatUser =
    activeConversation ||
    (selectedUserId === location.state?.selectedUser?.id
      ? location.state.selectedUser
      : null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedUserId) return;
    sendMessageMutation.mutate({
      userId: selectedUserId,
      content: messageInput,
    });
    setMessageInput("");
  };

  const filteredConversations =
    conversations?.data.filter((conv) =>
      conv.username.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-background border-t">
      {/* === SIDEBAR === */}
      <div className="w-full md:w-80 lg:w-96 border-r flex flex-col bg-muted/10">
        <div className="p-4 border-b space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> Tin nhắn{" "}
            {/* --- LOGIC 2: HIỂN THỊ TỔNG TIN CHƯA ĐỌC TOÀN CỤC --- */}
            {globalUnread?.unread && globalUnread.unread > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                {globalUnread?.unread} mới
              </span>
            )}
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm cuộc trò chuyện..."
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 p-2">
            {loadingList ? (
              <p className="text-center p-4 text-muted-foreground">
                Đang tải...
              </p>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedUserId(conv.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
                    selectedUserId === conv.id
                      ? "bg-primary/15 text-primary"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={conv.avatar_url || ""} />
                      <AvatarFallback>
                        {conv.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* Badge unread từng conversation */}
                    {conv.unread_count > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <span
                        className={cn(
                          "truncate",
                          conv.unread_count > 0 ? "font-bold" : "font-semibold"
                        )}
                      >
                        {conv.username}
                      </span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-1">
                        {conv.last_time &&
                          formatDistanceToNow(new Date(conv.last_time), {
                            addSuffix: false,
                            locale: vi,
                          })}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-sm truncate",
                        conv.unread_count > 0
                          ? "font-bold text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {conv.last_sender_id === currentUser?.user_id && "Bạn: "}
                      {conv.last_message}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-center p-4 text-muted-foreground">
                Không có cuộc trò chuyện nào.
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* === CHAT WINDOW === */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {selectedUserId ? (
          <>
            {/* Header */}
            <div className="h-16 border-b flex items-center justify-between px-6 bg-card/50 backdrop-blur">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={currentChatUser?.avatar_url || ""} />
                  <AvatarFallback>
                    {currentChatUser?.username?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold leading-none">
                    {currentChatUser?.username || "Người dùng"}
                  </h3>
                  <span className="text-xs text-green-500 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" />{" "}
                    Online
                  </span>
                </div>
              </div>
              <div className="flex gap-2 text-muted-foreground">
                <Button variant="ghost" size="icon">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 bg-muted/5">
              <div className="flex flex-col gap-4">
                {loadingMessages ? (
                  <div className="flex justify-center mt-10">
                    <span className="loading-spinner" /> Đang tải...
                  </div>
                ) : (
                  messagesData?.data.map((msg, index) => {
                    const isMe = msg.sender_id === currentUser?.user_id;
                    const isLastMessage =
                      index === messagesData?.data.length - 1;

                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex w-full group",
                          isMe ? "justify-end" : "justify-start"
                        )}
                      >
                        {/* --- DELETE (GIỮ NGUYÊN AlertDialog) --- */}
                        {isMe && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center mr-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Xóa tin nhắn?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Hành động này không thể hoàn tác. Tin nhắn
                                    sẽ bị xóa vĩnh viễn khỏi cuộc trò chuyện.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90"
                                    onClick={() =>
                                      deleteMessageMutation.mutate(msg.id)
                                    }
                                  >
                                    {deleteMessageMutation.isPending
                                      ? "Đang xóa..."
                                      : "Xóa"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}

                        {/* --- MESSAGE + META --- */}
                        <div className="flex flex-col items-end gap-1 max-w-[70%]">
                          {/* Bubble */}
                          <div
                            className={cn(
                              "px-4 py-2 rounded-2xl shadow-sm break-words text-sm",
                              isMe
                                ? "bg-primary text-primary-foreground rounded-br-none"
                                : "bg-white dark:bg-muted border rounded-bl-none"
                            )}
                          >
                            {msg.content}
                          </div>

                          {/* Meta (time + status) */}
                          <div
                            className={cn(
                              "flex items-center gap-1 text-[10px] opacity-70",
                              isMe ? "text-primary" : "text-muted-foreground"
                            )}
                          >
                            {/* Time luôn hiển thị */}
                            <span>
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>

                            {/* Status */}
                            {isMe && (
                              <>
                                {msg.is_read && isLastMessage ? (
                                  <>
                                    <CheckCheck
                                      className="w-3 h-3"
                                      strokeWidth={2.5}
                                    />
                                    <span>Đã xem</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Đã gửi</span>
                                  </>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t bg-background">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 rounded-full bg-muted/50 border-transparent focus:bg-background focus:border-primary"
                  disabled={sendMessageMutation.isPending}
                />
                <EmojiPickerButton
                  onEmojiSelect={(emoji) =>
                    setMessageInput((prev) => prev + emoji)
                  }
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full h-10 w-10 shrink-0"
                  disabled={
                    sendMessageMutation.isPending || !messageInput.trim()
                  }
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50">
            <MessageSquare className="w-20 h-20 mb-4 stroke-1" />
            <p className="text-lg">Chọn một cuộc hội thoại để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
