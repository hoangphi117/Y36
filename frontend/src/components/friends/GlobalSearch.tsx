import { useState } from "react";
import { Search, Loader2, UserX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchUsers } from "@/hooks/useUser";
import { useDebounce } from "@/hooks/useDebounce";
import { ActionButton, BlockButton } from "./FriendAction";
import { EmptyState } from "./FriendCommon";

export const GlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { data, isLoading, isFetching } = useSearchUsers(debouncedSearchTerm);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Nhập tên người chơi..."
          className="pl-10 h-12 text-base bg-muted/30"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {(isLoading || isFetching) && (
          <div className="absolute right-4 top-3.5">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
      </div>

      {debouncedSearchTerm.length > 1 && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pl-1">
            Kết quả ({data?.data?.length || 0})
          </h3>

          <div className="grid gap-3">
            {data?.data?.map((user) => (
              <Card
                key={user.id}
                className="overflow-hidden hover:bg-muted/20 transition-colors"
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={user.avatar_url || ""} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-bold text-sm">{user.username}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <ActionButton
                      status={user.friend_status}
                      userId={user.id}
                    />
                    <BlockButton userId={user.id} username={user.username} />
                  </div>
                </CardContent>
              </Card>
            ))}

            {data?.data?.length === 0 && !isLoading && (
              <EmptyState
                icon={<UserX className="h-8 w-8" />}
                text={`Không tìm thấy "${debouncedSearchTerm}"`}
              />
            )}
          </div>
        </div>
      )}

      {!debouncedSearchTerm && (
        <div className="text-center py-12 text-muted-foreground opacity-50">
          <Search className="h-12 w-12 mx-auto mb-2" />
          <p>Tìm kiếm bạn mới để so tài!</p>
        </div>
      )}
    </div>
  );
};
