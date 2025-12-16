import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './router';
import './index.css';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <ConfigProvider
                theme={{
                    token: {
                        /* ===== BRAND ===== */
                        colorPrimary: '#1677FF',
                        fontFamily: 'Inter, sans-serif',

                        /* ===== FONT SIZE (QUAN TRỌNG) ===== */
                        fontSize: 15,
                        fontSizeHeading3: 24,
                        fontSizeHeading4: 20,

                        /* ===== CONTROL SIZE ===== */
                        controlHeight: 44,
                        controlHeightLG: 48,

                        /* ===== SPACING & RADIUS ===== */
                        borderRadius: 8,
                        padding: 16,
                        paddingLG: 24,
                    },
                }}
            >
                <RouterProvider router={router} />
            </ConfigProvider>
        </QueryClientProvider>
    </React.StrictMode>
);
