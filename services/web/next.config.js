/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // output: 'export',
    // distDir: 'dist',
    // serverRuntimeConfig: {
    //     API_PORT: process.env.API_PORT,
    // },
    env: {
        API_PORT: process.env.API_PORT || '3000',
    },
    // rewrites: () => [{
    //     source: '/api',
    //     destination:`http://api:${process.env.API_PORT}`
    // }]
//     images: {
//     remotePatterns: [
//       {
//         protocol: 'https',
//         hostname: 'i.ebayimg.com',
//         port: '',
//         pathname: '/images/**',
//       },
//     ],
//   },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
}

module.exports = nextConfig
