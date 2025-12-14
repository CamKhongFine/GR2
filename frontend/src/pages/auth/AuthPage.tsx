import React from 'react';
import {
    Form,
    Input,
    Button,
    Checkbox,
    Typography,
    message,
    theme,
    Divider,
    Space
} from 'antd';
import {
    GoogleOutlined,
    GithubOutlined
} from '@ant-design/icons';
import type { FormProps } from 'antd';
import splashImage from '@/assets/images/splash.png';
import styles from './AuthPage.module.css';

const { Title, Text, Link } = Typography;

export interface AuthPageProps {
    imageSrc?: string;
    title?: string;
    subtitle?: string;
    onLogin?: (data: { email: string; password: string; remember?: boolean }) => Promise<any>;
}

interface LoginFormValues {
    email: string;
    password: string;
    remember?: boolean;
}

const AuthPage: React.FC<AuthPageProps> = ({
    imageSrc = splashImage,
    title = "Welcome Back",
    subtitle = "Please enter your details to sign in",
    onLogin
}) => {
    const [form] = Form.useForm<LoginFormValues>();
    const { token } = theme.useToken();

    const handleLogin: FormProps<LoginFormValues>['onFinish'] = async (values) => {
        try {
            if (onLogin) {
                await onLogin(values);
            } else {
                // Demo mode
                await new Promise(resolve => setTimeout(resolve, 1500));
                console.log('Login values:', values);
            }
            message.success('Successfully logged in!');
        } catch (error: any) {
            const errorMessage = error?.message || 'Login failed. Please try again.';
            message.error(errorMessage);
        }
    };

    const handleForgotPassword = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        message.info('Password reset functionality to be implemented.');
    };

    const handleSocialLogin = (provider: 'google' | 'github') => {
        message.info(`${provider === 'google' ? 'Google' : 'GitHub'} login not implemented`);
    };

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
                    {/* Header */}
                    <div className={styles.header}>
                        <Title level={2} className={styles.title}>
                            {title}
                        </Title>
                        <Text type="secondary" className={styles.subtitle}>
                            {subtitle}
                        </Text>
                    </div>

                    {/* Login Form */}
                    <Form
                        form={form}
                        name="login"
                        layout="vertical"
                        onFinish={handleLogin}
                        initialValues={{ remember: true }}
                        size="large"
                        requiredMark={false}
                        autoComplete="off"
                    >
                        <Form.Item
                            name="email"
                            label="Email"
                            rules={[
                                { required: true, message: 'Please input your email!' },
                                { type: 'email', message: 'Please enter a valid email address!' }
                            ]}
                        >
                            <Input
                                placeholder="Enter your email"
                                autoComplete="email"
                                autoFocus
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[
                                { required: true, message: 'Please input your password!' },
                                { min: 8, message: 'Password must be at least 8 characters!' }
                            ]}
                        >
                            <Input.Password
                                placeholder="Enter your password"
                                autoComplete="current-password"
                            />
                        </Form.Item>

                        <Form.Item>
                            <div className={styles.formFooter}>
                                <Form.Item name="remember" valuePropName="checked" noStyle>
                                    <Checkbox>Remember me</Checkbox>
                                </Form.Item>
                                <Link
                                    onClick={handleForgotPassword}
                                    className={styles.forgotLink}
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </Form.Item>

                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                className={styles.loginButton}
                            >
                                Sign In
                            </Button>
                        </Form.Item>
                    </Form>

                    {/* Social Login */}
                    <div className={styles.socialLogin}>
                        <Divider plain>
                            <Text type="secondary" className={styles.dividerText}>
                                Or continue with
                            </Text>
                        </Divider>
                        <Space size="middle" className={styles.socialButtons}>
                            <Button
                                icon={<GoogleOutlined />}
                                onClick={() => handleSocialLogin('google')}
                                className={styles.socialButton}
                            >
                                Google
                            </Button>
                            <Button
                                icon={<GithubOutlined />}
                                onClick={() => handleSocialLogin('github')}
                                className={styles.socialButton}
                            >
                                GitHub
                            </Button>
                        </Space>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;