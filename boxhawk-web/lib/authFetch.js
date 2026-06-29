import { NextResponse } from 'next/server'
import { hasMinimumRole } from '@/lib/rbac.js'

export function authFetch(requiredRole){
    // Get the request
    // let request = req.get(Authorization: Bearer <supabase_access_token>);
    // Extract header
    const { data, error } = supabase.auth.getSession();
    supabase_access_token = data.access_token;


    return supabase_access_token;

}
