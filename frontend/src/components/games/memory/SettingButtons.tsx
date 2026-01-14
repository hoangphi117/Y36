import { RoundButton } from "@/components/ui/round-button"
import { ChevronLeft, RefreshCcw } from "lucide-react"

const BackToSelectionButton = ({ backToSelection }: { backToSelection: () => void }) => {
    return (
       <RoundButton size="small" variant="accent" onClick={backToSelection} className="py-5 text-[0.8rem] sm:py-2 rounded-md">
            <ChevronLeft className="w-5 h-5" />
            Quay lại
        </RoundButton>
    )
}

const RefreshGameButton = ({ restartGame }: { restartGame: () => void }) => {
    return (
        <RoundButton size="small"  onClick={restartGame} className="hover:bg-destructive/80 py-5 text-[0.8rem] sm:py-2 rounded-md">
            <RefreshCcw className="w-5 h-5" />
            Làm mới
        </RoundButton>
    )
}

export {RefreshGameButton, BackToSelectionButton};
              