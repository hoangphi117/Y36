import { Clover } from "lucide-react";
export const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-card mt-8">
      <div className="mx-auto w-[90%] md:w-[80%] py-3 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <p className="flex items-center gap-2 text-primary font-bold text-lg">
            <Clover size={36} className="text-green-600" />
            Y36 Games
          </p>
        </div>

        <div className="text-sm text-muted-foreground">
          23120272 - 23120320 - 23120339 -23120341 © {new Date().getFullYear()} Y36 Project.
        </div>
      </div>
    </footer>
  );
};
