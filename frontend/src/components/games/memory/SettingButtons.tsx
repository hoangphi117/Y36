import { RoundButton } from "@/components/ui/round-button"
import { ChevronLeft, RefreshCcw } from "lucide-react"

const BackToSelectionButton = ({ backToSelection }: { backToSelection: () => void }) => {
    return (
       <RoundButton size="small" variant="accent" onClick={backToSelection} className=" text-[0.8rem] sm:py-2 rounded-md">
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden min-[375px]:inline ml-1">Quay lại</span>
        </RoundButton>
    )
}

const RefreshGameButton = ({ restartGame }: { restartGame: () => void }) => {
    return (
        <RoundButton size="small"  onClick={restartGame} className="hover:bg-primary/90 text-[0.8rem] sm:py-2 rounded-md">
            <RefreshCcw className="w-5 h-5" />
            <span className="hidden min-[375px]:inline ml-1">Làm mới</span>
        </RoundButton>  
    )
}

export {RefreshGameButton, BackToSelectionButton};
              