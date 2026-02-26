import { NextResponse } from 'next/server'

export function apiAuth(){
    // Get the request
    // let request = req.get(Authorization: Bearer <supabase_access_token>);
    // Extract header
    let header = request.header.get(authorization);

    supabase.auth.getUser(header);

    let role = user.app_metadata.role;
    if(role === 'undefined'){
        role = 'photouser'
    }

}
