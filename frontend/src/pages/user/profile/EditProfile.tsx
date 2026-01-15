import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Loader2,
  Save,
  Mail,
  Lock,
  User as UserIcon,
  Camera,
  KeyRound,
} from "lucide-react";

import { useUnsavedChanges } from "@/hooks/useUnsavedForm";
import { UnsavedChangesDialog } from "@/components/dialogs/UnsavedChangesDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { updateProfileSchema, type UpdateProfileValues } from "@/lib/schemas";

interface Props {
  user: {
    user_id: string;
    email: string;
    username: string;
    avatar_url: string | null;
    dark_mode: boolean;
  };
  onBack?: () => void;
  onSave: (data: UpdateProfileValues) => Promise<void> | void;
  onOpenChangePassword: () => void;
}

const EditProfileView = ({
  user,
  onBack,
  onSave,
  onOpenChangePassword,
}: Props) => {
  const navigate = useNavigate();

  const form = useForm<UpdateProfileValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      username: user.username,
      dark_mode: user.dark_mode,
    },
  });

  const {
    formState: { isDirty, isSubmitting },
    handleSubmit,
    reset,
  } = form;

  const { showDialog, confirmNavigation, cancelNavigation, proceedNavigation } =
    useUnsavedChanges(isDirty);

  const handleBack = () => {
    if (onBack) {
      confirmNavigation(onBack);
    } else {
      confirmNavigation(() => navigate(-1));
    }
  };

  const onSubmit = async (data: UpdateProfileValues) => {
    try {
      await onSave(data);

      reset(data);
    } catch (error) {
      console.error("Lỗi khi lưu hồ sơ:", error);
    }
  };

  const handleChangePassword = () => {
    confirmNavigation(() => {
      onOpenChangePassword();
    });
  };

  return (
    <>
      <div className="min-h-screen bg-background p-4 md:p-8 flex justify-center">
        <Card className="w-full max-w-2xl border-none shadow-none bg-transparent animate-in slide-in-from-right-10 duration-300">
          {/* HEADER */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => confirmNavigation(onBack ?? (() => navigate(-1)))}
              className="rounded-full"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Chỉnh sửa hồ sơ</h1>
              <p className="text-sm text-muted-foreground">
                Cập nhật thông tin cá nhân của bạn
              </p>
            </div>
          </div>

          {/* CONTENT */}
          <Card className="border shadow-sm">
            <CardContent className="p-6 md:p-8 space-y-8">
              {/* AVATAR */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative group cursor-pointer">
                  <Avatar className="h-28 w-28 border-4 border-card shadow-lg">
                    <AvatarImage src={user.avatar_url || ""} />
                    <AvatarFallback className="text-3xl font-bold bg-primary/10 text-primary">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Nhấn để thay đổi ảnh đại diện (tạm thời)
                </p>
              </div>

              {/* FORM */}
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* USER ID */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      User ID
                      <Badge variant="outline" className="text-[10px] h-4">
                        Locked
                      </Badge>
                    </Label>
                    <Input
                      value={user.user_id}
                      disabled
                      className="bg-muted/50 font-mono border-dashed"
                    />
                  </div>

                  {/* EMAIL */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" /> Email
                      <Badge variant="outline" className="text-[10px] h-4">
                        Locked
                      </Badge>
                    </Label>
                    <div className="relative">
                      <Input
                        value={user.email}
                        disabled
                        className="bg-muted/50 border-dashed"
                      />
                      <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
                    </div>
                  </div>

                  {/* USERNAME */}
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          Tên hiển thị
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* DARK MODE */}
                  <FormField
                    control={form.control}
                    name="dark_mode"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
                        <div>
                          <FormLabel>Dark mode</FormLabel>
                          <FormDescription>Bật giao diện tối</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <Lock className="h-4 w-4" /> Bảo mật
                    </Label>
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-background rounded-md border">
                          <KeyRound className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">Mật khẩu</p>
                          <p className="text-muted-foreground text-xs">
                            ***********
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleChangePassword}
                      >
                        Đổi mật khẩu
                      </Button>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="pt-4 border-t flex gap-4">
                    <Button
                      type="submit"
                      disabled={!isDirty || isSubmitting}
                      className="flex-1 gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Lưu thay đổi
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                      className="flex-1"
                    >
                      Huỷ
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </Card>
      </div>

      {/* DIALOG UNSAVED */}
      <UnsavedChangesDialog
        open={showDialog}
        onStay={cancelNavigation}
        onLeave={proceedNavigation}
      />
    </>
  );
};

export default EditProfileView;
