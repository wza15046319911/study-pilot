/// <reference lib="webworker" />

const PYODIDE_INDEX_URL = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/";

interface TestCase {
  input: unknown[];
  expected: unknown;
}

interface TestCasesConfig {
  function_name: string;
  test_cases: TestCase[];
}

interface TestResult {
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

interface PyodideInterface {
  runPython: (code: string) => unknown;
}

interface WorkerScopeWithPyodide extends DedicatedWorkerGlobalScope {
  loadPyodide?: (config: { indexURL: string }) => Promise<PyodideInterface>;
}

const workerScope = self as unknown as WorkerScopeWithPyodide;
let pyodideInstance: PyodideInterface | null = null;
let pyodideLoading: Promise<PyodideInterface> | null = null;

function toErrorMessage(error: unknown): string {
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

function isWorkerRequest(value: unknown): value is WorkerRequest {
  if (typeof value !== "object" || value === null) return false;
  if (!("type" in value)) return false;
  return typeof (value as { type: unknown }).type === "string";
}

function postWorkerMessage(message: WorkerResponse) {
  workerScope.postMessage(message);
}

function sanitizeFunctionName(name: string): string {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) ? name : "solution";
}

function parseJsonOrRaw(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    return json;
  }
}

async function ensurePyodide(): Promise<PyodideInterface> {
  if (pyodideInstance) return pyodideInstance;

  if (!pyodideLoading) {
    pyodideLoading = (async () => {
      importScripts(`${PYODIDE_INDEX_URL}pyodide.js`);
      if (typeof workerScope.loadPyodide !== "function") {
        throw new Error("Pyodide loader is unavailable in worker");
      }
      pyodideInstance = await workerScope.loadPyodide({
        indexURL: PYODIDE_INDEX_URL,
      });
      return pyodideInstance;
    })();
  }

  return pyodideLoading;
}

function runPythonCodeInternal(
  pyodide: PyodideInterface,
  code: string,
): { output: string; error?: string } {
  try {
    pyodide.runPython(`
import sys
from io import StringIO
_stdout_capture = StringIO()
_stderr_capture = StringIO()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
`);

    try {
      pyodide.runPython(code);
    } catch (error: unknown) {
      const stderr = String(pyodide.runPython("_stderr_capture.getvalue()") || "");
      pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
`);
      return {
        output: "",
        error: toErrorMessage(error) || stderr || "Runtime error",
      };
    }

    const stdout = String(pyodide.runPython("_stdout_capture.getvalue()") || "");
    pyodide.runPython(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
`);
    return { output: stdout };
  } catch (error: unknown) {
    return { output: "", error: toErrorMessage(error) };
  }
}

function runTestCasesInternal(
  pyodide: PyodideInterface,
  userCode: string,
  config: TestCasesConfig,
): TestResult[] {
  if (config.test_cases.length === 0) return [];

  const functionName = sanitizeFunctionName(config.function_name);

  try {
    const userCodeLiteral = JSON.stringify(userCode);
    pyodide.runPython(`
_user_ns = {}
exec(${userCodeLiteral}, _user_ns)
`);
  } catch (error: unknown) {
    return config.test_cases.map((testCase) => ({
      passed: false,
      input: testCase.input,
      expected: testCase.expected,
      error: `Code Error: ${toErrorMessage(error)}`,
    }));
  }

  try {
    pyodide.runPython(`
if '${functionName}' not in _user_ns:
    raise NameError("Function '${functionName}' is not defined")
`);
  } catch (error: unknown) {
    return config.test_cases.map((testCase) => ({
      passed: false,
      input: testCase.input,
      expected: testCase.expected,
      error: toErrorMessage(error),
    }));
  }

  const results: TestResult[] = [];

  for (const testCase of config.test_cases) {
    try {
      const inputJsonLiteral = JSON.stringify(JSON.stringify(testCase.input));
      const expectedJsonLiteral = JSON.stringify(
        JSON.stringify(testCase.expected),
      );

      pyodide.runPython(`
import json
_test_input = json.loads(${inputJsonLiteral})
_test_expected = json.loads(${expectedJsonLiteral})
_test_result = _user_ns['${functionName}'](*_test_input)
_test_passed = _test_result == _test_expected
try:
    _test_actual_json = json.dumps(_test_result)
except TypeError:
    _test_actual_json = json.dumps(repr(_test_result))
`);

      const passed = Boolean(pyodide.runPython("_test_passed"));
      const actualJson = String(pyodide.runPython("_test_actual_json"));
      results.push({
        passed,
        input: testCase.input,
        expected: testCase.expected,
        actual: parseJsonOrRaw(actualJson),
      });
    } catch (error: unknown) {
      results.push({
        passed: false,
        input: testCase.input,
        expected: testCase.expected,
        error: toErrorMessage(error),
      });
    }
  }

  return results;
}

workerScope.addEventListener("message", async (event: MessageEvent<unknown>) => {
  const payload = event.data;
  if (!isWorkerRequest(payload)) return;

  if (payload.type === "init") {
    try {
      await ensurePyodide();
      postWorkerMessage({ type: "ready" });
    } catch (error: unknown) {
      postWorkerMessage({
        type: "init-error",
        error: toErrorMessage(error),
      });
    }
    return;
  }

  try {
    const pyodide = await ensurePyodide();

    if (payload.type === "run-code") {
      const result = runPythonCodeInternal(pyodide, payload.code);
      postWorkerMessage({
        type: "run-code-result",
        id: payload.id,
        output: result.output,
        error: result.error,
      });
      return;
    }

    if (payload.type === "run-tests") {
      const results = runTestCasesInternal(pyodide, payload.userCode, payload.config);
      postWorkerMessage({
        type: "run-tests-result",
        id: payload.id,
        results,
      });
    }
  } catch (error: unknown) {
    postWorkerMessage({
      type: "request-error",
      id: payload.id,
      error: toErrorMessage(error),
    });
  }
});

export {};
