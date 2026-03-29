import type { CreatorCategory } from '../schema/contracts';
import type { EvaluatedCreatorState } from '../rules/engine';

interface CategoryRailProps {
  categories: CreatorCategory[];
  activeCategoryId: string;
  derived: EvaluatedCreatorState;
  onSelect: (categoryId: string) => void;
}

const statusLabel: Record<string, string> = {
  complete: '✓',
  incomplete: '○',
  conflict: '!',
};

export function CategoryRail({
  categories,
  activeCategoryId,
  derived,
  onSelect,
}: CategoryRailProps) {
  return (
    <nav className="category-rail" aria-label="Creator categories">
      {categories.map((category) => {
        const state = derived.categoryStates[category.id];
        const isActive = activeCategoryId === category.id;

        return (
          <button
            key={category.id}
            type="button"
            className={`category-chip ${isActive ? 'is-active' : ''}`}
            onClick={() => onSelect(category.id)}
            aria-pressed={isActive}
          >
            <span>{category.label}</span>
            <span className={`category-chip__status is-${state.status}`}>{statusLabel[state.status]}</span>
          </button>
        );
      })}
    </nav>
  );
}
