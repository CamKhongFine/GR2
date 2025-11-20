import { useMemo } from 'react';
import {
  Container,
  Title,
  Paper,
  SimpleGrid,
  Text,
} from '@mantine/core';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import dashboardData from '../../data/dashboard-mock-data.json';

const COLORS = ['#FF7A00', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const formatMonth = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

export default function SellerDashboard() {
  const revenueData = useMemo(() => {
    return dashboardData.revenueChart.map((item) => ({
      month: formatMonth(item.month),
      revenue: item.revenue,
    }));
  }, []);

  const auctionsCreatedData = useMemo(() => {
    return dashboardData.auctionsCreatedChart.map((item) => ({
      month: formatMonth(item.month),
      auctionsCreated: item.auctionsCreated,
    }));
  }, []);

  const auctionStatusData = useMemo(() => {
    return dashboardData.auctionStatusChart.map((item) => ({
      name: item.label.charAt(0).toUpperCase() + item.label.slice(1),
      value: item.value,
    }));
  }, []);

  const topCustomersData = useMemo(() => {
    return dashboardData.topCustomersChart
      .sort((a, b) => b.totalSpending - a.totalSpending)
      .map((item) => ({
        customerName: item.customerName,
        totalSpending: item.totalSpending,
      }));
  }, []);

  const bidsReceivedData = useMemo(() => {
    return dashboardData.bidsReceivedChart.map((item) => ({
      date: formatDate(item.date),
      bidsReceived: item.bidsReceived,
    }));
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper p="sm" withBorder shadow="md">
          <Text size="sm" fw={600} mb={4}>
            {label}
          </Text>
          {payload.map((entry: any, index: number) => (
            <Text key={index} size="sm" c={entry.color}>
              {entry.name}: {entry.value?.toLocaleString ? entry.value.toLocaleString('en-US') : entry.value}
              {entry.dataKey === 'revenue' || entry.dataKey === 'totalSpending'
                ? ' VND'
                : ''}
            </Text>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Container size="xl" py="xl">
      <Title order={2} mb="xl" fw={700}>
        Seller Dashboard
      </Title>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mb="lg">
        {/* Revenue Over Time - Line Chart */}
        <Paper p="md" radius="md" withBorder shadow="sm">
          <Text fw={600} size="lg" mb="md">
            Revenue Over Time
          </Text>
          <Text size="sm" c="dimmed" mb="lg">
            Last 12 months
          </Text>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value: number) => `${(value / 1000000).toFixed(1)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#FF7A00"
                strokeWidth={2}
                dot={{ fill: '#FF7A00', r: 4 }}
                name="Revenue (VND)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* Auctions Created Monthly - Bar Chart */}
        <Paper p="md" radius="md" withBorder shadow="sm">
          <Text fw={600} size="lg" mb="md">
            Auctions Created Monthly
          </Text>
          <Text size="sm" c="dimmed" mb="lg">
            Last 12 months
          </Text>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={auctionsCreatedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="auctionsCreated" fill="#3B82F6" name="Auctions Created" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Auction Status Breakdown - Pie Chart */}
        <Paper p="md" radius="md" withBorder shadow="sm">
          <Text fw={600} size="lg" mb="md">
            Auction Status Breakdown
          </Text>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={auctionStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name?: string; percent?: number }) => 
                  name && percent ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {auctionStatusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* Top Customers by Spending - Horizontal Bar Chart */}
        <Paper p="md" radius="md" withBorder shadow="sm">
          <Text fw={600} size="lg" mb="md">
            Top Customers by Spending
          </Text>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topCustomersData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                tickFormatter={(value: number) => `${(value / 1000000).toFixed(1)}M`}
              />
              <YAxis dataKey="customerName" type="category" tick={{ fontSize: 12 }} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="totalSpending" fill="#10B981" name="Spending (VND)" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Bids Received Trend - Area Chart */}
        <Paper p="md" radius="md" withBorder shadow="sm" style={{ gridColumn: '1 / -1' }}>
          <Text fw={600} size="lg" mb="md">
            Bids Received Trend
          </Text>
          <Text size="sm" c="dimmed" mb="lg">
            Last 30 days
          </Text>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={bidsReceivedData}>
              <defs>
                <linearGradient id="colorBids" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FF7A00" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="bidsReceived"
                stroke="#FF7A00"
                fillOpacity={1}
                fill="url(#colorBids)"
                name="Bids Received"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </SimpleGrid>
    </Container>
  );
}
