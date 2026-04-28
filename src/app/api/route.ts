import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    name: "ClippingPath & Website Services Studio API",
    version: "1.0.0",
    description: "Professional Image & Video Editing Services Platform",
    endpoints: {
      auth: {
        login: { method: "POST", path: "/api/auth/login" },
        signup: { method: "POST", path: "/api/auth/signup" },
        logout: { method: "POST", path: "/api/auth/logout" },
      },
      admin: {
        crud: { method: "GET/POST/PUT/DELETE", path: "/api/admin/crud" },
        statistics: { method: "GET/POST/PUT/DELETE", path: "/api/admin/statistics" },
        pricing: { method: "GET/POST/PUT/DELETE", path: "/api/admin/pricing" },
        services: { method: "GET/POST/PUT/DELETE", path: "/api/admin/services" },
        features: { method: "GET/POST/PUT/DELETE", path: "/api/admin/features" },
        testimonials: { method: "GET/POST/PUT/DELETE", path: "/api/admin/testimonials" },
        settings: { method: "GET/POST/PUT/DELETE", path: "/api/admin/settings" },
      },
      orders: { method: "GET/POST", path: "/api/orders" },
      notifications: { method: "GET/POST/PUT", path: "/api/notifications" },
      chat: {
        rooms: { method: "GET/POST", path: "/api/chat/rooms" },
        messages: { method: "GET/POST", path: "/api/chat/messages" },
      },
      contact: { method: "GET/POST/PUT/DELETE", path: "/api/contact" },
      settings: { method: "GET/PUT", path: "/api/settings/site" },
      proxy: { method: "GET", path: "/api/proxy/asset/[bucket]/[...path]" },
    },
    status: "operational",
    timestamp: new Date().toISOString(),
  });
}
