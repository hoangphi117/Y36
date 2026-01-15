import { motion } from "framer-motion";
import { cn } from "@/lib/utils"; 

interface StatCardProps {
  label?: string;
  value: number | string;
  colorClass?: string; 
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>; 
  className?: string; 
}

const StatCard = ({ label, value, colorClass, icon: Icon, className } : StatCardProps) => {
    return (
        <motion.div
            className={cn(
                "bg-card rounded-lg p-3 sm:p-5 text-center border-2 shadow-sm flex flex-col items-center justify-center min-w-[100px]",
                className
            )}  
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                {label}
            </p>
            <div className={cn("text-2xl sm:text-4xl font-black flex items-center gap-2", colorClass)}>
                {Icon && <Icon strokeWidth={3} className="w-5 h-5 sm:w-7 sm:h-7" />}
                {value}
            </div>
        </motion.div>
    )

}

export default StatCard;