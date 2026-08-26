import { Suspense, lazy, Component, ReactNode, ErrorInfo } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Loader2, AlertTriangle } from 'lucide-react'
import Layout from './components/layout/Layout'
import ScrollToTop from './components/ScrollToTop'
import './App.css'

// 懒加载页面组件
const HomePage = lazy(() => import('./pages/HomePage'))
const ProblemListPage = lazy(() => import('./pages/ProblemListPage'))
const ProblemPage = lazy(() => import('./pages/ProblemPage'))

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('页面渲染错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">页面加载出现错误，请刷新重试</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * 页面加载占位组件
 */
function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
        <p className="text-gray-600 text-lg">加载中...</p>
      </div>
    </div>
  )
}

/**
 * 路由内容组件：按路径 key 重建 ErrorBoundary，
 * 保证切换到其他页面时错误状态自动重置，而不是一直停留在错误页
 */
function AppRoutes() {
  const location = useLocation();
  return (
    <ErrorBoundary key={location.pathname}>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/problems" element={<ProblemListPage />} />
          <Route path="/problem/:id" element={<ProblemPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <Router
      // GitHub Pages 部署在子路径时，保证首次进入 `${base}/` 能正确匹配到路由
      basename={import.meta.env.BASE_URL}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ScrollToTop />
      <Layout>
        <AppRoutes />
      </Layout>
    </Router>
  )
}

export default App

