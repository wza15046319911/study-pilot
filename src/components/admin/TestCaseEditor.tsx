"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import {
  Plus,
  Trash2,
  Code2,
  Copy,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

interface TestCase {
  input: unknown[];
  expected: unknown;
}

export interface TestCasesConfig {
  function_name: string;
  test_cases: TestCase[];
}

interface TestCaseEditorProps {
  value: TestCasesConfig;
  onChange: (config: TestCasesConfig) => void;
  disabled?: boolean;
}

export function TestCaseEditor({
  value,
  onChange,
  disabled = false,
}: TestCaseEditorProps) {
  const [inputErrors, setInputErrors] = useState<Record<number, string>>({});
  const [expectedErrors, setExpectedErrors] = useState<Record<number, string>>(
    {},
  );
  const [inputDrafts, setInputDrafts] = useState<Record<number, string>>({});
  const [expectedDrafts, setExpectedDrafts] = useState<Record<number, string>>(
    {},
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputDrafts((prev) => {
      const next = { ...prev };
      value.test_cases.forEach((tc, idx) => {
        if (!(idx in next)) {
          next[idx] = JSON.stringify(tc.input);
        }
      });
      Object.keys(next).forEach((key) => {
        if (parseInt(key, 10) >= value.test_cases.length) delete next[+key];
      });
      return next;
    });

    setExpectedDrafts((prev) => {
      const next = { ...prev };
      value.test_cases.forEach((tc, idx) => {
        if (!(idx in next)) {
          next[idx] = JSON.stringify(tc.expected);
        }
      });
      Object.keys(next).forEach((key) => {
        if (parseInt(key, 10) >= value.test_cases.length) delete next[+key];
      });
      return next;
    });
  }, [value.test_cases]);

  const remapByMove = <T extends Record<number, string>>(
    source: T,
    from: number,
    to: number,
  ) => {
    const next: Record<number, string> = {};
    Object.entries(source).forEach(([key, value]) => {
      const idx = parseInt(key, 10);
      if (idx === from) {
        next[to] = value;
      } else if (idx === to) {
        next[from] = value;
      } else {
        next[idx] = value;
      }
    });
    return next as T;
  };

  const remapByDelete = <T extends Record<number, string>>(
    source: T,
    removeIndex: number,
  ) => {
    const next: Record<number, string> = {};
    Object.entries(source).forEach(([key, val]) => {
      const idx = parseInt(key, 10);
      if (idx < removeIndex) next[idx] = val;
      if (idx > removeIndex) next[idx - 1] = val;
    });
    return next as T;
  };

  const remapByInsert = <T extends Record<number, string>>(
    source: T,
    insertIndex: number,
  ) => {
    const next: Record<number, string> = {};
    Object.entries(source).forEach(([key, value]) => {
      const idx = parseInt(key, 10);
      if (idx >= insertIndex) {
        next[idx + 1] = value;
      } else {
        next[idx] = value;
      }
    });
    return next as T;
  };

  const handleFunctionNameChange = (name: string) => {
    onChange({
      ...value,
      function_name: name,
    });
  };

  const addTestCase = () => {
    const nextIndex = value.test_cases.length;
    onChange({
      ...value,
      test_cases: [...value.test_cases, { input: [], expected: null }],
    });
    setInputDrafts((prev) => ({ ...prev, [nextIndex]: "[]" }));
    setExpectedDrafts((prev) => ({ ...prev, [nextIndex]: "null" }));
  };

  const removeTestCase = (index: number) => {
    const newCases = [...value.test_cases];
    newCases.splice(index, 1);
    onChange({
      ...value,
      test_cases: newCases,
    });

    // Clear errors for removed index
    setInputErrors(remapByDelete(inputErrors, index));
    setExpectedErrors(remapByDelete(expectedErrors, index));
    setInputDrafts(remapByDelete(inputDrafts, index));
    setExpectedDrafts(remapByDelete(expectedDrafts, index));
  };

  const duplicateTestCase = (index: number) => {
    const source = value.test_cases[index];
    const copied = {
      input: JSON.parse(JSON.stringify(source.input)),
      expected: JSON.parse(JSON.stringify(source.expected)),
    };
    const newCases = [...value.test_cases];
    newCases.splice(index + 1, 0, copied);
    onChange({ ...value, test_cases: newCases });

    const nextInput = JSON.stringify(copied.input);
    const nextExpected = JSON.stringify(copied.expected);
    setInputErrors((prev) => remapByInsert(prev, index + 1));
    setExpectedErrors((prev) => remapByInsert(prev, index + 1));
    setInputDrafts((prev) => ({
      ...remapByInsert(prev, index + 1),
      [index + 1]: nextInput,
    }));
    setExpectedDrafts((prev) => ({
      ...remapByInsert(prev, index + 1),
      [index + 1]: nextExpected,
    }));
  };

  const moveTestCase = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= value.test_cases.length) return;

    const newCases = [...value.test_cases];
    [newCases[index], newCases[newIndex]] = [newCases[newIndex], newCases[index]];
    onChange({ ...value, test_cases: newCases });

    setInputErrors(remapByMove(inputErrors, index, newIndex));
    setExpectedErrors(remapByMove(expectedErrors, index, newIndex));
    setInputDrafts(remapByMove(inputDrafts, index, newIndex));
    setExpectedDrafts(remapByMove(expectedDrafts, index, newIndex));
  };

  const updateTestCaseInput = (index: number, inputStr: string) => {
    setInputDrafts((prev) => ({ ...prev, [index]: inputStr }));
    try {
      const parsed = JSON.parse(inputStr);
      if (!Array.isArray(parsed)) {
        setInputErrors({ ...inputErrors, [index]: "Must be an array" });
        return;
      }

      const newCases = [...value.test_cases];
      newCases[index] = { ...newCases[index], input: parsed };
      onChange({ ...value, test_cases: newCases });

      // Clear error
      const newErrors = { ...inputErrors };
      delete newErrors[index];
      setInputErrors(newErrors);
    } catch {
      setInputErrors({ ...inputErrors, [index]: "Invalid JSON" });
    }
  };

  const updateTestCaseExpected = (index: number, expectedStr: string) => {
    setExpectedDrafts((prev) => ({ ...prev, [index]: expectedStr }));
    try {
      const parsed = JSON.parse(expectedStr);

      const newCases = [...value.test_cases];
      newCases[index] = { ...newCases[index], expected: parsed };
      onChange({ ...value, test_cases: newCases });

      // Clear error
      const newErrors = { ...expectedErrors };
      delete newErrors[index];
      setExpectedErrors(newErrors);
    } catch {
      setExpectedErrors({ ...expectedErrors, [index]: "Invalid JSON" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Code2 className="size-4" />
        <span className="font-medium">Test Cases Configuration</span>
      </div>

      {/* Function Name */}
      <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
          Function Name
        </label>
        <Input
          value={value.function_name}
          onChange={(e) => handleFunctionNameChange(e.target.value)}
          placeholder="e.g. add, multiply, calculate_sum"
          disabled={disabled}
          className="font-mono"
        />
        <p className="text-xs text-slate-400 mt-1">
          Students must define a function with this exact name
        </p>
      </div>

      {/* Test Cases */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
            Test Cases ({value.test_cases.length})
          </label>
          <span className="text-xs text-slate-400">
            Input must be JSON array. Expected can be any JSON value.
          </span>
        </div>

        {value.test_cases.map((tc, idx) => (
          <div
            key={idx}
            className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">
                  Test #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => moveTestCase(idx, -1)}
                  disabled={disabled || idx === 0}
                  className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-40"
                >
                  <ChevronUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveTestCase(idx, 1)}
                  disabled={disabled || idx === value.test_cases.length - 1}
                  className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-40"
                >
                  <ChevronDown className="size-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => duplicateTestCase(idx)}
                  disabled={disabled}
                  className="p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-40"
                >
                  <Copy className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => removeTestCase(idx)}
                  disabled={disabled}
                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Input (JSON array)
                </label>
                <Textarea
                  value={inputDrafts[idx] ?? JSON.stringify(tc.input)}
                  onChange={(e) => updateTestCaseInput(idx, e.target.value)}
                  placeholder='["hello", 3]'
                  disabled={disabled}
                  className={`font-mono text-sm min-h-[90px] ${inputErrors[idx] ? "border-red-500" : ""}`}
                />
                {inputErrors[idx] && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {inputErrors[idx]}
                  </p>
                )}
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1 block">
                  Expected (JSON value)
                </label>
                <Textarea
                  value={expectedDrafts[idx] ?? JSON.stringify(tc.expected)}
                  onChange={(e) => updateTestCaseExpected(idx, e.target.value)}
                  placeholder='"hello3"'
                  disabled={disabled}
                  className={`font-mono text-sm min-h-[90px] ${expectedErrors[idx] ? "border-red-500" : ""}`}
                />
                {expectedErrors[idx] && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {expectedErrors[idx]}
                  </p>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              {value.function_name}({tc.input.map((item) => JSON.stringify(item)).join(", ")})
              {" => "}
              {JSON.stringify(tc.expected)}
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="secondary"
          onClick={addTestCase}
          disabled={disabled}
          className="w-full"
        >
          <Plus className="size-4 mr-2" />
          Add Test Case
        </Button>
      </div>
    </div>
  );
}
