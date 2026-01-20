import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Mail,
  Edit,
  LayoutDashboard,
  BarChart3,
  Users,
  Gamepad2,
  Trophy,
  CalendarDays,
  Award,
  TrendingUp,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useUserProfile, useUpdateProfile } from "@/hooks/useUser";
import { useProfileStats } from "@/hooks/useProfileStats";
import EditProfileView from "./EditProfile";
import ChangePasswordView from "./ChangePassword";
import { GameHistory } from "./GameHistory";
import { FriendsTab } from "./FriendsTab";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import type { UpdateProfileValues } from "@/lib/schemas";
import { StatsTab } from "./StatsTab";
import { AchievementsTab } from "./AchievementsTab";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

type ViewMode = "view" | "edit" | "password";

const ProfilePage = () => {
  useDocumentTitle("Hồ sơ của tôi");
  const { data: user, isLoading, isError } = useUserProfile();
  const [mode, setMode] = useState<ViewMode>("view");
  const updateProfile = useUpdateProfile();

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch statistics for overview using custom hook
  const profileStats = useProfileStats();

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (
      tabFromUrl &&
      ["overview", "game", "stats", "friends", "achievements"].includes(
        tabFromUrl,
      )
    ) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value }); // Cập nhật URL mà không reload trang
  };

  const handleSave = async (data: UpdateProfileValues | FormData) => {
    try {
      await updateProfile.mutateAsync(data);
    } catch (error) {}
  };

  if (isLoading) return <ProfileSkeleton />;
  if (isError || !user) return <ErrorState />;

  if (mode === "edit") {
    return (
      <EditProfileView
        user={user}
        onBack={() => setMode("view")}
        onSave={handleSave}
        onOpenChangePassword={() => setMode("password")}
      />
    );
  }

  if (mode === "password") {
    return <ChangePasswordView onBack={() => setMode("edit")} />;
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          {/* ===== HEADER ===== */}
          <div className="bg-card border rounded-2xl p-4 md:p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              {/* Avatar */}
              <div className="flex justify-center md:justify-start">
                <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-background shadow-md">
                  <AvatarImage src={user.avatar_url || ""} />
                  <AvatarFallback className="text-xl md:text-2xl font-bold bg-primary/10 text-primary">
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left space-y-1">
                <h1 className="text-xl md:text-3xl font-bold">
                  {user.username}
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center md:justify-start">
                  <Mail className="h-4 w-4" />
                  <span className="truncate max-w-[220px] md:max-w-none">
                    {user.email}
                  </span>
                </p>
              </div>

              {/* Action */}
              <Button
                onClick={() => setMode("edit")}
                className="w-full md:w-auto gap-2"
              >
                <Edit className="h-4 w-4" /> Edit Profile
              </Button>
            </div>

            {/* ===== TABS - RESPONSIVE DESIGN ===== */}
            <div className="pt-4">
              <TabsList
                className="
                  grid grid-cols-2 gap-2 w-full rounded-xl bg-muted/60 p-1.5 shadow-sm h-auto
                  sm:flex sm:flex-nowrap sm:overflow-x-auto sm:justify-start
                  md:grid md:grid-cols-5 md:max-w-3xl md:mx-auto
                  [&::-webkit-scrollbar]:h-1.5
                  [&::-webkit-scrollbar-track]:bg-transparent
                  [&::-webkit-scrollbar-thumb]:bg-primary/20
                  [&::-webkit-scrollbar-thumb]:rounded-full
                  [&::-webkit-scrollbar-thumb]:hover:bg-primary/30
                "
              >
                <TabsTrigger
                  value="overview"
                  className="
                    flex items-center justify-center gap-1.5 px-3 py-2.5 
                    text-xs sm:text-sm whitespace-nowrap 
                    data-[state=active]:bg-background data-[state=active]:shadow-sm
                    transition-all duration-200
                  "
                >
                  <LayoutDashboard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline sm:inline">Tổng quan</span>
                  <span className="xs:hidden sm:hidden">Tổng</span>
                </TabsTrigger>

                <TabsTrigger
                  value="game"
                  className="
                    flex items-center justify-center gap-1.5 px-3 py-2.5 
                    text-xs sm:text-sm whitespace-nowrap 
                    data-[state=active]:bg-background data-[state=active]:shadow-sm
                    transition-all duration-200
                  "
                >
                  <Gamepad2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline sm:inline">Lịch sử</span>
                  <span className="xs:hidden sm:hidden">Game</span>
                </TabsTrigger>

                <TabsTrigger
                  value="stats"
                  className="
                    flex items-center justify-center gap-1.5 px-3 py-2.5 
                    text-xs sm:text-sm whitespace-nowrap 
                    data-[state=active]:bg-background data-[state=active]:shadow-sm
                    transition-all duration-200
                  "
                >
                  <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Stats</span>
                </TabsTrigger>

                <TabsTrigger
                  value="friends"
                  className="
                    flex items-center justify-center gap-1.5 px-3 py-2.5 
                    text-xs sm:text-sm whitespace-nowrap 
                    data-[state=active]:bg-background data-[state=active]:shadow-sm
                    transition-all duration-200
                  "
                >
                  <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline sm:inline">Bạn bè</span>
                  <span className="xs:hidden sm:hidden">Bạn</span>
                </TabsTrigger>

                <TabsTrigger
                  value="achievements"
                  className="
                    col-span-2 sm:col-span-1
                    flex items-center justify-center gap-1.5 px-3 py-2.5 
                    text-xs sm:text-sm whitespace-nowrap 
                    data-[state=active]:bg-background data-[state=active]:shadow-sm
                    transition-all duration-200
                  "
                >
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Thành tựu</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* ===== CONTENT ===== */}
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  Tổng quan
                </CardTitle>
                <CardDescription className="text-sm">
                  Thống kê tổng quan về tài khoản của bạn
                </CardDescription>
              </CardHeader>

              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Friends Count */}
                <StatBox
                  icon={Users}
                  label="Bạn bè"
                  value={profileStats.friendsCount}
                  color="blue"
                />

                {/* Achievements Count */}
                <StatBox
                  icon={Trophy}
                  label="Thành tựu"
                  value={profileStats.achievementsCount}
                  color="yellow"
                />

                {/* Total Games Played */}
                <StatBox
                  icon={Gamepad2}
                  label="Tổng số trận"
                  value={profileStats.totalGamesPlayed}
                  color="purple"
                />

                {/* Best Rank */}
                <StatBox
                  icon={TrendingUp}
                  label="Hạng cao nhất"
                  value={
                    profileStats.statsLoading
                      ? "..."
                      : profileStats.bestRank
                        ? `#${profileStats.bestRank}`
                        : "Chưa xếp hạng"
                  }
                  color="green"
                />

                {/* Account Creation Date */}
                <StatBox
                  icon={CalendarDays}
                  label="Ngày tham gia"
                  value={
                    user?.created_at
                      ? format(new Date(user.created_at), "dd/MM/yyyy", {
                          locale: vi,
                        })
                      : "N/A"
                  }
                  color="indigo"
                />

                {/* Total Games with Ranks */}
                <StatBox
                  icon={Award}
                  label="Trò chơi đã chơi"
                  value={
                    profileStats.statsLoading
                      ? "..."
                      : `${profileStats.gamesPlayed.withRank}/${profileStats.gamesPlayed.total}`
                  }
                  color="pink"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="game" className="mt-6">
            <GameHistory />
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <StatsTab />
          </TabsContent>

          <TabsContent value="friends" className="mt-6">
            <FriendsTab />
          </TabsContent>
          <TabsContent value="achievements" className="mt-6">
            <AchievementsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// StatBox component for displaying statistics
interface StatBoxProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: "blue" | "yellow" | "purple" | "green" | "indigo" | "pink";
}

const StatBox = ({ icon: Icon, label, value, color }: StatBoxProps) => {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    yellow: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
    green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800",
    pink: "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800",
  };

  const iconColorClasses = {
    blue: "text-blue-600 dark:text-blue-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
    purple: "text-purple-600 dark:text-purple-400",
    green: "text-green-600 dark:text-green-400",
    indigo: "text-indigo-600 dark:text-indigo-400",
    pink: "text-pink-600 dark:text-pink-400",
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]} transition-all hover:shadow-md`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-background/50">
          <Icon className={`h-5 w-5 ${iconColorClasses[color]}`} />
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className="text-xl font-bold mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
};

const ProfileSkeleton = () => (
  <div className="p-8">
    <Skeleton className="h-64 w-full rounded-2xl" />
  </div>
);

const ErrorState = () => (
  <div className="p-8 text-center text-red-500">Không thể tải dữ liệu</div>
);

export default ProfilePage;
