import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFriendRequests, useSentRequests } from "@/hooks/useUser";

import { MyFriendsList } from "@/components/friends/MyFriendsList";
import { FriendRequestsList } from "@/components/friends/FriendRequestsList";
import { SentRequestsList } from "@/components/friends/SentRequestsList";
import { GlobalSearch } from "@/components/friends/GlobalSearch";

export const FriendsTab = () => {
  const { data: requests } = useFriendRequests();
  const { data: sentRequests } = useSentRequests();

  const requestCount = requests?.data?.length || 0;
  const sentCount = sentRequests?.data?.length || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 min-h-[500px]">
      <Tabs defaultValue="my-friends" className="w-full">
        {/* --- TAB HEADER --- */}
        <div className="sticky top-0 bg-background z-10 pb-4 pt-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="my-friends" className="text-xs sm:text-sm">
              Bạn bè
            </TabsTrigger>

            <TabsTrigger
              value="requests"
              className="relative text-xs sm:text-sm"
            >
              Lời mời
              {requestCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white animate-pulse">
                  {requestCount}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger value="sent" className="relative text-xs sm:text-sm">
              Đã gửi
              {sentCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white animate-pulse">
                  {sentCount}
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger value="find-users" className="text-xs sm:text-sm">
              Tìm kiếm
            </TabsTrigger>
          </TabsList>
        </div>

        {/* --- CONTENT COMPONENTS --- */}

        <TabsContent
          value="my-friends"
          className="space-y-4 focus-visible:outline-none"
        >
          <MyFriendsList />
        </TabsContent>

        <TabsContent
          value="requests"
          className="space-y-4 focus-visible:outline-none"
        >
          <FriendRequestsList />
        </TabsContent>

        <TabsContent
          value="sent"
          className="space-y-4 focus-visible:outline-none"
        >
          <SentRequestsList />
        </TabsContent>

        <TabsContent
          value="find-users"
          className="space-y-4 focus-visible:outline-none"
        >
          <GlobalSearch />
        </TabsContent>
      </Tabs>
    </div>
  );
};
