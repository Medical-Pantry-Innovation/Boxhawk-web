import { NextResponse } from 'next/server'
import { hasMinimumRole } 'lib/rbac.js'

export function apiAuth(requiredRole){
    // Get the request
    // let request = req.get(Authorization: Bearer <supabase_access_token>);
    // Extract header
    let header = request.header.get(authorization);

    userRole = supabase.auth.getUser(header);

    let role = user.app_metadata.role;
    if(role === 'undefined'){
        role = 'photouser'
    }

    if(hasMinimumRole(role, requiredRole)){
        return NextResponse.next()
    }
    return new NextResponse(null, { status: 401 })

}
