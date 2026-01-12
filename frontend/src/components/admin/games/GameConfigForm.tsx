import { useState } from 'react';
import { Game } from '@/services/admin/gameService';
import { gameValidationSchemas, validateGameConfig } from '@/lib/admin/validation/gameSchemas';

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
    return <p>Unknown game type</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {Object.entries(schema).map(([field, rules]) => {
        const value = config[field];

        if ('type' in rules && rules.type === 'enum') {
          return (
            <div key={field}>
              <label className="block text-sm font-bold mb-2 font-mono">
                {field.replace(/_/g, ' ').toUpperCase()}
              </label>
              <select
                value={value}
                onChange={(e) => handleChange(field, e.target.value)}
                className="w-full px-4 py-2 bg-background border border-border rounded-xl font-mono text-sm"
              >
                {'values' in rules && rules.values.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {errors[field] && (
                <p className="text-destructive text-xs mt-1 font-mono">⚠ {errors[field]}</p>
              )}
            </div>
          );
        }

        if ('type' in rules && rules.type === 'color') {
          return (
            <div key={field}>
              <label className="block text-sm font-bold mb-2 font-mono">
                {field.replace(/_/g, ' ').toUpperCase()}
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="w-16 h-10 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleChange(field, e.target.value)}
                  className="flex-1 px-4 py-2 bg-background border border-border rounded-xl font-mono text-sm"
                  placeholder="#FFFFFF"
                />
              </div>
              {errors[field] && (
                <p className="text-destructive text-xs mt-1 font-mono">⚠ {errors[field]}</p>
              )}
            </div>
          );
        }

        return (
          <div key={field}>
            <label className="block text-sm font-bold mb-2 font-mono">
              {field.replace(/_/g, ' ').toUpperCase()}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleChange(field, parseInt(e.target.value))}
              min={'min' in rules ? rules.min : undefined}
              max={'max' in rules ? rules.max : undefined}
              step={'even' in rules && rules.even ? 2 : 1}
              className="w-full px-4 py-2 bg-background border border-border rounded-xl font-mono text-sm"
            />
            {'min' in rules && 'max' in rules && (
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                Range: {rules.min} - {rules.max}
              </p>
            )}
            {errors[field] && (
              <p className="text-destructive text-xs mt-1 font-mono">⚠ {errors[field]}</p>
            )}
          </div>
        );
      })}

      {errors._grid && (
        <p className="text-destructive text-sm font-mono">⚠ {errors._grid}</p>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 rounded-xl font-mono transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-mono transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};
