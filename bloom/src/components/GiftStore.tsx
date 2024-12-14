// src/components/GiftStore.tsx
const GiftStore = () => {
  const mockGifts = [
    {
      id: 1,
      name: "Custom Photo Frame",
      price: 29.99,
      category: "Personalized",
    },
    { id: 2, name: "Birthday Gift Box", price: 49.99, category: "Packages" },
    // Add more mock gifts
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Gift Store</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockGifts.map((gift) => (
            <div
              key={gift.id}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="h-48 bg-gray-200">
                {/* Gift Image would go here */}
              </div>
              <div className="p-4">
                <h3 className="font-medium">{gift.name}</h3>
                <p className="text-gray-600">${gift.price}</p>
                <span className="text-sm text-primary">{gift.category}</span>
                <button className="w-full mt-2 bg-primary text-white py-2 rounded-lg hover:bg-secondary transition-colors duration-200">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GiftStore;
