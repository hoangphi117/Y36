export const gameValidationSchemas = {
  caro: {
    rows: { min: 10, max: 20, type: 'integer' as const },
    cols: { min: 10, max: 20, type: 'integer' as const },
    win_condition: { min: 5, max: 5, type: 'integer' as const },
    time_limit: { min: 60, max: 1800, type: 'integer' as const },
    turn_time: { min: 10, max: 60, type: 'integer' as const },
  },
  'caro-4': {
    rows: { min: 8, max: 15, type: 'integer' as const },
    cols: { min: 8, max: 15, type: 'integer' as const },
    win_condition: { min: 4, max: 4, type: 'integer' as const },
    time_limit: { min: 60, max: 1200, type: 'integer' as const },
    turn_time: { min: 10, max: 45, type: 'integer' as const },
  },
  snake: {
    rows: { min: 15, max: 30, type: 'integer' as const },
    cols: { min: 15, max: 30, type: 'integer' as const },
    initial_speed: { min: 100, max: 300, type: 'integer' as const },
    speed_increment: { min: 5, max: 20, type: 'integer' as const },
  },
  'tic-tac-toe': {
    rows: { min: 3, max: 3, type: 'integer' as const },
    cols: { min: 3, max: 3, type: 'integer' as const },
    win_condition: { min: 3, max: 3, type: 'integer' as const },
    time_limit: { min: 30, max: 120, type: 'integer' as const },
    turn_time: { min: 5, max: 30, type: 'integer' as const },
  },
  match3: {
    rows: { min: 6, max: 10, type: 'integer' as const },
    cols: { min: 6, max: 10, type: 'integer' as const },
    candy_types: { min: 3, max: 7, type: 'integer' as const },
    target_score: { min: 500, max: 5000, type: 'integer' as const },
    moves_limit: { min: 10, max: 50, type: 'integer' as const },
    time_limit: { min: 0, max: 600, type: 'integer' as const },
  },
  memory: {
    rows: { min: 2, max: 6, type: 'integer' as const, even: true },
    cols: { min: 2, max: 6, type: 'integer' as const, even: true },
    theme: { type: 'enum' as const, values: ['animals', 'fruits', 'icons'] },
    time_limit: { min: 60, max: 600, type: 'integer' as const },
  },
  drawing: {
    canvas_width: { min: 400, max: 1920, type: 'integer' as const },
    canvas_height: { min: 300, max: 1080, type: 'integer' as const },
    background_color: { type: 'color' as const, pattern: /^#[0-9A-Fa-f]{6}$/ },
  },
};

export function validateGameConfig(gameCode: string, config: Record<string, any>) {
  const schema = gameValidationSchemas[gameCode as keyof typeof gameValidationSchemas];
  if (!schema) {
    return { valid: false, errors: { _general: 'Unknown game type' } };
  }

  const errors: Record<string, string> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = config[field];

    if (value === undefined || value === null) {
      errors[field] = `${field} is required`;
      continue;
    }

    if ('type' in rules && rules.type === 'integer' && !Number.isInteger(value)) {
      errors[field] = `${field} must be an integer`;
      continue;
    }

    if ('min' in rules && value < rules.min) {
      errors[field] = `${field} must be at least ${rules.min}`;
      continue;
    }

    if ('max' in rules && value > rules.max) {
      errors[field] = `${field} must be at most ${rules.max}`;
      continue;
    }

    if ('even' in rules && rules.even && value % 2 !== 0) {
      errors[field] = `${field} must be an even number`;
      continue;
    }

    if ('type' in rules && rules.type === 'enum' && 'values' in rules && !rules.values.includes(value)) {
      errors[field] = `${field} must be one of: ${rules.values.join(', ')}`;
      continue;
    }

    if ('pattern' in rules && rules.pattern && !rules.pattern.test(value)) {
      errors[field] = `${field} has invalid format`;
      continue;
    }
  }

  // Special validation for Memory game
  if (gameCode === 'memory') {
    const total = config.rows * config.cols;
    if (total % 2 !== 0) {
      errors._grid = 'Total cards (rows × cols) must be an even number';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
