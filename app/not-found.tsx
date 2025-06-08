export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-xl text-gray-600 mb-8">Page Not Found</h2>
        <a href="/" className="text-blue-600 hover:text-blue-800">
          Return Home
        </a>
      </div>
    </div>
  )
} 