import { Header } from "./Header";
import { Footer } from "./Footer";
import { Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const MainLayout = () => {
  const location = useLocation();
  const isChatPage = location.pathname.startsWith("/messages");

  return (
    <div className="min-h-screen flex bg-background font-sans transition-colors duration-300">
      {/* Sidebar (Formerly Header) */}
      <Header />

      <div 
        className={cn(
          "flex-1 flex flex-col min-w-0 pt-16 md:pt-0",
          isChatPage ? "h-screen overflow-hidden" : "min-h-screen"
        )}
      >
        <main 
          className={cn(
            "flex-1 relative flex flex-col",
            !isChatPage && "py-8 px-4 md:px-8"
          )}
        >
          <div className={cn("flex-1", !isChatPage && "max-w-[1400px] mx-auto w-full")}>
            <Outlet />
          </div>
        </main>

        {!isChatPage && <Footer />}
      </div>
    </div>
  );
};
