import { ReactNode } from 'react';
import { useAuth, UserRole } from '@/hooks/useAuth';

interface RoleGateProps {
  role: UserRole | UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const RoleGate = ({ role, children, fallback = null }: RoleGateProps) => {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  const allowedRoles = Array.isArray(role) ? role : [role];
  const hasAccess = allowedRoles.includes(user.role);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};