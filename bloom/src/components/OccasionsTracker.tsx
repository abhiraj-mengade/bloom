// src/components/OccasionsTracker.tsx
const OccasionsTracker = () => {
  const mockEvents = [
    { id: 1, name: "John's Birthday", date: "2024-05-15", type: "birthday" },
    {
      id: 2,
      name: "Jane's Anniversary",
      date: "2024-06-22",
      type: "anniversary",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Occasions</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
            <div className="space-y-4">
              {mockEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{event.name}</h3>
                    <p className="text-gray-600">{event.date}</p>
                  </div>
                  <span className="px-3 py-1 bg-primary text-white rounded-full text-sm">
                    {event.type}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Component would go here */}
          <div className="border rounded-lg p-4">
            <p className="text-center text-gray-600">
              Calendar View Coming Soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OccasionsTracker;
