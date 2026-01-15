import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

const { Content } = Layout;

const LandingLayout: React.FC = () => {
    return (
        <Layout className="min-h-screen bg-white">
            <Content>
                <Outlet />
            </Content>
        </Layout>
    );
};

export default LandingLayout;
