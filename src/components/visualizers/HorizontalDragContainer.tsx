import { MouseEvent, PropsWithChildren, useEffect, useRef, useState } from "react";

interface HorizontalDragContainerProps {
  className?: string;
}

/**
 * 通用水平拖动容器
 * - 支持滚轮/触控板横向滚动（依赖浏览器）
 * - 支持鼠标按住拖动（类似抓手 ✋）
 * - 拖动监听挂载在 window 上，快速拖动/指针移出容器也不会中断
 */
export function HorizontalDragContainer({
  children,
  className = "",
}: PropsWithChildren<HorizontalDragContainerProps>) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const scrollStartLeftRef = useRef(0);

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    dragStartXRef.current = event.clientX;
    scrollStartLeftRef.current = scrollRef.current.scrollLeft;
    setIsDragging(true);
  };

  // 在 window 上监听移动/抬起，避免指针移出容器导致拖动中断
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event: globalThis.MouseEvent) => {
      if (!scrollRef.current) return;
      event.preventDefault();
      const deltaX = event.clientX - dragStartXRef.current;
      scrollRef.current.scrollLeft = scrollStartLeftRef.current - deltaX;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={scrollRef}
      className={`w-full overflow-x-auto pb-2 select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      } ${className}`}
      onMouseDown={handleMouseDown}
    >
      <div className="inline-flex min-w-max">{children}</div>
    </div>
  );
}
