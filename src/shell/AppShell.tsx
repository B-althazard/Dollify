import * as Dialog from '@radix-ui/react-dialog';
import { useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  type BridgeErrorDetail,
  type BridgeResultDetail,
  type BridgeStatusDetail,
  buildBridgeGenerateDetail,
  createBridgeNonce,
  dispatchBridgeGenerate,
} from '../features/bridge/events';
import {
  getCreatorStoreSnapshot,
  useCreatorStore,
} from '../features/creator/store';
import { useLibraryStore } from '../features/library/store';
import {
  buildPromptPackage,
  buildPromptSignature,
  type PromptPackage,
} from '../features/prompt/engine';
import { getVisibleFieldsForCategory } from '../features/rules/engine';
import { getCreatorSchema, getFieldById } from '../features/schema/registry';
import { BottomSheet } from '../features/ui/BottomSheet';
import { CategoryRail } from '../features/ui/CategoryRail';
import { PresetStrip } from '../features/ui/PresetStrip';
import { PromptConfigSheet } from '../features/ui/PromptConfigSheet';
import { PromptPackagePanel } from '../features/ui/PromptPackagePanel';
import { PromptStudioCard } from '../features/ui/PromptStudioCard';
import { RuleNotice } from '../features/ui/RuleNotice';
import { SchemaSection } from '../features/ui/SchemaSection';
import { StudioLibrarySheet } from '../features/ui/StudioLibrarySheet';
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
    applySnapshot,
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
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [promptConfigOpen, setPromptConfigOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const bridge = useLibraryStore((state) => state.bridge);
  const gallery = useLibraryStore((state) => state.gallery);
  const presets = useLibraryStore((state) => state.presets);
  const completeBridgeJob = useLibraryStore((state) => state.completeBridgeJob);
  const failLatestBridgeJob = useLibraryStore(
    (state) => state.failLatestBridgeJob,
  );
  const markBridgeConnected = useLibraryStore(
    (state) => state.markBridgeConnected,
  );
  const markBridgeProcessing = useLibraryStore(
    (state) => state.markBridgeProcessing,
  );
  const queueBridgeJob = useLibraryStore((state) => state.queueBridgeJob);
  const savePreset = useLibraryStore((state) => state.savePreset);
  const updateBridgeStatus = useLibraryStore(
    (state) => state.updateBridgeStatus,
  );

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

  const showToast = useCallback((nextToast: ToastState) => {
    setToast(nextToast);

    if (nextToast) {
      window.setTimeout(() => {
        setToast((currentToast) =>
          currentToast?.message === nextToast.message ? null : currentToast,
        );
      }, 1800);
    }
  }, []);

  useEffect(() => {
    const handleBridgeReady = () => {
      markBridgeConnected();
    };

    const handleBridgeHeartbeat = () => {
      markBridgeConnected();
    };

    const handleBridgeStatus = (event: Event) => {
      const detail = (event as CustomEvent<BridgeStatusDetail>).detail;
      updateBridgeStatus(detail?.status, detail?.detail, detail?.connected);

      if (detail?.status) {
        markBridgeProcessing(detail.status, detail.detail);
      }
    };

    const handleBridgeImage = (event: Event) => {
      const detail = (event as CustomEvent<BridgeResultDetail>).detail;

      if (!detail?.nonce || !detail.dataUrl) {
        return;
      }

      completeBridgeJob(detail.nonce, detail.dataUrl);
      showToast({
        tone: 'success',
        message: 'Venice render saved to gallery.',
      });
    };

    const handleBridgeError = (event: Event) => {
      const detail = (event as CustomEvent<BridgeErrorDetail>).detail;
      failLatestBridgeJob(
        detail?.message ?? 'Bridge reported an unknown error.',
      );
      showToast({
        tone: 'danger',
        message: detail?.message ?? 'Bridge reported an unknown error.',
      });
    };

    window.addEventListener('xgen:bridge-ready', handleBridgeReady);
    window.addEventListener('xgen:bridge-heartbeat', handleBridgeHeartbeat);
    window.addEventListener('xgen:status-update', handleBridgeStatus);
    window.addEventListener('xgen:image-received', handleBridgeImage);
    window.addEventListener('xgen:generation-error', handleBridgeError);

    return () => {
      window.removeEventListener('xgen:bridge-ready', handleBridgeReady);
      window.removeEventListener(
        'xgen:bridge-heartbeat',
        handleBridgeHeartbeat,
      );
      window.removeEventListener('xgen:status-update', handleBridgeStatus);
      window.removeEventListener('xgen:image-received', handleBridgeImage);
      window.removeEventListener('xgen:generation-error', handleBridgeError);
    };
  }, [
    completeBridgeJob,
    failLatestBridgeJob,
    markBridgeConnected,
    markBridgeProcessing,
    showToast,
    updateBridgeStatus,
  ]);

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

  const handleSavePreset = () => {
    const nextPackage =
      !promptPackage || packageIsStale ? generatePackage() : promptPackage;
    const snapshot = getCreatorStoreSnapshot(useCreatorStore.getState());
    const preset = savePreset(snapshot, nextPackage);

    showToast({
      tone: 'success',
      message: `${preset.name} saved to your vault.`,
    });
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = presets.find((entry) => entry.id === presetId);

    if (!preset) {
      return;
    }

    applySnapshot(preset.snapshot);
    setLibraryOpen(false);
    showToast({ tone: 'success', message: `${preset.name} restored.` });
  };

  const handleLoadGalleryEntry = (entryId: string) => {
    const entry = gallery.find((item) => item.id === entryId);

    if (!entry) {
      return;
    }

    applySnapshot(entry.snapshot);
    setLibraryOpen(false);
    showToast({ tone: 'success', message: 'Generation state restored.' });
  };

  const handleSendToBridge = () => {
    const nextPackage =
      !promptPackage || packageIsStale ? generatePackage() : promptPackage;
    const snapshot = getCreatorStoreSnapshot(useCreatorStore.getState());
    const nonce = createBridgeNonce();

    queueBridgeJob(snapshot, nextPackage, nonce);

    const wasDispatched = dispatchBridgeGenerate(
      buildBridgeGenerateDetail(snapshot, nextPackage, nonce),
    );

    showToast({
      tone: wasDispatched ? 'success' : 'danger',
      message: wasDispatched
        ? 'Prompt sent to the Venice bridge.'
        : 'Bridge dispatch failed in this environment.',
    });
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

        <PresetStrip
          presets={presets.slice(0, 6)}
          onLoadPreset={handleLoadPreset}
          onOpenLibrary={() => setLibraryOpen(true)}
        />

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
          bridgeConnected={bridge.connected}
          config={promptConfig}
          galleryCount={gallery.length}
          presetCount={presets.length}
          promptPackage={promptPackage}
          stale={Boolean(promptPackage) && packageIsStale}
          onOpenConfig={() => setPromptConfigOpen(true)}
          onOpenLibrary={() => setLibraryOpen(true)}
          onOpenPackage={() => setReviewOpen(true)}
          onCopy={() => {
            void handleCopyPackage('manual');
          }}
          onSavePreset={handleSavePreset}
          onSendToBridge={handleSendToBridge}
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

        <StudioLibrarySheet
          open={libraryOpen}
          presets={presets}
          gallery={gallery}
          bridge={bridge}
          onOpenChange={setLibraryOpen}
          onLoadPreset={handleLoadPreset}
          onLoadGalleryEntry={handleLoadGalleryEntry}
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
