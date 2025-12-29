import { createBrowserRouter } from "react-router-dom";

import { MainLayout } from "@/components/layouts/MainLayout";
import HomePage from "../pages/home/HomePage";
import NotFoundPage from "@/pages/NotFoundPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [{ index: true, element: <HomePage /> }, {}],
  },
]);

export default router;
