import * as Dialog from '@radix-ui/react-dialog';
import { useReducedMotion } from 'motion/react';
import { useMemo, useState } from 'react';
import { useCreatorStore } from '../features/creator/store';
import {
  buildPromptPackage,
  buildPromptSignature,
  type PromptPackage,
} from '../features/prompt/engine';
import { getVisibleFieldsForCategory } from '../features/rules/engine';
import { getCreatorSchema, getFieldById } from '../features/schema/registry';
import { BottomSheet } from '../features/ui/BottomSheet';
import { CategoryRail } from '../features/ui/CategoryRail';
import { PromptConfigSheet } from '../features/ui/PromptConfigSheet';
import { PromptPackagePanel } from '../features/ui/PromptPackagePanel';
import { PromptStudioCard } from '../features/ui/PromptStudioCard';
import { RuleNotice } from '../features/ui/RuleNotice';
import { SchemaSection } from '../features/ui/SchemaSection';
import { useSwipeNavigation } from '../features/ui/useSwipeNavigation';

const schema = getCreatorSchema();

type ToastState = { tone: 'success' | 'danger'; message: string } | null;

async function copyText(text: string) {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    throw new Error('Clipboard unavailable');
  }

  await navigator.clipboard.writeText(text);
}

export function AppShell() {
  const reducedMotion = useReducedMotion();
  const {
    activeCategoryId,
    detailSheetFieldId,
    derived,
    fieldLocks,
    formValues,
    mode,
    openDetailSheet,
    promptConfig,
    randomizeCreator,
    resetCreator,
    setActiveCategory,
    setFieldValue,
    setMode,
    setPromptConfig,
    toggleFieldLock,
  } = useCreatorStore();
  const [promptPackage, setPromptPackage] = useState<PromptPackage | null>(
    null,
  );
  const [promptConfigOpen, setPromptConfigOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const activeCategory =
    schema.categories.find((category) => category.id === activeCategoryId) ??
    schema.categories[0];
  const visibleFields = getVisibleFieldsForCategory(
    schema,
    derived,
    activeCategory.id,
  );
  const sheetField = detailSheetFieldId
    ? getFieldById(detailSheetFieldId)
    : undefined;
  const currentSignature = useMemo(
    () => buildPromptSignature(derived, promptConfig),
    [derived, promptConfig],
  );
  const packageIsStale = promptPackage?.signature !== currentSignature;
  const swipeHandlers = useSwipeNavigation({
    itemIds: schema.categories.map((category) => category.id),
    activeId: activeCategory.id,
    onNavigate: setActiveCategory,
  });

  const showToast = (nextToast: ToastState) => {
    setToast(nextToast);

    if (nextToast) {
      window.setTimeout(() => {
        setToast((currentToast) =>
          currentToast?.message === nextToast.message ? null : currentToast,
        );
      }, 1800);
    }
  };

  const generatePackage = () => {
    const nextPackage = buildPromptPackage(schema, derived, promptConfig);
    setPromptPackage(nextPackage);
    return nextPackage;
  };

  const handleCopyPackage = async (
    source: 'manual' | 'auto',
    nextPackage = promptPackage,
  ) => {
    if (!nextPackage) {
      return;
    }

    try {
      await copyText(nextPackage.positivePrompt);
      showToast({
        tone: 'success',
        message:
          source === 'auto'
            ? 'Fresh positive prompt copied automatically.'
            : 'Positive prompt copied.',
      });
    } catch {
      showToast({
        tone: 'danger',
        message: 'Clipboard failed. Prompt stays visible for manual copy.',
      });
    }
  };

  const handleGeneratePackage = async () => {
    const nextPackage = generatePackage();
    setReviewOpen(true);
    await handleCopyPackage('auto', nextPackage);
  };

  const handleRandomize = async () => {
    randomizeCreator();
    const nextState = useCreatorStore.getState();
    const nextPackage = buildPromptPackage(
      schema,
      nextState.derived,
      nextState.promptConfig,
    );

    setPromptPackage(nextPackage);
    await handleCopyPackage('auto', nextPackage);
  };

  return (
    <main className="app-frame">
      <div className="app-shell">
        <header className="top-status-card">
          <div>
            <p className="eyebrow">Schema-driven creator</p>
            <h1>Dollify</h1>
          </div>
          <div className="status-cluster">
            <fieldset className="mode-switch">
              <legend className="sr-only">Creator mode</legend>
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
            </fieldset>
            <span
              className={`validity-pill ${derived.isValid ? 'is-valid' : 'is-conflict'}`}
            >
              {derived.isValid
                ? 'Valid creator state'
                : 'Resolve required selections'}
            </span>
          </div>
        </header>

        <CategoryRail
          categories={schema.categories}
          activeCategoryId={activeCategory.id}
          derived={derived}
          onSelect={setActiveCategory}
        />

        {toast ? (
          <RuleNotice tone={toast.tone}>{toast.message}</RuleNotice>
        ) : null}

        {derived.notices.length > 0 ? (
          <RuleNotice>{derived.notices[0]}</RuleNotice>
        ) : null}

        <SchemaSection
          category={activeCategory}
          fields={visibleFields}
          derived={derived}
          fieldLocks={fieldLocks}
          formValues={formValues}
          onChangeField={setFieldValue}
          onToggleFieldLock={toggleFieldLock}
          onOpenSheet={(fieldId) => openDetailSheet(fieldId)}
          reducedMotion={Boolean(reducedMotion)}
          swipeHandlers={swipeHandlers}
        />

        <PromptStudioCard
          config={promptConfig}
          promptPackage={promptPackage}
          stale={Boolean(promptPackage) && packageIsStale}
          onOpenConfig={() => setPromptConfigOpen(true)}
          onOpenPackage={() => setReviewOpen(true)}
          onCopy={() => {
            void handleCopyPackage('manual');
          }}
        />

        <footer className="bottom-action-bar">
          <button
            type="button"
            className="ghost-button"
            disabled={!derived.isValid}
            onClick={() => {
              void handleRandomize();
            }}
          >
            Randomize
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={resetCreator}
          >
            Reset
          </button>
          <button
            type="button"
            className="primary-button"
            disabled={!derived.isValid}
            onClick={() => {
              void handleGeneratePackage();
            }}
          >
            Generate package
          </button>
        </footer>

        <BottomSheet
          field={sheetField}
          state={sheetField ? derived.fieldStates[sheetField.id] : undefined}
          values={sheetField ? (formValues[sheetField.id] ?? []) : []}
          locked={sheetField ? Boolean(fieldLocks[sheetField.id]) : false}
          open={Boolean(sheetField)}
          onOpenChange={(open) =>
            openDetailSheet(open ? detailSheetFieldId : null)
          }
          onChange={(values) => {
            if (sheetField) {
              setFieldValue(sheetField.id, values);
            }
          }}
        />

        <PromptConfigSheet
          open={promptConfigOpen}
          config={promptConfig}
          onOpenChange={setPromptConfigOpen}
          onChange={setPromptConfig}
        />

        <Dialog.Root open={reviewOpen} onOpenChange={setReviewOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="sheet-overlay" />
            <Dialog.Content
              className="bottom-sheet"
              aria-describedby={undefined}
            >
              <div className="sheet-handle" />
              <div className="sheet-header">
                <div>
                  <Dialog.Title>Prompt package</Dialog.Title>
                  <p id="prompt-review-description">
                    Review the latest positive, negative, and generation
                    guidance.
                  </p>
                </div>
                <Dialog.Close className="sheet-close">Close</Dialog.Close>
              </div>

              {promptPackage ? (
                <PromptPackagePanel
                  promptPackage={promptPackage}
                  onCopyPositive={() => {
                    void handleCopyPackage('manual');
                  }}
                />
              ) : (
                <RuleNotice>
                  Generate a package first to review prompt output.
                </RuleNotice>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </main>
  );
}
