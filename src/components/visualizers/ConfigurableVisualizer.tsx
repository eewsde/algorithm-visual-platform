import { ReactNode, useEffect } from "react";
import { useVisualization } from "@/hooks/useVisualization";
import { VisualizationLayout } from "./VisualizationLayout";
import { StepVariables, ProblemInput } from "@/types/visualization";
import { InputType } from "@/hooks/useInputHandler";
import { InputFieldConfig } from "./TestCaseInput";
import { useCodeStore } from "@/store/useCodeStore";

/**
 * 可视化配置接口
 */
export interface VisualizerConfig<TInput extends ProblemInput = ProblemInput, TData = any> {
  // 基础配置
  defaultInput: TInput;
  algorithm: (input: TInput) => any[];
  
  // 输入配置
  inputTypes: InputType[];
  inputFields: InputFieldConfig[];
  testCases: Array<{ label: string; value: TInput }>;
  
  // 自定义变量显示
  customStepVariables?: (variables: StepVariables) => ReactNode;

  // 代码高亮行号（用于自动轮转高亮）
  keyLines?: number[];

  // 渲染函数（核心：完全自定义的视觉呈现）
  render: (props: VisualizerRenderProps<TData>) => ReactNode;
}

/**
 * 渲染函数接收的 props
 */
export interface VisualizerRenderProps<TData = any> {
  // 当前步骤的数据
  data: TData;
  
  // 当前步骤的变量
  variables?: StepVariables;
  
  // 完整的可视化状态
  visualization: ReturnType<typeof useVisualization>;
  
  // 辅助函数
  getVariable: <T = any>(name: string, defaultValue?: T) => T | undefined;
  getBooleanVariable: (name: string) => boolean;
  getNumberVariable: (name: string) => number | undefined;
  getArrayVariable: (name: string) => any[] | undefined;
}

/**
 * 可配置的可视化器组件
 * 
 * 使用配置对象来构建可视化器，减少样板代码
 * 同时保留完全的视觉定制能力
 */
export function ConfigurableVisualizer<TInput extends ProblemInput = ProblemInput, TData = any>({
  config,
}: {
  config: VisualizerConfig<TInput, TData>;
}) {
  const visualization = useVisualization<TInput>(
    config.algorithm,
    config.defaultInput
  );

  const setHighlightLines = useCodeStore((s) => s.setHighlightLines);

  // 提取当前步骤数据
  const currentData = (visualization.currentStepData?.data || {}) as TData & { highlightLines?: number[] };
  const variables = visualization.currentStepData?.variables as StepVariables | undefined;
  const currentStep = visualization.currentStep;
  const totalSteps = visualization.steps.length;

  // 同步代码高亮行到全局 store
  useEffect(() => {
    if (currentData.highlightLines) {
      setHighlightLines(currentData.highlightLines);
    } else if (config.keyLines && config.keyLines.length > 0 && totalSteps > 0) {
      // 无 per-step 数据时，用轮转方式自动高亮 keyLines
      const idx = Math.floor((currentStep / Math.max(1, totalSteps)) * config.keyLines.length);
      const lines = config.keyLines.slice(0, Math.max(1, Math.min(idx + 1, config.keyLines.length)));
      setHighlightLines(lines);
    }
  }, [currentData.highlightLines, setHighlightLines, totalSteps, currentStep, config.keyLines]);

  useEffect(() => {
    return () => setHighlightLines([]);
  }, [setHighlightLines]);

  // 辅助函数
  const getVariable = <T = any>(name: string, defaultValue?: T): T | undefined => {
    const value = variables?.[name];
    return value !== undefined ? (value as T) : defaultValue;
  };

  const getBooleanVariableFn = (name: string): boolean => {
    return Boolean(variables?.[name]);
  };

  const getNumberVariableFn = (name: string): number | undefined => {
    const value = variables?.[name];
    return typeof value === 'number' ? value : undefined;
  };

  const getArrayVariableFn = (name: string): any[] | undefined => {
    const value = variables?.[name];
    return Array.isArray(value) ? value : undefined;
  };

  // 构建渲染 props
  const renderProps: VisualizerRenderProps<TData> = {
    data: currentData,
    variables,
    visualization: visualization as any,
    getVariable,
    getBooleanVariable: getBooleanVariableFn,
    getNumberVariable: getNumberVariableFn,
    getArrayVariable: getArrayVariableFn,
  };

  return (
    <VisualizationLayout
      visualization={visualization}
      inputTypes={config.inputTypes}
      inputFields={config.inputFields}
      testCases={config.testCases}
      customStepVariables={config.customStepVariables}
    >
      {config.render(renderProps)}
    </VisualizationLayout>
  );
}
