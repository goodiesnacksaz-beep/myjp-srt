export { default } from "next-auth/middleware";

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/upload/:path*",
        "/files/:path*",
        "/quiz/:path*",
    ],
};

