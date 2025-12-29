import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Clover } from "lucide-react";
import { BoxButton } from "@/components/ui/box-button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Hình ảnh minh họa vui nhộn */}
      <div className="relative mb-8">
        <h1 className="text-9xl font-black text-primary/20 select-none">404</h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl animate-bounce pt-6">
            <Clover size={36} className="text-green-600" />
          </span>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-foreground mb-4">
        Ối! Trang này biến mất rồi...
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Có vẻ như bé đã đi lạc vào khu vườn bí mật. Đừng lo, hãy nhấn nút bên
        dưới để quay về nhà nhé!
      </p>

      <div className="flex flex-col sm:flex-row gap-7">
        <BoxButton variant="accent" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại trang cũ
        </BoxButton>

        <BoxButton onClick={() => navigate("/")} size="medium">
          <Home className="mr-2 h-4 w-4" />
          Về Trang Chủ
        </BoxButton>
      </div>
    </div>
  );
}
