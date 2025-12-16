import React from 'react';
import {
    Form,
    Button,
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
import splashImage from '@/assets/images/splash.png';
import styles from './AuthPage.module.css';

const { Title, Text } = Typography;

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
    subtitle = "Sign in using your company SSO account",
    onLogin: _onLogin
}) => {
    const [form] = Form.useForm<LoginFormValues>();
    const { token } = theme.useToken();


    const redirectToKeycloak = () => {
        const keycloakBaseUrl = import.meta.env.VITE_KEYCLOAK_BASE_URL || 'http://localhost:8080';
        const keycloakRealm = import.meta.env.VITE_KEYCLOAK_REALM || 'auraflow';
        const keycloakClientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'auraflow-frontend';
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        
        // Force redirect_uri to backend, ignore env variable if set incorrectly
        const redirectUri = `${apiBaseUrl}/api/auth/callback`;
        const encodedRedirectUri = encodeURIComponent(redirectUri);

        console.log('Redirecting to Keycloak with:', {
            keycloakBaseUrl,
            keycloakRealm,
            keycloakClientId,
            redirectUri,
            encodedRedirectUri
        });

        const authUrl =
            `${keycloakBaseUrl}/realms/${encodeURIComponent(keycloakRealm)}` +
            `/protocol/openid-connect/auth` +
            `?client_id=${encodeURIComponent(keycloakClientId)}` +
            `&response_type=code` +
            `&scope=openid%20profile%20email` +
            `&redirect_uri=${encodedRedirectUri}`;

        window.location.href = authUrl;
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

                    {/* Login via Keycloak SSO */}
                    <Form
                        form={form}
                        name="login"
                        layout="vertical"
                        size="large"
                        requiredMark={false}
                        autoComplete="off"
                    >
                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button
                                type="primary"
                                block
                                className={styles.loginButton}
                                onClick={redirectToKeycloak}
                            >
                                Sign In with SSO
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