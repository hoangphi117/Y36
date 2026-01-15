import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export const UnsavedChangesDialog = ({ open, onStay, onLeave }: Props) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Thay đổi chưa được lưu</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có thay đổi chưa lưu. Nếu rời trang, các thay đổi này sẽ bị mất.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onStay}>Ở lại</AlertDialogCancel>
          <AlertDialogAction onClick={onLeave}>Rời trang</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
