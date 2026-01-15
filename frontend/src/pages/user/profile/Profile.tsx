import { useState } from "react";
import { Mail, Edit, LayoutDashboard, Gamepad2, BarChart3 } from "lucide-react";

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

type ViewMode = "view" | "edit" | "password";

const ProfilePage = () => {
  const { data: user, isLoading, isError } = useUserProfile();
  const [mode, setMode] = useState<ViewMode>("view");
  const updateProfile = useUpdateProfile();

  const handleSave = async (data: any) => {
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
        // THÊM DÒNG NÀY: Truyền hàm để mở trang đổi pass
        onOpenChangePassword={() => setMode("password")}
      />
    );
  }

  if (mode === "password") {
    return <ChangePasswordView onBack={() => setMode("edit")} />;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="overview">
          {/* ===== HEADER ===== */}
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                <AvatarImage src={user.avatar_url || ""} />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold">{user.username}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center md:justify-start">
                  <Mail className="h-4 w-4" /> {user.email}
                </p>
              </div>

              <Button onClick={() => setMode("edit")} className="gap-2">
                <Edit className="h-4 w-4" /> Edit Profile
              </Button>
            </div>

            {/* ===== TABS ===== */}
            <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="game">Game</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>
          </div>

          {/* ===== CONTENT ===== */}
          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  Thông tin chung
                </CardTitle>
                <CardDescription>Thông tin cơ bản về tài khoản</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoBox label="User ID" value={user.user_id} mono />
                <InfoBox label="Trạng thái" value={user.status} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="game" className="mt-6">
            <EmptyState
              icon={<Gamepad2 className="h-10 w-10" />}
              title="Lịch sử đấu"
              description="Chưa có dữ liệu trò chơi."
            />
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <EmptyState
              icon={<BarChart3 className="h-10 w-10" />}
              title="Thống kê"
              description="Dữ liệu thống kê sẽ hiển thị tại đây."
            />
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

const EmptyState = ({ icon, title, description }: any) => (
  <div className="border-dashed border rounded-xl p-10 text-center text-muted-foreground">
    <div className="mx-auto mb-4">{icon}</div>
    <h3 className="font-semibold">{title}</h3>
    <p className="text-sm">{description}</p>
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
