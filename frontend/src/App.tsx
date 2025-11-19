import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import { SignUp } from './pages/SignUp';
import MyBids from './pages/MyBids';
import AuctionDetailPage from './pages/AuctionDetailPage';
import AdminCategoryManagement from './pages/admin/AdminCategoryManagement';
import SellerLayout from './layouts/SellerLayout';
import SellerProductsPage from './pages/seller/SellerProductsPage';
import SellerAuctionsPage from './pages/seller/SellerAuctionsPage';
import ProfilePage from './pages/ProfilePage';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/carousel/styles.css';
import '@mantine/dates/styles.css';

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

            <Route path="/seller" element={<SellerLayout />}>
              <Route index element={<Navigate to="/seller/auctions" replace />} />
              <Route path="products" element={<SellerProductsPage />} />
              <Route path="auctions" element={<SellerAuctionsPage />} />
            </Route>

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </BrowserRouter>
      </ModalsProvider>
    </MantineProvider>
  )
}

export default App

