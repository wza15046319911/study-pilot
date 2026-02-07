"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  loadPyodideInstance,
  runTestCases,
  isPyodideLoaded,
  TestCasesConfig,
  TestResult,
} from "@/lib/pyodide";

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-slate-900 rounded-lg flex items-center justify-center">
      <Loader2 className="size-6 animate-spin text-slate-400" />
    </div>
  ),
});

export interface CodeRunnerProps {
  initialCode?: string;
  testCasesConfig: TestCasesConfig;
  onSubmit?: (code: string, results: TestResult[], allPassed: boolean) => void;
  readOnly?: boolean;
  className?: string;
}

export function CodeRunner({
  initialCode = "",
  testCasesConfig,
  onSubmit,
  readOnly = false,
  className = "",
}: CodeRunnerProps) {
  const [code, setCode] = useState(initialCode);
  const [isLoading, setIsLoading] = useState(false);
  const [isPyodideReady, setIsPyodideReady] = useState(isPyodideLoaded());
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>("");

  useEffect(() => {
    setCode(initialCode);
    setResults(null);
    setShowDetails(false);
  }, [initialCode]);

  // Preload Pyodide when component mounts
  useEffect(() => {
    if (!isPyodideLoaded()) {
      setLoadingStatus("Loading Python runtime...");
      loadPyodideInstance()
        .then(() => {
          setIsPyodideReady(true);
          setLoadingStatus("");
        })
        .catch((e) => {
          setLoadingStatus("Failed to load Python runtime");
          console.error("Failed to load Pyodide:", e);
        });
    }
  }, []);

  const handleRunTests = useCallback(async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    setResults(null);

    if (testCasesConfig.test_cases.length === 0) {
      const emptyResults: TestResult[] = [
        {
          passed: false,
          input: [],
          expected: null,
          error: "No test cases configured for this question.",
        },
      ];
      setResults(emptyResults);
      setShowDetails(true);
      if (onSubmit) {
        onSubmit(code, emptyResults, false);
      }
      setIsLoading(false);
      return;
    }

    try {
      const testResults = await runTestCases(code, testCasesConfig);
      setResults(testResults);

      const allPassed =
        testResults.length > 0 && testResults.every((r) => r.passed);

      if (onSubmit) {
        onSubmit(code, testResults, allPassed);
      }
    } catch (error: unknown) {
      setResults([
        {
          passed: false,
          input: [],
          expected: null,
          error:
            error instanceof Error ? error.message : "Failed to run tests",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [code, testCasesConfig, onSubmit]);

  const passedCount = results?.filter((r) => r.passed).length ?? 0;
  const totalCount = results?.length ?? testCasesConfig.test_cases.length;
  const allPassed =
    !!results && results.length > 0 && results.every((r) => r.passed);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Loading indicator for Pyodide */}
      {loadingStatus && !isPyodideReady && (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
          <Loader2 className="size-4 animate-spin" />
          {loadingStatus}
        </div>
      )}

      {/* Code Editor */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Python Code
          </span>
          <span className="text-xs text-slate-400">
            Implement:{" "}
            <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded">
              {testCasesConfig.function_name}()
            </code>
          </span>
        </div>
        <Editor
          height="280px"
          defaultLanguage="python"
          value={code}
          onChange={(value) => setCode(value || "")}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            readOnly,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>

      {/* Run Button & Results Summary */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleRunTests}
          disabled={
            isLoading ||
            !isPyodideReady ||
            !code.trim() ||
            testCasesConfig.test_cases.length === 0
          }
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="size-4" />
              Run Tests
            </>
          )}
        </Button>

        {testCasesConfig.test_cases.length === 0 && (
          <span className="text-sm text-amber-600 dark:text-amber-400">
            This question has no test cases configured.
          </span>
        )}

        {results && (
          <div
            className={`flex items-center gap-2 text-sm font-medium ${
              allPassed ? "text-green-600" : "text-red-500"
            }`}
          >
            {allPassed ? (
              <CheckCircle2 className="size-5" />
            ) : (
              <XCircle className="size-5" />
            )}
            <span>
              {passedCount}/{totalCount} tests passed
            </span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="ml-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
            >
              {showDetails ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Test Case Details */}
      {results && showDetails && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
          {results.map((result, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border text-sm ${
                result.passed
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              }`}
            >
              <div className="flex items-start gap-2">
                {result.passed ? (
                  <CheckCircle2 className="size-4 text-green-600 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="size-4 text-red-500 mt-0.5 shrink-0" />
                )}
                <div className="flex-1 min-w-0 font-mono text-xs space-y-1">
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span className="text-slate-500">
                      Input:{" "}
                      <span className="text-slate-800 dark:text-slate-200">
                        {JSON.stringify(result.input)}
                      </span>
                    </span>
                    <span className="text-slate-500">
                      Expected:{" "}
                      <span className="text-slate-800 dark:text-slate-200">
                        {JSON.stringify(result.expected)}
                      </span>
                    </span>
                    {!result.passed && result.actual !== undefined && (
                      <span className="text-red-600">
                        Got: {JSON.stringify(result.actual)}
                      </span>
                    )}
                  </div>
                  {result.error && (
                    <div className="flex items-start gap-1 text-red-600">
                      <AlertTriangle className="size-3 mt-0.5 shrink-0" />
                      <span>{result.error}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Test Cases Preview (before running) */}
      {!results && (
        <div className="text-sm text-slate-500">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            {showDetails ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
            {testCasesConfig.test_cases.length} test cases
          </button>

          {showDetails && (
            <div className="mt-2 space-y-1 pl-5 animate-in slide-in-from-top-2 duration-200">
              {testCasesConfig.test_cases.map((tc, idx) => (
                <div key={idx} className="font-mono text-xs text-slate-400">
                  {testCasesConfig.function_name}({tc.input.join(", ")}) →{" "}
                  {JSON.stringify(tc.expected)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
