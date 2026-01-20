import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { BoxButton } from "../ui/box-button";
export const GameHeader = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between w-full max-w-2xl fixed left-3 top-3">
      <BoxButton
        size="small"
        variant="accent"
        sound="button1"
        onClick={() => {
          setTimeout(() => navigate("/"), 200);
        }}
        className="gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="hidden sm:inline text-xs font-bold uppercase">
          Trang chủ
        </span>
      </BoxButton>

      <div className="flex gap-2">{children}</div>
    </div>
  );
};
