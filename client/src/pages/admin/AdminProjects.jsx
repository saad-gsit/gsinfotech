import React from 'react';
import ProjectsManager from '../../components/Admin/ProjectsManager';
import AuthGuard from '../../components/Admin/AuthGuard';

const AdminProjects = () => {
    return (
        <AuthGuard permissions={{ resource: 'projects', action: 'read' }}>
            <ProjectsManager />
        </AuthGuard>
    );
};

export default AdminProjects;