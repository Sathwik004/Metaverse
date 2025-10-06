import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {

    return NextResponse.next();
}

// Optionally, specify which routes to apply middleware to
export const config = {
    matcher: ["/", "/dashboard", "/profile"], // add protected routes here
};

