import React from 'react';
import ContactManager from '../../components/Admin/ContactManager';
import AuthGuard from '../../components/Admin/AuthGuard';

const AdminContacts = () => {
    return (
        <AuthGuard
            permissions={{ resource: 'contacts', action: 'read' }}
        >
            <ContactManager />
        </AuthGuard>
    );
};

export default AdminContacts;