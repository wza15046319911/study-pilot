"use client";

/**
 * Pyodide utilities executed in a dedicated Web Worker.
 * This prevents untrusted user code (including infinite loops) from blocking the UI thread.
 */

export interface TestCase {
  input: unknown[];
  expected: unknown;
}

export interface TestCasesConfig {
  function_name: string;
  test_cases: TestCase[];
}

export interface TestResult {
  passed: boolean;
  input: unknown[];
  expected: unknown;
  actual?: unknown;
  error?: string;
}

type WorkerRequest =
  | { type: "init" }
  | { type: "run-code"; id: string; code: string }
  | {
      type: "run-tests";
      id: string;
      userCode: string;
      config: TestCasesConfig;
    };

type WorkerResponse =
  | { type: "ready" }
  | { type: "init-error"; error: string }
  | { type: "run-code-result"; id: string; output: string; error?: string }
  | { type: "run-tests-result"; id: string; results: TestResult[] }
  | { type: "request-error"; id: string; error: string };

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  timeoutId: number;
}

const DEFAULT_TIMEOUT_MS = 5000;

let workerInstance: Worker | null = null;
let workerReady = false;
let workerReadyPromise: Promise<void> | null = null;
let resolveWorkerReady: (() => void) | null = null;
let rejectWorkerReady: ((reason?: unknown) => void) | null = null;
let requestCounter = 0;
const pendingRequests = new Map<string, PendingRequest>();

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "Unknown error";
}

function isWorkerResponse(value: unknown): value is WorkerResponse {
  if (typeof value !== "object" || value === null) return false;
  if (!("type" in value)) return false;
  return typeof (value as { type: unknown }).type === "string";
}

function resetReadyPromise() {
  workerReadyPromise = new Promise<void>((resolve, reject) => {
    resolveWorkerReady = resolve;
    rejectWorkerReady = reject;
  });
}

function terminateWorker(reason: Error) {
  if (workerInstance) {
    workerInstance.terminate();
  }
  workerInstance = null;
  workerReady = false;

  if (rejectWorkerReady) {
    rejectWorkerReady(reason);
  }
  workerReadyPromise = null;
  resolveWorkerReady = null;
  rejectWorkerReady = null;

  pendingRequests.forEach(({ reject, timeoutId }) => {
    clearTimeout(timeoutId);
    reject(reason);
  });
  pendingRequests.clear();
}

function handleWorkerMessage(event: MessageEvent<unknown>) {
  const data = event.data;
  if (!isWorkerResponse(data)) return;

  if (data.type === "ready") {
    workerReady = true;
    if (resolveWorkerReady) {
      resolveWorkerReady();
      resolveWorkerReady = null;
      rejectWorkerReady = null;
    }
    return;
  }

  if (data.type === "init-error") {
    terminateWorker(new Error(data.error));
    return;
  }

  if (!("id" in data)) return;
  const pending = pendingRequests.get(data.id);
  if (!pending) return;

  clearTimeout(pending.timeoutId);
  pendingRequests.delete(data.id);

  if (data.type === "request-error") {
    pending.reject(new Error(data.error));
    return;
  }

  if (data.type === "run-code-result") {
    pending.resolve({ output: data.output, error: data.error });
    return;
  }

  if (data.type === "run-tests-result") {
    pending.resolve(data.results);
  }
}

async function ensureWorker(): Promise<Worker> {
  if (workerInstance && workerReady) return workerInstance;

  if (!workerInstance) {
    workerInstance = new Worker(new URL("../workers/pyodideWorker.ts", import.meta.url), {
      type: "module",
    });
    resetReadyPromise();

    workerInstance.onmessage = handleWorkerMessage;
    workerInstance.onerror = (event) => {
      terminateWorker(new Error(event.message || "Pyodide worker crashed"));
    };

    const initMessage: WorkerRequest = { type: "init" };
    workerInstance.postMessage(initMessage);
  }

  if (!workerReadyPromise) {
    resetReadyPromise();
  }

  await workerReadyPromise;
  if (!workerInstance) {
    throw new Error("Pyodide worker is unavailable");
  }
  return workerInstance;
}

async function requestWorkerResponse<T>(
  message:
    | Omit<Extract<WorkerRequest, { type: "run-code" }>, "id">
    | Omit<Extract<WorkerRequest, { type: "run-tests" }>, "id">,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const worker = await ensureWorker();
  const id = `py-${++requestCounter}`;

  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      pendingRequests.delete(id);
      const timeoutError = new Error(`Execution timed out after ${timeoutMs}ms`);
      reject(timeoutError);
      terminateWorker(timeoutError);
    }, timeoutMs);

    pendingRequests.set(id, {
      resolve: (value: unknown) => resolve(value as T),
      reject,
      timeoutId,
    });

    const payload: WorkerRequest =
      message.type === "run-code"
        ? { ...message, id }
        : { ...message, id };
    worker.postMessage(payload);
  });
}

/**
 * Initialize the Pyodide worker runtime.
 */
export async function loadPyodideInstance(): Promise<void> {
  await ensureWorker();
}

/**
 * Run arbitrary Python code and capture stdout/stderr.
 */
export async function runPythonCode(
  code: string,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<{ output: string; error?: string }> {
  try {
    return await requestWorkerResponse<{ output: string; error?: string }>(
      { type: "run-code", code },
      timeoutMs,
    );
  } catch (error: unknown) {
    return {
      output: "",
      error: getErrorMessage(error),
    };
  }
}

/**
 * Run coding challenge test cases with hard timeout protection.
 */
export async function runTestCases(
  userCode: string,
  config: TestCasesConfig,
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<TestResult[]> {
  return requestWorkerResponse<TestResult[]>(
    { type: "run-tests", userCode, config },
    timeoutMs,
  );
}

export function isPyodideLoaded(): boolean {
  return workerReady;
}

export function preloadPyodide(): void {
  loadPyodideInstance().catch(() => {
    // Ignore preload failures.
  });
}
