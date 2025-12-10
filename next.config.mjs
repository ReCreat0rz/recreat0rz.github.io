/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  output: 'export',
  images: {
    unoptimized: true,
  },
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
};
export default nextConfig;
