import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import { SignUp } from './pages/SignUp';
import MyBids from './pages/MyBids';
import AuctionDetailPage from './pages/AuctionDetailPage';
import AdminCategoryManagement from './pages/AdminCategoryManagement';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/carousel/styles.css';

function App() {
  return (
    <MantineProvider
      theme={{
        primaryColor: 'orange',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
        fontFamilyMonospace: 'Monaco, Courier, monospace',
        headings: { fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif' },
      }}
    >
      <ModalsProvider>
        <Notifications />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/my-bids" element={<MyBids />} />
            <Route path="/auction/:id" element={<AuctionDetailPage />} />
            <Route path="/admin/categories" element={<AdminCategoryManagement />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </BrowserRouter>
      </ModalsProvider>
    </MantineProvider>
  )
}

export default App
