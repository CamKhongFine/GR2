import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

const { Content, Footer } = Layout;

const LandingLayout: React.FC = () => {
    return (
        <Layout className="min-h-screen bg-white">
            <Content>
                <Outlet />
            </Content>
            <Footer className="text-center bg-gray-50">
                AuraFlow ©{new Date().getFullYear()} Created by Ngoc Cam
            </Footer>
        </Layout>
    );
};

export default LandingLayout;
