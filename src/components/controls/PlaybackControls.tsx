import { Play, Pause, SkipBack, SkipForward, RotateCcw, Gauge } from "lucide-react";

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

function PlaybackControls({
  isPlaying,
  currentStep,
  totalSteps,
  speed,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedChange,
}: PlaybackControlsProps) {
  const speedOptions = [
    { value: 0.5, label: "0.5x" },
    { value: 1, label: "1x" },
    { value: 1.5, label: "1.5x" },
    { value: 2, label: "2x" },
  ];

  return (
    <div className="bg-gradient-to-r from-primary-50 to-blue-50 border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between gap-6">
        {/* 左侧：步骤信息 */}
        <div className="flex items-center gap-4 min-w-[200px]">
          <span className="text-sm font-semibold text-gray-700">
            步骤 {currentStep + 1} / {totalSteps}
          </span>
          <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[120px]">
            <div
              className="bg-gradient-to-r from-primary-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  totalSteps > 1
                    ? (currentStep / (totalSteps - 1)) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* 中间：播放控制按钮 */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            disabled={currentStep === 0}
            className="p-2 rounded-lg bg-white hover:bg-gray-50 shadow-sm border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow"
            title="重置"
          >
            <RotateCcw size={18} className="text-gray-700" />
          </button>

          <button
            onClick={onStepBackward}
            disabled={currentStep === 0}
            className="p-2 rounded-lg bg-white hover:bg-gray-50 shadow-sm border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow"
            title="上一步"
          >
            <SkipBack size={18} className="text-gray-700" />
          </button>

          <button
            onClick={isPlaying ? onPause : onPlay}
            disabled={currentStep === totalSteps - 1 && !isPlaying}
            className="p-3 rounded-lg bg-gradient-to-r from-primary-500 to-blue-500 hover:from-primary-600 hover:to-blue-600 text-white shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-lg"
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
          </button>

          <button
            onClick={onStepForward}
            disabled={currentStep === totalSteps - 1}
            className="p-2 rounded-lg bg-white hover:bg-gray-50 shadow-sm border border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow"
            title="下一步"
          >
            <SkipForward size={18} className="text-gray-700" />
          </button>
        </div>

        {/* 右侧：速度控制 */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <Gauge size={18} className="text-gray-600" />
          <div className="flex gap-1">
            {speedOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onSpeedChange(option.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  speed === option.value
                    ? "bg-gradient-to-r from-primary-500 to-blue-500 text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaybackControls;

