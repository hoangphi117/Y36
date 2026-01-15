import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Save, Loader2, ArrowLeft } from "lucide-react";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { changePasswordSchema, type ChangePasswordValues } from "@/lib/schemas";
import { useChangePassword } from "@/hooks/useChangePassword";

type Props = {
  onBack: () => void;
};

const ChangePasswordView = ({ onBack }: Props) => {
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const { mutateAsync, isPending, isError } = useChangePassword();

  const onSubmit = async (data: ChangePasswordValues) => {
    await mutateAsync(data);
    form.reset();
  };

  const isDisabled = !form.formState.isDirty || isPending;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex justify-center">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Đổi mật khẩu
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu hiện tại</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-bold text-destructive ml-1" />{" "}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu mới</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs font-bold text-destructive ml-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage className="text-xs font-bold text-destructive ml-1" />
                  </FormItem>
                )}
              />

              {isError && (
                <p className="text-xs font-bold text-destructive">
                  Mật khẩu hiện tại chưa đúng. Vui lòng thử lại.
                </p>
              )}

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={isDisabled}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Lưu thay đổi
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePasswordView;
