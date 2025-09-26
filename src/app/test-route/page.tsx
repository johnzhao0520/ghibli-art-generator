export default function TestRoute() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-green-600 mb-4">
          ✅ 路由测试成功！
        </h1>
        <p className="text-gray-600 mb-4">
          如果你能看到这个页面，说明Next.js路由系统正常工作。
        </p>
        <div className="text-sm text-gray-500">
          <p>时间戳: {new Date().toISOString()}</p>
          <p>路径: /test-route</p>
        </div>
      </div>
    </div>
  );
}