import { useNavigate, useRouteError } from "react-router-dom";
import { Home, ArrowLeft, Clover } from "lucide-react";
import { BoxButton } from "@/components/ui/box-button";
import { useGameSound } from "@/hooks/useGameSound";

interface RouteError {
  statusText?: string;
  message?: string;
  [key: string]: any;
}

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { playSound } = useGameSound(true);

  const error = useRouteError() as RouteError;

  console.error(error);

  const handleClick = (url: string | number) => {
    playSound("button1");
    
    setTimeout(() => {
      if (typeof url === 'string') {
        navigate(url);
      } else {
        navigate(url);
      }
    }, 200);
  };

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

      <h2 className="text-3xl font-bold text-foreground mb-7">
        Ối! Trang này biến mất rồi...
      </h2>

      <div className="flex flex-col sm:flex-row gap-7">
        <BoxButton
          variant="accent"
          onClick={() => {
            handleClick(-1);
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại trang cũ
        </BoxButton>

        <BoxButton
          onClick={() => {
            handleClick("/");
          }}
          size="medium"
        >
          <Home className="mr-2 h-4 w-4" />
          Về Trang Chủ
        </BoxButton>
      </div>
      {error && (
        <span className="block mt-4 font-mono text-lg p-2 mb-8 rounded text-red-500 overflow-hidden text-ellipsis max-w-full opacity-50">
          Error: {error.statusText || error.message}
        </span>
      )}
    </div>
  );
}
