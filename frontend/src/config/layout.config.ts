// Global layout configuration constants
export const LAYOUT_CONFIG = {
    // Header configuration
    HEADER_HEIGHT: 64,

    // Sidebar configuration
    SIDEBAR_WIDTH: 220,
    SIDEBAR_COLLAPSED_WIDTH: 80,

    // Spacing
    CONTENT_PADDING: 24,

    // Colors
    HEADER_BACKGROUND: '#fff',
    SIDEBAR_BACKGROUND: '#001529',
    CONTENT_BACKGROUND: '#f5f5f5',

    // Z-index
    HEADER_Z_INDEX: 1000,
    SIDEBAR_Z_INDEX: 999,
} as const;

export type LayoutConfig = typeof LAYOUT_CONFIG;
