import { useEffect } from "react";

const useDocumentTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} | Y36`;
  }, [title]);
};

export default useDocumentTitle;
