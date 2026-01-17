import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Game } from '@/services/admin/gameService';
import { gameValidationSchemas, validateGameConfig } from '@/lib/admin/validation/gameSchemas';
import { cn } from '@/lib/utils';

interface GameConfigFormProps {
  game: Game;
  onSubmit: (config: Record<string, any>) => void;
  onCancel: () => void;
}

export const GameConfigForm = ({ game, onSubmit, onCancel }: GameConfigFormProps) => {
  const [config, setConfig] = useState(game.default_config);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const schema = gameValidationSchemas[game.code as keyof typeof gameValidationSchemas];

  const handleChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateGameConfig(game.code, config);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    onSubmit(config);
  };

  if (!schema) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 font-mono">Loại game không xác định</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {Object.entries(schema).map(([field, rules], index) => {
        const value = config[field];
        const hasError = !!errors[field];

        if ('type' in rules && rules.type === 'enum') {
          return (
            <motion.div
              key={field}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <label className="block text-sm font-bold mb-2 font-mono admin-primary uppercase tracking-wider">
                {field.replace(/_/g, ' ')}
              </label>
              <select
                value={value}
                onChange={(e) => handleChange(field, e.target.value)}
                className={cn(
                  'admin-input',
                  hasError && 'border-destructive focus:border-destructive focus:ring-destructive/20'
                )}
              >
                {'values' in rules && rules.values.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {hasError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs mt-1 font-mono"
                >
                  ⚠ {errors[field]}
                </motion.p>
              )}
            </motion.div>
          );
        }

        if ('type' in rules && rules.type === 'color') {
          return (
            <motion.div
              key={field}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <label className="block text-sm font-bold mb-2 font-mono admin-primary uppercase tracking-wider">
                {field.replace(/_/g, ' ')}
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="w-16 h-10 rounded-lg cursor-pointer border-2 border-border bg-input"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className={cn(
                    'flex-1 admin-input',
                    hasError && 'border-destructive focus:border-destructive focus:ring-destructive/20'
                  )}
                  placeholder="#FFFFFF"
                />
              </div>
              {hasError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs mt-1 font-mono"
                >
                  ⚠ {errors[field]}
                </motion.p>
              )}
            </motion.div>
          );
        }

        return (
          <motion.div
            key={field}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <label className="block text-sm font-bold mb-2 font-mono admin-primary uppercase tracking-wider">
              {field.replace(/_/g, ' ')}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleChange(field, parseInt(e.target.value))}
              min={'min' in rules ? rules.min : undefined}
              max={'max' in rules ? rules.max : undefined}
              step={'even' in rules && rules.even ? 2 : 1}
              className={cn(
                'admin-input',
                hasError && 'border-destructive focus:border-destructive focus:ring-destructive/20'
              )}
            />
            {'min' in rules && 'max' in rules && (
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                Giá trị: {rules.min} - {rules.max}
              </p>
            )}
            {hasError && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-xs mt-1 font-mono"
              >
                ⚠ {errors[field]}
              </motion.p>
            )}
          </motion.div>
        );
      })}

      {errors._grid && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-sm font-mono bg-red-500/10 border border-red-500/20 rounded-lg p-3"
        >
          ⚠ {errors._grid}
        </motion.p>
      )}

      <div className="flex gap-3 pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onCancel}
          className="admin-btn-secondary flex-1 cursor-pointer"
        >
          Hủy bỏ
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="admin-btn-primary flex-1 cursor-pointer"
        >
          Lưu thay đổi
        </motion.button>
      </div>
    </form>
  );
};
