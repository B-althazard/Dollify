import { getFieldById, getCreatorSchema } from '../features/schema/registry';
import { getVisibleFieldsForCategory } from '../features/rules/engine';
import { useCreatorStore } from '../features/creator/store';
import { BottomSheet } from '../features/ui/BottomSheet';
import { CategoryRail } from '../features/ui/CategoryRail';
import { RuleNotice } from '../features/ui/RuleNotice';
import { SchemaSection } from '../features/ui/SchemaSection';

const schema = getCreatorSchema();

export function AppShell() {
  const {
    activeCategoryId,
    detailSheetFieldId,
    derived,
    formValues,
    mode,
    openDetailSheet,
    resetCreator,
    setActiveCategory,
    setFieldValue,
    setMode,
  } = useCreatorStore();

  const activeCategory = schema.categories.find((category) => category.id === activeCategoryId) ?? schema.categories[0];
  const visibleFields = getVisibleFieldsForCategory(schema, derived, activeCategory.id);
  const sheetField = detailSheetFieldId ? getFieldById(detailSheetFieldId) : undefined;

  return (
    <main className="app-frame">
      <div className="app-shell">
        <header className="top-status-card">
          <div>
            <p className="eyebrow">Schema-driven creator</p>
            <h1>Dollify</h1>
          </div>
          <div className="status-cluster">
            <div className="mode-switch" role="group" aria-label="Creator mode">
              <button
                type="button"
                className={`mode-pill ${mode === 'female' ? 'is-active' : ''}`}
                onClick={() => setMode('female')}
              >
                Female
              </button>
              <button
                type="button"
                className={`mode-pill ${mode === 'futa' ? 'is-active' : ''}`}
                onClick={() => setMode('futa')}
              >
                Futa-Female
              </button>
            </div>
            <span className={`validity-pill ${derived.isValid ? 'is-valid' : 'is-conflict'}`}>
              {derived.isValid ? 'Valid creator state' : 'Resolve required selections'}
            </span>
          </div>
        </header>

        <CategoryRail
          categories={schema.categories}
          activeCategoryId={activeCategory.id}
          derived={derived}
          onSelect={setActiveCategory}
        />

        <section className="creator-placeholder card-surface">
          <p className="section-label">Creator shell</p>
          <h2>{activeCategory.label}</h2>
          <p>{activeCategory.description}</p>
        </section>

        {derived.notices.length > 0 ? <RuleNotice>{derived.notices[0]}</RuleNotice> : null}

        <SchemaSection
          category={activeCategory}
          fields={visibleFields}
          derived={derived}
          formValues={formValues}
          onChangeField={setFieldValue}
          onOpenSheet={(fieldId) => openDetailSheet(fieldId)}
        />

        <section className="placeholder-grid">
          <article className="card-surface">
            <p className="section-label">Status area</p>
            <p>{derived.categoryStates[activeCategory.id].visibleFieldIds.length} fields are active in this category.</p>
          </article>
          <article className="card-surface">
            <p className="section-label">Rule state</p>
            <p>{derived.isValid ? 'All visible required selections are satisfied.' : 'Some visible fields still need a selection.'}</p>
          </article>
        </section>

        <footer className="bottom-action-bar">
          <button type="button" className="ghost-button" disabled>
            Randomize
          </button>
          <button type="button" className="secondary-button" onClick={resetCreator}>
            Reset
          </button>
          <button type="button" className="primary-button" disabled={!derived.isValid}>
            Review
          </button>
        </footer>

        <BottomSheet
          field={sheetField}
          state={sheetField ? derived.fieldStates[sheetField.id] : undefined}
          values={sheetField ? formValues[sheetField.id] ?? [] : []}
          open={Boolean(sheetField)}
          onOpenChange={(open) => openDetailSheet(open ? detailSheetFieldId : null)}
          onChange={(values) => {
            if (sheetField) {
              setFieldValue(sheetField.id, values);
            }
          }}
        />
      </div>
    </main>
  );
}
