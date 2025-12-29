import { Header } from "./Header";
import { Footer } from "./Footer";
import { Outlet } from "react-router-dom";

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans transition-colors duration-300">
      {/* Header dùng chung */}
      <Header />

      <main className="flex-1 w-[90%] md:w-[80%] mx-auto py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
