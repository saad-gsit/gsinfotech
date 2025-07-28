import React from 'react'
import ServicesManager from '../../components/Admin/ServicesManager';
import AuthGuard from '../../components/Admin/AuthGuard';

const AdminServices = () => {
  return (
      <AuthGuard
          permissions={{ resource: 'contacts', action: 'read' }}
      >
          <ServicesManager />
      </AuthGuard>
  )
}

export default AdminServices