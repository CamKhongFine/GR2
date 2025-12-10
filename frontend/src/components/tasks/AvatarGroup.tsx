import React from 'react';
import { Tooltip } from 'antd';

interface AvatarGroupProps {
    users: {
        id: string;
        name: string;
        avatar: string;
    }[];
    max?: number;
}

const AvatarGroup: React.FC<AvatarGroupProps> = ({ users, max = 3 }) => {
    const visibleUsers = users.slice(0, max);
    const remaining = users.length - max;

    return (
        <div className="flex -space-x-2 overflow-hidden p-1">
            {visibleUsers.map((user) => (
                <Tooltip title={user.name} key={user.id}>
                    <img
                        className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover shadow-sm"
                        src={user.avatar}
                        alt={user.name}
                    />
                </Tooltip>
            ))}
            {remaining > 0 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-white bg-gray-100 text-xs font-medium text-gray-600 shadow-sm">
                    +{remaining}
                </div>
            )}
        </div>
    );
};

export default AvatarGroup;
