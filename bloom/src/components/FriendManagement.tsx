// src/components/FriendManagement.tsx
const FriendManagement = () => {
  const mockFriends = [
    { id: 1, name: "John Doe", birthday: "1990-05-15", phone: "+1234567890" },
    { id: 2, name: "Jane Smith", birthday: "1992-08-22", phone: "+0987654321" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
          <div className="flex space-x-2">
            <input
              type="search"
              placeholder="Search friends..."
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            />
            <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors duration-200">
              Add New
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockFriends.map((friend) => (
            <div key={friend.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{friend.name}</h3>
                  <p className="text-gray-600">{friend.phone}</p>
                  <p className="text-gray-600">Birthday: {friend.birthday}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FriendManagement;
