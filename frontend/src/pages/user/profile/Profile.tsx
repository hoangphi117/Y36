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
import EditProfileView from "./EditProfile";
import ChangePasswordView from "./ChangePassword";
import { GameHistory } from "./GameHistory";
import { FriendsTab } from "./FriendsTab";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import type { UpdateProfileValues } from "@/lib/schemas";
import { StatsTab } from "./StatsTab";
import { AchievementsTab } from "./AchievementsTab";

type ViewMode = "view" | "edit" | "password";

const ProfilePage = () => {
  useDocumentTitle("Hồ sơ của tôi");
  const { data: user, isLoading, isError } = useUserProfile();
  const [mode, setMode] = useState<ViewMode>("view");
  const updateProfile = useUpdateProfile();

  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("overview");

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
          {/* Các phần TabsContent giữ nguyên không cần sửa đổi */}
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  Thông tin chung
                </CardTitle>
                <CardDescription className="text-sm">
                  Thông tin cơ bản về tài khoản
                </CardDescription>
              </CardHeader>

              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoBox label="User ID" value={user.user_id} mono />
                <InfoBox label="Trạng thái" value={user.status} />
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

const InfoBox = ({ label, value, mono }: any) => (
  <div className="p-4 rounded-lg border bg-muted/40">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className={`mt-1 ${mono ? "font-mono text-sm" : "font-medium"}`}>
      {value}
    </p>
  </div>
);

const ProfileSkeleton = () => (
  <div className="p-8">
    <Skeleton className="h-64 w-full rounded-2xl" />
  </div>
);

const ErrorState = () => (
  <div className="p-8 text-center text-red-500">Không thể tải dữ liệu</div>
);

export default ProfilePage;
