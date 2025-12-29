import { Clover } from "lucide-react";
export const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-card mt-auto">
      <div className="mx-auto w-[90%] md:w-[80%] py-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <p className="flex items-center gap-2 text-primary font-bold text-lg">
            <Clover size={36} className="text-green-600" />
            Rau Má Games
          </p>
        </div>

        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Rau Ma Project. Made with ❤️ for kids.
        </div>
      </div>
    </footer>
  );
};
