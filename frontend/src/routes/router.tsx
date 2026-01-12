import { createBrowserRouter } from "react-router-dom";

import { MainLayout } from "@/components/layouts/MainLayout";
import HomePage from "../pages/home/HomePage";
import NotFoundPage from "@/pages/NotFoundPage";
import CaroGame from "@/pages/games/CaroGame";
import TicTacToe from "@/pages/games/TicTacToe";
import SnakeGame from "@/pages/games/Snake";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";

// ===== ADMIN IMPORTS =====
import { AdminGuard } from "@/components/admin/auth/AdminGuard";
import { AdminLayout } from "@/components/admin/layout/AdminLayout";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [{ index: true, element: <HomePage /> }, {}],
  },
  {
    path: "/caro",
    element: <CaroGame />,
  },
  {
    path: "/tic-tac-toe",
    element: <TicTacToe />,
  },
  {
    path: "/snake",
    element: <SnakeGame />,
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
  {
    path: "/auth/register",
    element: <RegisterPage />,
  },

  // ===== ADMIN ROUTES (MỚI THÊM) =====
  {
    path: "/admin",
    element: <AdminGuard />,
    errorElement: <NotFoundPage />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          // TODO: Thêm routes khác
          // { path: "users", element: <AdminUsersPage /> },
          // { path: "games", element: <AdminGamesPage /> },
          // { path: "stats", element: <AdminStatsPage /> },
        ],
      },
    ],
  },
]);

export default router;
