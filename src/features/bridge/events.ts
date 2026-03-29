import type { PromptPackage } from '../prompt/engine';
import type { CreatorSnapshot } from '../schema/contracts';

export interface BridgeGenerateDetail {
  prompt: string;
  negativePrompt: string;
  settings: {
    modelId: string;
    aspectRatio: string;
    styleIds: string[];
  };
  meta: {
    nonce: string;
    mode: CreatorSnapshot['mode'];
    signature: string;
    summaryLines: string[];
  };
}

export interface BridgeResultDetail {
  dataUrl: string;
  nonce: string;
  prompt?: string;
}

export interface BridgeStatusDetail {
  status?: string;
  detail?: string;
  connected?: boolean;
}

export interface BridgeErrorDetail {
  message?: string;
}

export function createBridgeNonce() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `bridge-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
}

export function buildBridgeGenerateDetail(
  snapshot: CreatorSnapshot,
  promptPackage: PromptPackage,
  nonce: string,
): BridgeGenerateDetail {
  return {
    prompt: promptPackage.positivePrompt,
    negativePrompt: promptPackage.negativePrompt,
    settings: {
      modelId: snapshot.promptConfig.modelId,
      aspectRatio: snapshot.promptConfig.aspectRatio,
      styleIds: [...snapshot.promptConfig.styleIds],
    },
    meta: {
      nonce,
      mode: snapshot.mode,
      signature: promptPackage.signature,
      summaryLines: [...promptPackage.summaryLines],
    },
  };
}

export function dispatchBridgeGenerate(detail: BridgeGenerateDetail) {
  if (typeof window === 'undefined') {
    return false;
  }

  window.dispatchEvent(new CustomEvent('xgen:generate', { detail }));
  return true;
}
