import { supabase } from './supabaseClient.ts';
import { Organization } from '../types.ts';

/**
 * Arquitetura de Multi-Tenancy Supabase
 * Tabelas sugeridas (SQL):
 * - organizations (id, name, slug, logo_url)
 * - members (id, organization_id, user_id, role)
 */

export const getOrganizations = async (): Promise<Organization[]> => {
  // Simulação de fetch para arquitetura multi-tenant
  // Na prática: return (await supabase.from('members').select('organization:organizations(*)').eq('user_id', auth.uid())).data;
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Fallback para simular organizações enquanto o schema SQL não é aplicado
  return [
    { id: 'personal', name: 'Personal Workspace', slug: 'personal', role: 'OWNER' },
    { id: 'alpha-capital', name: 'Alpha Capital Org', slug: 'alpha-cap', role: 'ADMIN' }
  ];
};

export const createOrganization = async (name: string): Promise<Organization | null> => {
  const slug = name.toLowerCase().replace(/\s+/g, '-');
  // Simulação de inserção
  const newOrg: Organization = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    slug,
    role: 'OWNER'
  };
  return newOrg;
};