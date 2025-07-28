import React from 'react';
import TeamManager from '../../components/Admin/TeamManager';
import AuthGuard from '../../components/Admin/AuthGuard';

const AdminTeam = () => {
    return (
        <AuthGuard
            permissions={{ resource: 'team', action: 'read' }}
        >
            <TeamManager />
        </AuthGuard>
    );
};

export default AdminTeam;