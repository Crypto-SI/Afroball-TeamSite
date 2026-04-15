import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Redirect /admin to /dashboard for backward compatibility
  if (pathname === "/admin" || (pathname.startsWith("/admin") && !pathname.startsWith("/admin/"))) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace("/admin", "/dashboard");
    return NextResponse.redirect(url);
  }

  // Always protect /dashboard — even without Supabase configured
  if (pathname.startsWith("/dashboard") && !hasSupabaseEnv()) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", pathname);
    url.searchParams.set("error", "no_supabase");
    return NextResponse.redirect(url);
  }

  if (!hasSupabaseEnv()) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.searchParams.delete("redirectedFrom");
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
