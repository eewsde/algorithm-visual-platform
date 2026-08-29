import { useMemo, useId, ReactNode } from "react";
import dagre from "dagre";

/**
 * 图节点状态
 */
export interface GraphNodeState {
  id: number;
  label?: string;
  value?: number | string;
  x?: number; // 节点x坐标（用于自定义布局）
  y?: number; // 节点y坐标
  isCurrent?: boolean;
  isVisited?: boolean;
  isInQueue?: boolean;
  isProcessed?: boolean;
  inDegree?: number;
  customState?: Record<string, any>;
}

/**
 * 图边状态
 */
export interface GraphEdgeState {
  from: number;
  to: number;
  weight?: number;
  label?: string;
  isCurrent?: boolean;
  isVisited?: boolean;
  isHighlighted?: boolean;
  isRejected?: boolean;
  customState?: Record<string, any>;
}

/**
 * GraphTemplate 属性
 */
export interface GraphTemplateProps {
  // 节点数据
  nodes: GraphNodeState[];

  // 边数据（邻接表或边列表）
  edges: GraphEdgeState[];

  // 核心渲染函数
  renderNode: (node: GraphNodeState) => ReactNode;
  renderEdge?: (edge: GraphEdgeState) => ReactNode;

  // 布局配置
  layout?: {
    type?: 'circle' | 'grid' | 'hierarchical' | 'custom'; // 布局类型
    nodeSize?: number; // 节点大小
    nodeSpacing?: number; // 节点间距
    width?: number; // 画布宽度
    height?: number; // 画布高度
  };

  // 方向
  directed?: boolean; // 是否为有向图

  // 无向图中也允许在"当前边"上显示方向箭头（如 BFS/DFS 遍历演示）
  currentEdgeArrows?: boolean;

  // 自定义渲染
  renderHeader?: () => ReactNode;
  renderFooter?: () => ReactNode;
  renderLegend?: () => ReactNode;

  // 样式
  className?: string;
}

/**
 * 计算圆形布局的节点位置
 */
function calculateCircleLayout(
  nodeCount: number,
  width: number,
  height: number,
  nodeSize: number
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - nodeSize - 50;

  for (let i = 0; i < nodeCount; i++) {
    const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
    positions.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  }

  return positions;
}

/**
 * 计算网格布局的节点位置
 */
function calculateGridLayout(
  nodeCount: number,
  width: number,
  height: number
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  const cols = Math.ceil(Math.sqrt(nodeCount));
  const rows = Math.ceil(nodeCount / cols);

  const cellWidth = width / cols;
  const cellHeight = height / rows;

  for (let i = 0; i < nodeCount; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    positions.push({
      x: col * cellWidth + cellWidth / 2,
      y: row * cellHeight + cellHeight / 2,
    });
  }

  return positions;
}

/**
 * 计算层次布局的节点位置（使用 dagre 算法）
 * dagre 专门用于有向图的层次布局，比手动实现的效果更好
 *
 * 返回 dagre 自然坐标（不缩放）：由调用方按自然尺寸扩展画布，
 * 避免缩放导致节点（固定像素）挤在一起、边线被节点盖住
 */
function calculateHierarchicalLayout(
  nodes: GraphNodeState[],
  edges: GraphEdgeState[],
  nodeSize: number
): { positions: { x: number; y: number }[]; graphWidth: number; graphHeight: number } {
  // 创建 dagre 图
  const g = new dagre.graphlib.Graph();

  // 设置图的属性
  g.setGraph({
    rankdir: 'TB', // Top to Bottom
    align: 'UL', // 左上对齐
    nodesep: 60, // 同层节点间距
    edgesep: 40, // 边间距
    ranksep: 70, // 层级间距
    marginx: 40,
    marginy: 40,
    ranker: 'network-simplex', // 网络单纯形算法
  });

  // 设置默认边属性
  g.setDefaultEdgeLabel(() => ({}));

  // 添加节点
  nodes.forEach((node) => {
    g.setNode(node.id.toString(), {
      label: node.label || node.id.toString(),
      width: nodeSize,
      height: nodeSize,
    });
  });

  // 添加边
  edges.forEach((edge) => {
    g.setEdge(edge.from.toString(), edge.to.toString());
  });

  // 执行布局
  dagre.layout(g);

  const graphWidth = g.graph().width || 0;
  const graphHeight = g.graph().height || 0;

  const positions: { x: number; y: number }[] = [];
  nodes.forEach((node, index) => {
    const dagreNode = g.node(node.id.toString());
    if (dagreNode) {
      positions[index] = { x: dagreNode.x, y: dagreNode.y };
    } else {
      // 降级：如果 dagre 没有计算出位置，使用简单布局
      positions[index] = {
        x: 100,
        y: (index + 1) * (nodeSize + 60),
      };
    }
  });

  return { positions, graphWidth, graphHeight };
}

/**
 * 边的几何描述：d 为 SVG path 指令，label 位置用于边标签
 */
interface EdgeGeometry {
  d: string;
  labelX: number;
  labelY: number;
}

/**
 * 直线边：从起点圆边缘（留 2px）出发，到终点圆边缘外 gap 处结束
 * 有向边需要 gap 给箭头留出可见空间；无向边紧贴圆边缘
 */
function straightEdgeGeometry(
  fromPos: { x: number; y: number },
  toPos: { x: number; y: number },
  radius: number,
  gap: number
): EdgeGeometry {
  const dx = toPos.x - fromPos.x;//两点在x方向的差
  const dy = toPos.y - fromPos.y;//两点在y方向的差
  const dist = Math.sqrt(dx * dx + dy * dy);//两点距离
  const ux = dx / dist;//x方向的单位向量
  const uy = dy / dist;//y方向的单位向量

  const startX = fromPos.x + ux * radius;//沿方向往外推一个半径
  const startY = fromPos.y + uy * radius;
  const endX = toPos.x - ux * (radius + gap);//沿反方向缩回半径+gap
  const endY = toPos.y - uy * (radius + gap);

  return {
    d: `M ${startX} ${startY} L ${endX} ${endY}`,
    labelX: (startX + endX) / 2,
    labelY: (startY + endY) / 2 - 5,
  };
}

/**
 * 自环：在节点正上方画一条小环，避免画成穿过圆心的直线（两端都会被节点盖住）
 */
function selfLoopGeometry(
  pos: { x: number; y: number },
  radius: number,
  gap: number
): EdgeGeometry {
  const top = pos.y - radius - gap;
  const x0 = pos.x - 12;
  const x1 = pos.x + 12;
  return {
    d: `M ${x0} ${top} C ${x0 - 28} ${top - 30}, ${x1 + 28} ${top - 30}, ${x1} ${top}`,
    labelX: pos.x,
    labelY: top - 30,
  };
}

/**
 * 弯曲边：双向边/平行边错开，用二次贝塞尔曲线向垂直方向偏移 offset
 */
function curvedEdgeGeometry(
  fromPos: { x: number; y: number },
  toPos: { x: number; y: number },
  radius: number,
  gap: number,
  offset: number
): EdgeGeometry {
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / dist;
  const uy = dy / dist;
  // 垂直方向单位向量
  const px = -uy;
  const py = ux;

  const startX = fromPos.x + ux * radius;
  const startY = fromPos.y + uy * radius;
  const endX = toPos.x - ux * (radius + gap);
  const endY = toPos.y - uy * (radius + gap);
  const cx = (startX + endX) / 2 + px * offset;
  const cy = (startY + endY) / 2 + py * offset;

  return {
    d: `M ${startX} ${startY} Q ${cx} ${cy} ${endX} ${endY}`,
    // 贝塞尔曲线 t=0.5 处的坐标
    labelX: 0.25 * startX + 0.5 * cx + 0.25 * endX,
    labelY: 0.25 * startY + 0.5 * cy + 0.25 * endY - 5,
  };
}

/**
 * 通用图可视化模板
 */
export function GraphTemplate({
  nodes,
  edges,
  renderNode,
  renderEdge,
  layout = {},
  directed = true,
  currentEdgeArrows = false,
  renderHeader,
  renderFooter,
  renderLegend,
  className = '',
}: GraphTemplateProps) {
  const {
    type = 'circle',
    nodeSize = 40,
    width = 800,
    height = 600,
  } = layout;

  // 用于生成全局唯一的 SVG marker id，避免多实例冲突
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const arrowheadId = `arrowhead-${uid}`;
  const arrowheadCurrentId = `arrowhead-current-${uid}`;
  const arrowheadVisitedId = `arrowhead-visited-${uid}`;

  // 图结构签名：节点/边集合内容不变时复用上一次布局结果，
  // 避免步骤播放时对同一张图反复重算 dagre/circle 布局
  const structureKey = `${nodes.map((n) => n.id).join(",")}|${edges
    .map((e) => `${e.from}-${e.to}`)
    .join(",")}`;

  // 使用 useMemo 避免每次渲染重建，构建 node.id → position 的 Map
  // 结构未变时布局可复用，故依赖签名而非数组引用（每步都会新建数组）
  /* eslint-disable react-hooks/exhaustive-deps */
  const layoutResult = useMemo(() => {
    let positions: { x: number; y: number }[];
    let canvasWidth = width;
    let canvasHeight = height;

    if (nodes.every(n => n.x !== undefined && n.y !== undefined)) {
      positions = nodes.map(n => ({ x: n.x!, y: n.y! }));
    } else {
      switch (type) {
        case 'grid':
          positions = calculateGridLayout(nodes.length, width, height);
          break;
        case 'hierarchical': {
          const res = calculateHierarchicalLayout(nodes, edges, nodeSize);
          // 不缩放布局：画布随 dagre 自然尺寸扩展（超出部分由外层滚动），
          // 否则固定像素的节点会被缩放坐标挤在一起、边线被节点盖住
          canvasWidth = Math.max(width, res.graphWidth + 80);
          canvasHeight = Math.max(height, res.graphHeight + 80);
          positions = res.positions.map((p) => ({
            x: p.x + (canvasWidth - res.graphWidth) / 2,
            y: p.y + (canvasHeight - res.graphHeight) / 2,
          }));
          break;
        }
        case 'circle':
        default:
          positions = calculateCircleLayout(nodes.length, width, height, nodeSize);
          break;
      }
    }

    const map = new Map<number, { x: number; y: number }>();
    nodes.forEach((node, i) => {
      if (positions[i]) map.set(node.id, positions[i]);
    });
    return { nodePositions: map, canvasWidth, canvasHeight };
  }, [structureKey, type, width, height, nodeSize]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const { nodePositions, canvasWidth, canvasHeight } = layoutResult;

  // 同向边计数（用于平行边/双向边错开弯曲）
  const edgeKeyCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of edges) {
      const key = `${e.from}-${e.to}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return counts;
  }, [edges]);
  // 每条同向边出现的序号（渲染时逐个分配）
  const edgeKeyOccurrence = new Map<string, number>();

  return (
    <div className={`graph-template ${className}`}>
      {renderHeader && renderHeader()}

      {/* 注意：SVG 层是 absolute 定位（相对 padding box），节点层是普通流（会被 padding 推移），
          定位容器本身不能有 padding，否则边线会与节点错位；留白用外层纯 padding 包裹实现 */}
      <div className="p-4 overflow-x-auto">
        <div className="relative bg-white rounded-lg border border-gray-200">
          <svg
            width={canvasWidth}
            height={canvasHeight}
            className="absolute top-0 left-0 pointer-events-none"
            style={{ zIndex: 0 }}
          >
          {/* 渲染边 */}
          <defs>
            {/* 箭头标记：userSpaceOnUse 固定像素尺寸，refX=宽度使箭尖恰好落在线的终点 */}
            <marker
              id={arrowheadId}
              markerUnits="userSpaceOnUse"
              markerWidth="10"
              markerHeight="10"
              refX="10"
              refY="5"
              orient="auto"
            >
              <polygon points="0 0, 10 5, 0 10" fill="#D1D5DB" />
            </marker>
            <marker
              id={arrowheadCurrentId}
              markerUnits="userSpaceOnUse"
              markerWidth="10"
              markerHeight="10"
              refX="10"
              refY="5"
              orient="auto"
            >
              <polygon points="0 0, 10 5, 0 10" fill="#FBBF24" />
            </marker>
            <marker
              id={arrowheadVisitedId}
              markerUnits="userSpaceOnUse"
              markerWidth="10"
              markerHeight="10"
              refX="10"
              refY="5"
              orient="auto"
            >
              <polygon points="0 0, 10 5, 0 10" fill="#34D399" />
            </marker>
          </defs>

          {edges.map((edge, idx) => {
            const fromPos = nodePositions.get(edge.from);
            const toPos = nodePositions.get(edge.to);

            if (!fromPos || !toPos) return null;

            const radius = nodeSize / 2;
            const key = `${edge.from}-${edge.to}`;
            const revKey = `${edge.to}-${edge.from}`;
            const sameCount = edgeKeyCounts.get(key) || 1;
            const revCount = edgeKeyCounts.get(revKey) || 0;
            const occ = edgeKeyOccurrence.get(key) || 0;
            edgeKeyOccurrence.set(key, occ + 1);

            const strokeColor = edge.isCurrent
              ? '#FBBF24'
              : edge.isVisited
              ? '#34D399'
              : edge.isHighlighted
              ? '#60A5FA'
              : edge.isRejected
              ? '#F87171'
              : '#D1D5DB';

            const strokeWidth = edge.isCurrent ? 2.5 : 2;
            const opacity = edge.isCurrent
              ? 1
              : edge.isVisited
              ? 0.8
              : edge.isHighlighted
              ? 0.9
              : edge.isRejected
              ? 0.7
              : 0.6;

            const markerEnd = directed
              ? edge.isCurrent
                ? `url(#${arrowheadCurrentId})`
                : edge.isVisited
                ? `url(#${arrowheadVisitedId})`
                : `url(#${arrowheadId})`
              : currentEdgeArrows && edge.isCurrent
              ? `url(#${arrowheadCurrentId})`
              : undefined;

            // 有箭头的边需要给箭头留可见空间；无箭头边紧贴节点边缘
            const gap = directed || (currentEdgeArrows && edge.isCurrent) ? 8 : 0;

            let geo: EdgeGeometry;
            if (edge.from === edge.to) {
              // 自环：画在节点上方的小环
              geo = selfLoopGeometry(fromPos, radius, gap);
            } else if (directed && revCount > 0) {
              // 双向边：两条方向各向一侧弯曲，避免重叠。
              // 注意：垂直方向随边方向翻转，偏移符号必须保持不变，否则两条曲线会弯向同一侧。
              geo = curvedEdgeGeometry(fromPos, toPos, radius, gap, 14);
            } else if (sameCount > 1) {
              // 同向平行边：按出现顺序均匀错开
              const offset = (occ - (sameCount - 1) / 2) * 22;
              geo = curvedEdgeGeometry(fromPos, toPos, radius, gap, offset);
            } else {
              geo = straightEdgeGeometry(fromPos, toPos, radius, gap);
            }

            return (
              <g key={`edge-${idx}`}>
                <path
                  d={geo.d}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeOpacity={opacity}
                  markerEnd={markerEnd}
                  strokeLinecap="round"
                />
                {edge.label && (
                  <text
                    x={geo.labelX}
                    y={geo.labelY}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#6B7280"
                  >
                    {edge.label}
                  </text>
                )}
                {renderEdge && renderEdge(edge)}
              </g>
            );
          })}
        </svg>

        {/* 渲染节点 */}
        <div className="relative" style={{ width: canvasWidth, height: canvasHeight, zIndex: 1 }}>
          {nodes.map((node) => {
            const pos = nodePositions.get(node.id);
            if (!pos) return null;

            return (
              <div
                key={node.id}
                className="absolute"
                style={{
                  left: pos.x - nodeSize / 2,
                  top: pos.y - nodeSize / 2,
                  width: nodeSize,
                  height: nodeSize,
                  // 仅"当前节点"加缩放 transform；其余节点不设 transform——
                  // 避免 iOS Safari 对滚动容器内 transform 图层的合成偏移（节点与 SVG 边线错位）
                  ...(node.isCurrent
                    ? { transform: "scale(1.1)", transition: "transform 0.3s ease" }
                    : {}),
                }}
              >
                {renderNode(node)}
              </div>
            );
          })}
        </div>
        </div>
      </div>

      {renderLegend && renderLegend()}
      {renderFooter && renderFooter()}
    </div>
  );
}
