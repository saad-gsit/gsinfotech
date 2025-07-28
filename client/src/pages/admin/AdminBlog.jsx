import React from 'react';
import BlogManager from '../../components/Admin/BlogManager';
import AuthGuard from '../../components/Admin/AuthGuard';

const AdminBlog = () => {
    return (
        <AuthGuard permissions={{ resource: 'blog', action: 'read' }}>
            <BlogManager />
        </AuthGuard>
    );
};

export default AdminBlog;