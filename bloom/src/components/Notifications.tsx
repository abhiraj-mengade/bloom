// src/components/Notifications.tsx
const Notifications = () => {
  const mockNotifications = [
    {
      id: 1,
      type: "birthday",
      message: "John's birthday is coming up in 3 days!",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      type: "gift",
      message: "New gift recommendations for Jane's anniversary",
      timestamp: "1 day ago",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Notifications</h1>

        <div className="bg-white rounded-lg shadow">
          {mockNotifications.map((notification) => (
            <div
              key={notification.id}
              className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors duration-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{notification.message}</p>
                  <p className="text-sm text-gray-600">
                    {notification.timestamp}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    notification.type === "birthday"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {notification.type}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <h2 className="font-medium mb-2">Notification Settings</h2>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-primary focus:ring-primary"
              />
              <span>WhatsApp Notifications</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded text-primary focus:ring-primary"
              />
              <span>Email Notifications</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
