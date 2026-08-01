import { NextResponse } from "next/server";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "berta_refresh";

function clearOptions(secure: boolean) {
  return {
    httpOnly: true,
    secure,
    sameSite: (secure ? "none" : "lax") as "none" | "lax",
    path: "/",
    maxAge: 0,
  };
}

/** Clears auth cookies set on the frontend origin via the /backend proxy. */
export async function POST() {
  const secure = process.env.NODE_ENV === "production";
  const response = NextResponse.json({ message: "Signed out" });
  const options = clearOptions(secure);
  response.cookies.set(ACCESS_COOKIE, "", options);
  response.cookies.set(REFRESH_COOKIE, "", options);
  // Also clear non-secure variants in case cookies were set without Secure locally.
  if (secure) {
    response.cookies.set(ACCESS_COOKIE, "", clearOptions(false));
    response.cookies.set(REFRESH_COOKIE, "", clearOptions(false));
  }
  return response;
}
