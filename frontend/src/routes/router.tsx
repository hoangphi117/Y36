import { createBrowserRouter, Navigate } from "react-router-dom";

import { useAuthStore } from "@/stores/useAuthStore";
import { MainLayout } from "@/components/layouts/MainLayout";
import HomePage from "../pages/home/HomePage";
import NotFoundPage from "@/pages/NotFoundPage";
import CaroGame from "@/pages/games/CaroGame";
import TicTacToe from "@/pages/games/TicTacToe";
import SnakeGame from "@/pages/games/Snake";
import Match3Game from "@/pages/games/Match3Game";
import MemoryModeSelection from "@/pages/games/MemoryModeSelection";
import MemoryLevelGame from "@/pages/games/MemoryLevelGame";
import MemoryFreeGame from "@/pages/games/MemoryFreeGame";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ProfilePage from "@/pages/user/profile/Profile";
import ChatPage from "@/pages/user/chat/ChatPage";
import RankingPage from "@/pages/user/RankingPage";

// ===== ADMIN IMPORTS =====
import { AdminGuard } from "@/components/admin/auth/AdminGuard";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminUsersPage } from "@/pages/admin/AdminUsersPage";
import { AdminGamesPage } from "@/pages/admin/AdminGamesPage";
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage";
import AdminStatsPage from "@/pages/admin/AdminStatsPage";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/auth/login" replace />;
  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "profile",
        element: (
          <ProtectedRoute>
            <ProfilePage />{" "}
          </ProtectedRoute>
        ),
      },
      {
        path: "messages",
        element: (
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "ranking",
        element: (
          <ProtectedRoute>
            <RankingPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/games/caro-5",
    element: <CaroGame gameId={1} winCondition={5} />,
  },
  {
    path: "/games/caro-4",
    element: <CaroGame gameId={2} winCondition={4} />,
  },
  {
    path: "/games/tic-tac-toe",
    element: <TicTacToe />,
  },
  {
    path: "/games/snake",
    element: <SnakeGame />,
  },
  {
    path: "/match-3",
    element: <Match3Game />,
  },
  {
    path: "/memory",
    element: <MemoryModeSelection />,
  },
  {
    path: "/memory-level",
    element: <MemoryLevelGame />,
  },
  {
    path: "/memory-free",
    element: <MemoryFreeGame />,
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
  {
    path: "/auth/register",
    element: <RegisterPage />,
  },

  // ===== ADMIN ROUTES =====
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
  },
  {
    path: "/admin",
    element: <AdminGuard />,
    errorElement: <NotFoundPage />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "users", element: <AdminUsersPage /> },
          { path: "games", element: <AdminGamesPage /> },
          { path: "stats", element: <AdminStatsPage /> },
        ],
      },
    ],
  },
]);

export default router;
