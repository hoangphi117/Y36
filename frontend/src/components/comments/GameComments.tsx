// src/components/comments/GameComments.tsx
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Send, Edit2, Trash2, MoreVertical, X, Check } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaginationCustom } from "../shared/PaginationCustom";
import {
  useGetComments,
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from "@/hooks/useComment";
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

import { useAuthStore } from "@/stores/useAuthStore"; // Lấy thông tin user đang login
import { Loader2 } from "lucide-react";
import { BoxButton } from "../ui/box-button";

interface Props {
  gameId: number;
}

export function GameComments({ gameId }: Props) {
  const [page, setPage] = useState(1);
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // User hiện tại (để check quyền sửa/xóa)
  const { user } = useAuthStore();

  // Hooks API
  const { data, isLoading } = useGetComments(gameId, page);
  const createMutation = useCreateComment();
  const deleteMutation = useDeleteComment();
  const updateMutation = useUpdateComment();

  // Xử lý đăng comment
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createMutation.mutate(
      { gameId, content },
      {
        onSuccess: () => setContent(""), // Reset input sau khi thành công
      },
    );
  };

  // Xử lý bắt đầu sửa
  const handleStartEdit = (comment: any) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  // Xử lý lưu sửa
  const handleSaveEdit = () => {
    if (!editContent.trim() || !editingId) return;
    updateMutation.mutate(
      { id: editingId, content: editContent },
      {
        onSuccess: () => setEditingId(null),
      },
    );
  };

  // Xử lý xóa
  const handleConfirmDelete = () => {
    if (!deleteId) return;
    deleteMutation.mutate(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 p-4 bg-card rounded-xl border shadow-sm">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        Bình luận{" "}
        <span className="text-sm font-normal text-muted-foreground">
          ({data?.total || 0})
        </span>
      </h3>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
        <Avatar>
          <AvatarImage src={user?.avatar_url || ""} />
          <AvatarFallback>
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 gap-2 flex flex-col items-end">
          <Textarea
            placeholder="Viết suy nghĩ của bạn về ván đấu..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px]"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Gửi
          </Button>
        </div>
      </form>

      {/* List Comments */}
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {data?.comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <Avatar className="w-8 h-8 md:w-10 md:h-10">
                {/* Nếu API trả về user info thì dùng, không thì fallback */}
                <AvatarImage src={comment.avatar_url || ""} />
                <AvatarFallback className="text-xs">
                  {comment.username?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {/* Hiển thị username nếu có, nếu không thì hiện ID rút gọn */}
                      {comment.username ||
                        `User ${comment.user_id.slice(0, 6)}...`}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </span>
                  </div>

                  {/* Dropdown Menu (Chỉ hiện nếu là chủ comment) */}
                  {user?.user_id === comment.user_id &&
                    editingId !== comment.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleStartEdit(comment)}
                          >
                            <Edit2 className="w-4 h-4 mr-2" /> Sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => setDeleteId(comment.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                </div>

                {/* Content Display vs Edit Mode */}
                {editingId === comment.id ? (
                  <div className="flex flex-col gap-2 mt-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[60px]"
                    />
                    <div className="flex gap-2 justify-end">
                      <BoxButton
                        size="small"
                        variant="danger"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="w-3 h-3 mr-1" /> Hủy
                      </BoxButton>
                      <BoxButton
                        size="small"
                        variant="primary"
                        onClick={handleSaveEdit}
                        disabled={updateMutation.isPending}
                      >
                        <Check className="w-3 h-3 mr-1" /> Lưu
                      </BoxButton>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words bg-muted/30 p-2 rounded-md">
                    {comment.content}
                  </p>
                )}
              </div>
            </div>
          ))}

          {data?.comments.length === 0 && (
            <div className="text-center text-muted-foreground py-8 italic">
              Chưa có bình luận nào. Hãy là người đầu tiên!
            </div>
          )}

          {/* Pagination */}
          <PaginationCustom
            page={page}
            totalPages={data?.totalPages || 0}
            onPageChange={setPage}
          />
        </div>
      )}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bình luận</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bình luận sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
