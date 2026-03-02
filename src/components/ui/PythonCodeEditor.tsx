"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
} from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import {
  indentWithTab,
  history,
  defaultKeymap,
  historyKeymap,
} from "@codemirror/commands";
import {
  indentOnInput,
  bracketMatching,
  syntaxHighlighting,
  defaultHighlightStyle,
  indentUnit,
} from "@codemirror/language";
import { closeBrackets, autocompletion } from "@codemirror/autocomplete";
import { highlightSelectionMatches } from "@codemirror/search";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { Play, Loader2, CheckCircle2, XCircle, Terminal } from "lucide-react";

interface TestCase {
  input: unknown[];
  expected: unknown;
}

interface TestResult {
  input: unknown[];
  expected: unknown;
  actual: unknown;
  passed: boolean;
  error?: string;
}

interface PythonCodeEditorProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  testCases?: TestCase[];
  functionName?: string;
  onTestStatusChange?: (status: {
    hasRun: boolean;
    allPassed: boolean;
    passedCount: number;
    totalCount: number;
  }) => void;
}

declare global {
  interface Window {
    loadPyodide: (config?: { indexURL?: string }) => Promise<PyodideInterface>;
    pyodideInstance?: PyodideInterface;
    pyodideLoading?: Promise<PyodideInterface>;
  }
}

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  globals: { get: (key: string) => unknown };
}

async function getPyodide(): Promise<PyodideInterface> {
  if (window.pyodideInstance) return window.pyodideInstance;

  if (window.pyodideLoading) return window.pyodideLoading;

  window.pyodideLoading = new Promise<PyodideInterface>((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/pyodide.js";
    script.onload = async () => {
      try {
        const pyodide = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/",
        });
        window.pyodideInstance = pyodide;
        resolve(pyodide);
      } catch (e) {
        reject(e);
      }
    };
    script.onerror = () => reject(new Error("Failed to load Pyodide script"));
    document.head.appendChild(script);
  });

  return window.pyodideLoading;
}

export function PythonCodeEditor({
  value,
  onChange,
  disabled = false,
  testCases,
  functionName,
  onTestStatusChange,
}: PythonCodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const editableCompartmentRef = useRef<Compartment>(new Compartment());
  const [output, setOutput] = useState<string>("");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideStatus, setPyodideStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [activeTab, setActiveTab] = useState<"output" | "tests">("output");
  const hasTestCases = testCases && testCases.length > 0 && functionName;

  // Initialize CodeMirror
  useEffect(() => {
    if (!editorRef.current) return;

    const startState = EditorState.create({
      doc: value,
      extensions: [
        EditorState.tabSize.of(4),
        indentUnit.of("    "),
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
        python(),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
        editableCompartmentRef.current.of(EditorView.editable.of(!disabled)),
        EditorView.theme({
          "&": {
            fontSize: "13px",
            fontFamily:
              "'Maple Mono', 'JetBrains Mono', 'Fira Code', monospace",
            borderRadius: "0.5rem",
            overflow: "hidden",
          },
          ".cm-scroller": {
            minHeight: "200px",
            maxHeight: "400px",
            overflow: "auto",
          },
          ".cm-content": {
            padding: "12px 0",
          },
        }),
      ],
    });

    const view = new EditorView({
      state: startState,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync disabled state
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: editableCompartmentRef.current.reconfigure(
        EditorView.editable.of(!disabled),
      ),
    });
  }, [disabled]);

  // Sync value from outside (e.g. question change)
  useEffect(() => {
    if (!viewRef.current) return;
    const currentDoc = viewRef.current.state.doc.toString();
    if (currentDoc !== value) {
      viewRef.current.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
      });
    }
  }, [value]);

  const loadPyodideIfNeeded = useCallback(async () => {
    if (pyodideStatus === "ready") return window.pyodideInstance!;
    if (pyodideStatus === "loading") return getPyodide();

    setPyodideStatus("loading");
    try {
      const pyodide = await getPyodide();
      setPyodideStatus("ready");
      return pyodide;
    } catch {
      setPyodideStatus("error");
      throw new Error("Pyodide 加载失败，请检查网络连接");
    }
  }, [pyodideStatus]);

  const runCode = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput("");
    setTestResults([]);
    setActiveTab("output");

    try {
      const pyodide = await loadPyodideIfNeeded();

      // Capture stdout/stderr
      const captureCode = `
import sys
import io
_stdout_capture = io.StringIO()
_stderr_capture = io.StringIO()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
`;
      await pyodide.runPythonAsync(captureCode);

      const userCode = viewRef.current?.state.doc.toString() ?? value;

      // Run with timeout via Promise.race
      const runPromise = pyodide.runPythonAsync(userCode);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("执行超时（10秒）")), 10000),
      );

      await Promise.race([runPromise, timeoutPromise]);

      const getOutput = `
_out = _stdout_capture.getvalue()
_err = _stderr_capture.getvalue()
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
_out + ("\\n[stderr]\\n" + _err if _err else "")
`;
      const result = (await pyodide.runPythonAsync(getOutput)) as string;
      setOutput(result || "(无输出)");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setOutput(`错误：${msg}`);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, loadPyodideIfNeeded, value]);

  const runTests = useCallback(async () => {
    if (!hasTestCases || isRunning) return;
    setIsRunning(true);
    setOutput("");
    setTestResults([]);
    onTestStatusChange?.({
      hasRun: false,
      allPassed: false,
      passedCount: 0,
      totalCount: testCases?.length ?? 0,
    });
    setActiveTab("tests");

    try {
      const pyodide = await loadPyodideIfNeeded();
      const userCode = viewRef.current?.state.doc.toString() ?? value;

      const results: TestResult[] = [];

      for (const tc of testCases!) {
        const inputJson = JSON.stringify(tc.input);
        const expectedJson = JSON.stringify(tc.expected);

        const testCode = `
import sys, io, json, traceback

_out = io.StringIO()
sys.stdout = _out
sys.stderr = _out

_result = None
_error = None

try:
${userCode
  .split("\n")
  .map((l) => "    " + l)
  .join("\n")}
    _args = json.loads(${JSON.stringify(inputJson)})
    _result = ${functionName}(*_args)
except Exception as e:
    _error = traceback.format_exc()

sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__

json.dumps({"result": _result, "error": _error})
`;

        try {
          const raw = (await pyodide.runPythonAsync(testCode)) as string;
          const parsed = JSON.parse(raw) as {
            result: unknown;
            error: string | null;
          };

          const actual = parsed.result;
          const passed =
            !parsed.error &&
            JSON.stringify(actual) === JSON.stringify(tc.expected);

          results.push({
            input: tc.input,
            expected: tc.expected,
            actual: parsed.error ? undefined : actual,
            passed,
            error: parsed.error ?? undefined,
          });
        } catch (e: unknown) {
          results.push({
            input: tc.input,
            expected: tc.expected,
            actual: undefined,
            passed: false,
            error: e instanceof Error ? e.message : String(e),
          });
        }
      }

      setTestResults(results);
      const passedCount = results.filter((r) => r.passed).length;
      const allPassed = results.length > 0 && passedCount === results.length;
      onTestStatusChange?.({
        hasRun: true,
        allPassed,
        passedCount,
        totalCount: results.length,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setOutput(`错误：${msg}`);
      setActiveTab("output");
      onTestStatusChange?.({
        hasRun: false,
        allPassed: false,
        passedCount: 0,
        totalCount: testCases?.length ?? 0,
      });
    } finally {
      setIsRunning(false);
    }
  }, [
    hasTestCases,
    isRunning,
    loadPyodideIfNeeded,
    onTestStatusChange,
    value,
    testCases,
    functionName,
  ]);

  const passedCount = testResults.filter((r) => r.passed).length;
  const allPassed = testResults.length > 0 && passedCount === testResults.length;

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-[#282c34]">
      {/* Editor */}
      <div ref={editorRef} className="w-full" />

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#21252b] border-t border-gray-700">
        <button
          onClick={runCode}
          disabled={isRunning || disabled}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          {isRunning && activeTab === "output" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Play className="size-3.5" />
          )}
          运行
        </button>

        {hasTestCases && (
          <button
            onClick={runTests}
            disabled={isRunning || disabled}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {isRunning && activeTab === "tests" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="size-3.5" />
            )}
            测试用例
          </button>
        )}

        <div className="flex-1" />

        {pyodideStatus === "loading" && (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Loader2 className="size-3 animate-spin" />
            加载 Python 运行时...
          </span>
        )}
        {pyodideStatus === "error" && (
          <span className="text-xs text-red-400">运行时加载失败</span>
        )}
        {pyodideStatus === "ready" && (
          <span className="text-xs text-green-400">Python 就绪</span>
        )}
      </div>

      {/* Output / Test Results Panel */}
      {(output || testResults.length > 0 || isRunning) && (
        <div className="border-t border-gray-700">
          {/* Tab bar */}
          {hasTestCases && (output || testResults.length > 0) && (
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab("output")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors ${
                  activeTab === "output"
                    ? "text-white border-b-2 border-green-500"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Terminal className="size-3" />
                输出
              </button>
              <button
                onClick={() => setActiveTab("tests")}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors ${
                  activeTab === "tests"
                    ? "text-white border-b-2 border-blue-500"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <CheckCircle2 className="size-3" />
                测试结果
                {testResults.length > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded text-xs ${
                      allPassed
                        ? "bg-green-700 text-green-100"
                        : "bg-red-700 text-red-100"
                    }`}
                  >
                    {passedCount}/{testResults.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Output tab */}
          {activeTab === "output" && (
            <div className="p-3 max-h-[200px] overflow-y-auto">
              {isRunning && activeTab === "output" ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Loader2 className="size-4 animate-spin" />
                  运行中...
                </div>
              ) : (
                <pre className="text-sm text-gray-200 font-mono whitespace-pre-wrap break-words">
                  {output}
                </pre>
              )}
            </div>
          )}

          {/* Test results tab */}
          {activeTab === "tests" && (
            <div className="p-3 max-h-[300px] overflow-y-auto space-y-2">
              {isRunning && activeTab === "tests" ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Loader2 className="size-4 animate-spin" />
                  运行测试用例...
                </div>
              ) : (
                <>
                  {testResults.length > 0 && (
                    <div
                      className={`text-sm font-medium mb-2 ${allPassed ? "text-green-400" : "text-red-400"}`}
                    >
                      {allPassed
                        ? `全部通过 (${passedCount}/${testResults.length})`
                        : `${passedCount}/${testResults.length} 通过`}
                    </div>
                  )}
                  {testResults.map((result, idx) => (
                    <div
                      key={idx}
                      className={`rounded-lg p-3 text-xs font-mono ${
                        result.passed
                          ? "bg-green-900/30 border border-green-700/50"
                          : "bg-red-900/30 border border-red-700/50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        {result.passed ? (
                          <CheckCircle2 className="size-3.5 text-green-400 shrink-0" />
                        ) : (
                          <XCircle className="size-3.5 text-red-400 shrink-0" />
                        )}
                        <span
                          className={
                            result.passed ? "text-green-300" : "text-red-300"
                          }
                        >
                          Test #{idx + 1}
                        </span>
                      </div>
                      <div className="space-y-1 text-gray-300 pl-5">
                        <div>
                          <span className="text-gray-500">输入：</span>
                          {JSON.stringify(result.input)}
                        </div>
                        <div>
                          <span className="text-gray-500">期望：</span>
                          {JSON.stringify(result.expected)}
                        </div>
                        {!result.error && (
                          <div>
                            <span className="text-gray-500">实际：</span>
                            <span
                              className={
                                result.passed
                                  ? "text-green-300"
                                  : "text-red-300"
                              }
                            >
                              {JSON.stringify(result.actual)}
                            </span>
                          </div>
                        )}
                        {result.error && (
                          <div className="text-red-300 whitespace-pre-wrap">
                            <span className="text-gray-500">错误：</span>
                            {result.error}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
