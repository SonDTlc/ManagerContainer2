/**** Next.js config ****/
/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: { unoptimized: true },
	rewrites: async () => {
		const isDev = process.env.NODE_ENV !== 'production';
		return isDev
			? [
				{ source: '/backend/:path*', destination: 'http://localhost:1000/:path*' }
			]
			: [];
	}
};

module.exports = nextConfig;
