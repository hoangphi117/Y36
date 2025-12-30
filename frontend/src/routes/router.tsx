import { createBrowserRouter } from "react-router-dom";

import { MainLayout } from "@/components/layouts/MainLayout";
import HomePage from "../pages/home/HomePage";
import NotFoundPage from "@/pages/NotFoundPage";
import CaroGame from "@/pages/games/CaroGame";
import TicTacToe from "@/pages/games/TicTacToe";
import SnakeGame from "@/pages/games/Snake";

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
]);

export default router;
