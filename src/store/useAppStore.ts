import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * 应用全局状态管理
 * 使用 Zustand + persist 中间件实现状态持久化
 */

// 学习进度状态
interface ProgressState {
  completedProblems: Set<number>; // 已完成的题目 ID 集合
  inProgressProblems: Set<number>; // 进行中的题目 ID 集合
  favoriteProblems: Set<number>; // 收藏的题目 ID 集合
}

// 用户设置
interface UserSettings {
  defaultSpeed: number; // 默认播放速度
  autoPlay: boolean; // 是否自动播放
  showCodeByDefault: boolean; // 是否默认显示代码
  theme: "light" | "dark"; // 主题（预留）
}

// Store 状态接口
interface AppState extends ProgressState {
  settings: UserSettings;

  // 进度相关方法
  markAsCompleted: (problemId: number) => void;
  markAsInProgress: (problemId: number) => void;
  removeFromProgress: (problemId: number) => void;
  toggleFavorite: (problemId: number) => void;
  isCompleted: (problemId: number) => boolean;
  isFavorite: (problemId: number) => boolean;
  isInProgress: (problemId: number) => boolean;

  // 设置相关方法
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetProgress: () => void;

  // 统计方法
  getProgressStats: (total: number) => {
    total: number;
    completed: number;
    inProgress: number;
    favorite: number;
    completionRate: number;
  };
}

// 默认设置
const defaultSettings: UserSettings = {
  defaultSpeed: 1,
  autoPlay: false,
  showCodeByDefault: false,
  theme: "light",
};

// 创建 store
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始状态
      completedProblems: new Set<number>(),
      inProgressProblems: new Set<number>(),
      favoriteProblems: new Set<number>(),
      settings: defaultSettings,

      // 标记为已完成
      markAsCompleted: (problemId: number) => {
        set((state) => {
          const completed = new Set(state.completedProblems);
          const inProgress = new Set(state.inProgressProblems);
          completed.add(problemId);
          inProgress.delete(problemId);
          return {
            completedProblems: completed,
            inProgressProblems: inProgress,
          };
        });
      },

      // 标记为进行中
      markAsInProgress: (problemId: number) => {
        set((state) => {
          const inProgress = new Set(state.inProgressProblems);
          inProgress.add(problemId);
          return { inProgressProblems: inProgress };
        });
      },

      // 从进度中移除
      removeFromProgress: (problemId: number) => {
        set((state) => {
          const completed = new Set(state.completedProblems);
          const inProgress = new Set(state.inProgressProblems);
          completed.delete(problemId);
          inProgress.delete(problemId);
          return {
            completedProblems: completed,
            inProgressProblems: inProgress,
          };
        });
      },

      // 切换收藏状态
      toggleFavorite: (problemId: number) => {
        set((state) => {
          const favorite = new Set(state.favoriteProblems);
          if (favorite.has(problemId)) {
            favorite.delete(problemId);
          } else {
            favorite.add(problemId);
          }
          return { favoriteProblems: favorite };
        });
      },

      // 检查是否已完成
      isCompleted: (problemId: number) => {
        return get().completedProblems.has(problemId);
      },

      // 检查是否收藏
      isFavorite: (problemId: number) => {
        return get().favoriteProblems.has(problemId);
      },

      // 检查是否进行中
      isInProgress: (problemId: number) => {
        return get().inProgressProblems.has(problemId);
      },

      // 更新设置
      updateSettings: (newSettings: Partial<UserSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      // 重置进度
      resetProgress: () => {
        set({
          completedProblems: new Set<number>(),
          inProgressProblems: new Set<number>(),
          favoriteProblems: new Set<number>(),
        });
      },

      // 获取进度统计
      getProgressStats: (total) => {
        const state = get();
        const totalProblems = total;
        const completed = state.completedProblems.size;
        const inProgress = state.inProgressProblems.size;
        const favorite = state.favoriteProblems.size;
        const completionRate =
          totalProblems > 0 ? (completed / totalProblems) * 100 : 0;

        return {
          total: totalProblems,
          completed,
          inProgress,
          favorite,
          completionRate: Math.round(completionRate * 100) / 100,
        };
      },
    }),
    {
      name: "luogu-algo-vis-storage", // localStorage key
      // 自定义序列化，处理 Set 类型
      storage: {
        getItem: (name) => {
          try {
            const str = localStorage.getItem(name);
            if (!str) return null;
            const parsed = JSON.parse(str);
            // 将数组转换回 Set
            return {
              state: {
                ...parsed.state,
                completedProblems: new Set(parsed.state.completedProblems || []),
                inProgressProblems: new Set(
                  parsed.state.inProgressProblems || []
                ),
                favoriteProblems: new Set(parsed.state.favoriteProblems || []),
              },
              version: parsed.version,
            };
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            // 将 Set 转换为数组以便序列化
            const toStore = {
              state: {
                ...value.state,
                completedProblems: Array.from(value.state.completedProblems),
                inProgressProblems: Array.from(value.state.inProgressProblems),
                favoriteProblems: Array.from(value.state.favoriteProblems),
              },
              version: value.version,
            };
            localStorage.setItem(name, JSON.stringify(toStore));
          } catch {
            // localStorage 不可用时静默降级（隐私模式/配额满）
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch {
            // 静默降级
          }
        },
      },
    }
  )
);
