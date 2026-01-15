import * as z from "zod";

export const registerSchema = z
  .object({
    username: z.string().min(2, "Tên hiển thị phải có ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
    role: z.enum(["user", "admin"]).default("user"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Tên hiển thị phải trên 3 ký tự" })
    .max(20),
  dark_mode: z.boolean(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
