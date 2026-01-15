import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LockOutlined } from '@ant-design/icons';

/**
 * 403 Forbidden page shown when user tries to access unauthorized routes
 */
const ForbiddenPage: React.FC = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoHome = () => {
        navigate('/app');
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: '#f5f5f5'
        }}>
            <Result
                status="403"
                icon={<LockOutlined style={{ fontSize: 72, color: '#ff4d4f' }} />}
                title="403"
                subTitle="Sorry, you don't have permission to access this page."
                extra={[
                    <Button type="primary" key="home" onClick={handleGoHome}>
                        Go to Dashboard
                    </Button>,
                    <Button key="back" onClick={handleGoBack}>
                        Go Back
                    </Button>,
                ]}
            />
        </div>
    );
};

export default ForbiddenPage;
