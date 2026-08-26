import { useEffect } from "react";

/**
 * 滚动恢复组件
 * 阻止 React Router 的默认滚动到顶部行为
 * 让 useScrollRestore Hook 来处理滚动位置恢复
 */
export default function ScrollToTop() {
  useEffect(() => {
    const originalScrollRestoration = window.history.scrollRestoration;

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = originalScrollRestoration;
      }
    };
  }, []);

  return null;
}
