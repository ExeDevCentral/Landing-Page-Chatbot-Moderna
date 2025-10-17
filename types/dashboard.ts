// types/dashboard.ts
export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalSales: number;
  totalRevenue: number;
  activeUsers: number;
  lowStockItems: number;
  pendingOrders: number;
  monthlyGrowth: {
    users: number;
    sales: number;
    revenue: number;
  };
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'table' | 'metric' | 'list';
  data: any;
  size: 'small' | 'medium' | 'large';
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  refreshInterval?: number;
  lastUpdated?: Date;
}

export interface DashboardConfig {
  userId: string;
  widgets: DashboardWidget[];
  layout: 'grid' | 'list';
  theme: 'light' | 'dark';
  autoRefresh: boolean;
  refreshInterval: number;
}
