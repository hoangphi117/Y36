import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Clover } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Hình ảnh minh họa vui nhộn */}
      <div className="relative mb-8">
        <h1 className="text-9xl font-black text-primary/20 select-none">404</h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl animate-bounce">
            <Clover size={36} className="text-green-600" />
          </span>
        </div>
      </div>

      {/* Thông điệp */}
      <h2 className="text-3xl font-bold text-foreground mb-4">
        Ối! Trang này biến mất rồi...
      </h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Có vẻ như bé đã đi lạc vào khu vườn bí mật. Đừng lo, hãy nhấn nút bên
        dưới để quay về nhà nhé!
      </p>

      {/* Nhóm nút điều hướng */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="border-primary text-primary hover:bg-primary/10 rounded-full px-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại trang cũ
        </Button>

        <Button
          onClick={() => navigate("/")}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-8 shadow-lg hover:scale-105 transition-transform"
        >
          <Home className="mr-2 h-4 w-4" />
          Về Trang Chủ
        </Button>
      </div>
    </div>
  );
}
