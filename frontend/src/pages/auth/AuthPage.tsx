import React, { useState } from 'react';
import {
    Tabs,
    Form,
    Input,
    Button,
    Checkbox,
    Typography,
    message,
    theme
} from 'antd';
import {
    GoogleOutlined,
    GithubOutlined
} from '@ant-design/icons';
import splashImage from '@/assets/images/splash.png';
import styles from './AuthPage.module.css';

const { Title, Text, Link } = Typography;

export interface AuthPageProps {
    imageSrc?: string;
    title?: string;
    subtitle?: string;
    onLogin?: (data: { email: string; password: string }) => Promise<any>;
    onRegister?: (data: { fullName: string; email: string; password: string }) => Promise<any>;
}

const AuthPage: React.FC<AuthPageProps> = ({
    imageSrc = splashImage,
    title = "Welcome Back",
    subtitle = "Please enter your details to sign in",
    onLogin,
    onRegister
}) => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('login');
    const { token } = theme.useToken();

    const handleLogin = async (values: any) => {
        setLoading(true);
        try {
            if (onLogin) {
                await onLogin(values);
            } else {
                await new Promise(resolve => setTimeout(resolve, 1500));
                console.log('Login values:', values);
            }
            message.success('Successfully logged in!');
        } catch (error) {
            message.error('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (values: any) => {
        setLoading(true);
        try {
            if (onRegister) {
                await onRegister(values);
            } else {
                await new Promise(resolve => setTimeout(resolve, 1500));
                console.log('Register values:', values);
            }
            message.success('Registration successful! Please log in.');
            setActiveTab('login');
        } catch (error) {
            message.error('Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const tabItems = [
        {
            key: 'login',
            label: 'Login',
            children: (
                <Form
                    name="login_form"
                    layout="vertical"
                    onFinish={handleLogin}
                    initialValues={{ remember: true }}
                    size="large"
                    requiredMark={false}
                >
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please input your Email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input
                            placeholder="Email"
                            autoFocus={activeTab === 'login'}
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            { required: true, message: 'Please input your Password!' },
                            { min: 8, message: 'Password must be at least 8 characters' }
                        ]}
                    >
                        <Input.Password
                            placeholder="Password"
                        />
                    </Form.Item>
                    <Form.Item>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                            <Link
                                onClick={(e) => {
                                    e.preventDefault();
                                    message.info('Password reset functionality to be implemented.');
                                }}
                            >
                                Forgot password?
                            </Link>
                        </div>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Log in
                        </Button>
                    </Form.Item>
                </Form>
            )
        },
        {
            key: 'register',
            label: 'Register',
            children: (
                <Form
                    name="register_form"
                    layout="vertical"
                    onFinish={handleRegister}
                    size="large"
                    requiredMark={false}
                >
                    <Form.Item
                        name="fullName"
                        label="Full Name"
                        rules={[{ required: true, message: 'Please input your Name!' }]}
                    >
                        <Input
                            placeholder="Full Name"
                            autoFocus={activeTab === 'register'}
                        />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please input your Email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input
                            placeholder="Email"
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            { required: true, message: 'Please input your Password!' },
                            { min: 8, message: 'Password must be at least 8 characters' }
                        ]}
                    >
                        <Input.Password
                            placeholder="Password"
                        />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label="Confirm Password"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Please confirm your password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            placeholder="Confirm Password"
                        />
                    </Form.Item>

                    <Form.Item
                        name="agreement"
                        valuePropName="checked"
                        rules={[
                            {
                                validator: (_, value) =>
                                    value ? Promise.resolve() : Promise.reject(new Error('Should accept agreement')),
                            },
                        ]}
                    >
                        <Checkbox>
                            I have read the <Link>agreement</Link>
                        </Checkbox>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Register
                        </Button>
                    </Form.Item>
                </Form>
            )
        }
    ];

    return (
        <div className={styles.container}>
            <div
                className={styles.leftSide}
                style={{
                    backgroundImage: `url(${imageSrc || ''})`,
                    backgroundColor: !imageSrc ? token.colorPrimary : undefined
                }}
            />
            <div className={styles.rightSide}>
                <div className={styles.authCard}>

                    {/* HEADER with reduced spacing */}
                    <div className={styles.header}>
                        <Title level={2} style={{ margin: 0, lineHeight: 1.2 }}>
                            {activeTab === 'login' ? title : "Create an Account"}
                        </Title>
                        <Text type="secondary" style={{ margin: 0 }}>
                            {activeTab === 'login' ? subtitle : "Join us today!"}
                        </Text>
                    </div>

                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        centered
                        items={tabItems}
                    />

                    <div className={styles.socialLogin}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                            Or continue with
                        </Text>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                            <Button icon={<GoogleOutlined />} onClick={() => message.info('Social login not implemented')} />
                            <Button icon={<GithubOutlined />} onClick={() => message.info('Social login not implemented')} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;