// GH_PAGES=1 npm run build -> static export under /miden-launch for GitHub Pages
const ghPages = process.env.GH_PAGES === "1";

/** @type {import('next').NextConfig} */
const nextConfig = ghPages
  ? { output: "export", basePath: "/miden-launch" }
  : {};

export default nextConfig;
