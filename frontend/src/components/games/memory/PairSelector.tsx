import { motion, AnimatePresence } from 'framer-motion';

interface PairSelectorProps {
  min?: number;
  max?: number;
  value: number;
  onChange: (newValue: number) => void;
}

const PairSelector = ({ min = 3, max = 16, value, onChange } : PairSelectorProps) => {
  
  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-transparent rounded-2xl w-fit">
      
      <div className="flex items-center justify-between w-full bg-transparent rounded-sm p-1 border">
        {/* Nút Giảm */}
        <button
          onClick={decrement}
          className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-red-500/20 text-red-500 transition-colors disabled:opacity-30"
          disabled={value <= min}
        >
          <span className="text-2xl font-bold">−</span>
        </button>

        {/* Hiển thị số với hiệu ứng nhảy số */}
        <div className="relative overflow-hidden w-12 h-10 flex items-center justify-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-xl font-bold absolute"
            >
              {value}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Nút Tăng */}
        <button
          onClick={increment}
          className="w-10 h-10 flex items-center justify-center rounded-md hover:bg-green-500/20 text-green-500 transition-colors disabled:opacity-30"
          disabled={value >= max}
        >
          <span className="text-2xl font-bold">+</span>
        </button>
      </div>
      
      <p className="text-xs text-gray-500">Giới hạn từ {3} đến {16} cặp</p>
    </div>
  );
};

export default PairSelector;