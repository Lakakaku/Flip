'use client';

export default function HomePage() {
  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-4xl mx-auto text-center'>
        <h1 className='text-4xl font-bold text-gray-900 mb-4'>
          Welcome to Flip
        </h1>
        <p className='text-xl text-gray-600 mb-8'>
          The Swedish marketplace flipping platform that identifies underpriced
          items and maximizes your profits
        </p>

        <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8'>
          <h2 className='text-lg font-semibold text-yellow-800 mb-2'>
            🚧 Development Mode
          </h2>
          <p className='text-yellow-700'>
            The platform is currently building its price database. This process
            ensures accurate profit calculations. Please check back soon!
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-12'>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Smart Deal Detection
            </h3>
            <p className='text-gray-600'>
              AI-powered analysis of Swedish marketplaces to find the best
              flipping opportunities
            </p>
          </div>

          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Real-time Notifications
            </h3>
            <p className='text-gray-600'>
              Get instant alerts when profitable deals are found in your
              selected niches
            </p>
          </div>

          <div className='bg-white rounded-lg shadow-md p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Profit Maximization
            </h3>
            <p className='text-gray-600'>
              Comprehensive tools to help you maximize profits from every flip
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
