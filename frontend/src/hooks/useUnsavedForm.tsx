import { useCallback, useEffect, useState } from "react";
import { useBlocker } from "react-router-dom";

export function useUnsavedChanges(isDirty: boolean) {
  const [showDialog, setShowDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // ===== 1. Chặn Reload / Close tab (Native Browser) =====
  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  // ===== 2. Chặn điều hướng React Router (Browser Back Button) =====
  // useBlocker sẽ tự động kích hoạt khi isDirty = true và người dùng cố chuyển trang
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  // Khi blocker chuyển sang trạng thái "blocked", hiển thị Dialog
  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowDialog(true);
    }
  }, [blocker.state]);

  // ===== 3. Logic xử lý Dialog =====

  // Gọi khi bấm nút Back/Cancel tùy chỉnh trên giao diện (Custom UI Button)
  const confirmNavigation = useCallback(
    (action: () => void) => {
      if (!isDirty) {
        action();
        return;
      }
      setPendingAction(() => action);
      setShowDialog(true);
    },
    [isDirty]
  );

  // Khi người dùng chọn "Ở lại" (Stay)
  const cancelNavigation = useCallback(() => {
    // Nếu đang bị chặn bởi Browser Back -> Reset blocker
    if (blocker.state === "blocked") {
      blocker.reset();
    }
    // Nếu đang bị chặn bởi Custom Button -> Clear action
    setPendingAction(null);
    setShowDialog(false);
  }, [blocker]);

  // Khi người dùng chọn "Rời đi" (Leave)
  const proceedNavigation = useCallback(() => {
    // Trường hợp 1: Tiếp tục điều hướng của trình duyệt (Browser Back)
    if (blocker.state === "blocked") {
      blocker.proceed();
    }
    // Trường hợp 2: Thực hiện action tùy chỉnh (Custom Button)
    else {
      pendingAction?.();
    }

    setPendingAction(null);
    setShowDialog(false);
  }, [blocker, pendingAction]);

  return {
    showDialog,
    confirmNavigation,
    cancelNavigation,
    proceedNavigation,
  };
}
