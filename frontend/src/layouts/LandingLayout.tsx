import React from 'react';
import { Layout, Button } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';

const { Header, Content, Footer } = Layout;

const LandingLayout: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Layout className="min-h-screen bg-white">
            <Header className="flex items-center justify-between bg-white border-b border-gray-100 px-8 sticky top-0 z-50">
                <div className="text-2xl font-bold text-primary cursor-pointer" onClick={() => navigate('/')}>
                    TaskMaster
                </div>
                <div className="flex gap-4">
                    <Button type="text" onClick={() => navigate('/login')}>Log in</Button>
                    <Button type="primary" onClick={() => navigate('/app')}>Get Started</Button>
                </div>
            </Header>
            <Content>
                <Outlet />
            </Content>
            <Footer className="text-center bg-gray-50">
                TaskMaster ©{new Date().getFullYear()} Created by Antigravity
            </Footer>
        </Layout>
    );
};

export default LandingLayout;
