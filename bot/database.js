const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "data.json");

// Initialize database if it doesn't exist
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(
    DB_PATH,
    JSON.stringify({
      users: {},
      products: {
        P1: { name: "Gift Box 1", price: 999, description: "Premium Gift Box" },
        P2: { name: "Gift Box 2", price: 1499, description: "Luxury Gift Box" },
        P3: {
          name: "Gift Box 3",
          price: 1999,
          description: "Premium Plus Gift Box",
        },
      },
    })
  );
}

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH));
const writeDB = (data) =>
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

const EVENT_TYPES = {
  BIRTHDAY: { name: "Birthday", emoji: "🎂" },
  ANNIVERSARY: { name: "Anniversary", emoji: "💑" },
  GRADUATION: { name: "Graduation", emoji: "🎓" },
  WEDDING: { name: "Wedding", emoji: "💒" },
  HOUSEWARMING: { name: "Housewarming", emoji: "🏠" },
  BABY_SHOWER: { name: "Baby Shower", emoji: "👶" },
  CUSTOM: { name: "Custom Event", emoji: "🎉" },
};

const formatDateToMMDD = (date) => {
  const [day, month] = date.split("/");
  return `${month}/${day}`;
};

const db = {
  addUser: (number, name) => {
    const data = readDB();
    if (!data.users[number]) {
      data.users[number] = {
        name,
        friends: {},
        wishlist: [], // Will now store item names instead of IDs
      };
      writeDB(data);
    }
    return data.users[number];
  },

  // Update wishlist with item names
  setWishlist: (number, items) => {
    const data = readDB();
    if (!data.users[number]) return false;
    // Store full item names in wishlist
    data.users[number].wishlist = items.map((item) => item.trim());
    writeDB(data);
    return true;
  },

  // Add items to existing wishlist
  addToWishlist: (number, items) => {
    const data = readDB();
    if (!data.users[number]) return false;
    // Combine existing and new items, remove duplicates
    const currentWishlist = data.users[number].wishlist || [];
    const newWishlist = [
      ...new Set([...currentWishlist, ...items.map((item) => item.trim())]),
    ];
    data.users[number].wishlist = newWishlist;
    writeDB(data);
    return true;
  },

  // Remove items from wishlist
  removeFromWishlist: (number, items) => {
    const data = readDB();
    if (!data.users[number]) return false;
    const itemsToRemove = new Set(items.map((item) => item.trim()));
    data.users[number].wishlist = data.users[number].wishlist.filter(
      (item) => !itemsToRemove.has(item)
    );
    writeDB(data);
    return true;
  },

  // Existing friend-related functions remain the same
  updateFriend: (userNumber, friendNumber, friendDetails) => {
    const data = readDB();
    if (!data.users[userNumber]) return false;

    if (friendDetails.name && friendDetails.name.includes(" ")) {
      throw new Error("Friend names cannot contain spaces");
    }

    // Initialize or maintain existing events array
    const existingFriend = data.users[userNumber].friends[friendNumber] || {};
    const events = existingFriend.events || [];

    // If DOB is provided (DD/MM/YYYY), add as birthday event
    if (friendDetails.dob) {
      // Validate DOB format
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(friendDetails.dob)) {
        throw new Error("DOB must be in DD/MM/YYYY format");
      }

      const [day, month, year] = friendDetails.dob.split("/");
      const birthdayIndex = events.findIndex((e) => e.type === "birthday");
      const birthdayEvent = {
        type: "birthday",
        date: `${day}/${month}`, // Store as DD/MM
        description: "Birthday",
        year: year,
        recurring: true,
        id: `birthday-${friendNumber}`,
        dateAdded: new Date().toISOString(),
      };

      if (birthdayIndex >= 0) {
        events[birthdayIndex] = birthdayEvent;
      } else {
        events.push(birthdayEvent);
      }
    }

    data.users[userNumber].friends[friendNumber] = {
      ...existingFriend,
      ...friendDetails,
      events,
      lastUpdated: new Date().toISOString(),
    };

    writeDB(data);
    return true;
  },

  addFriendEvent: (userNumber, friendName, eventDetails) => {
    const data = readDB();
    const friendNumber = db.getFriendNumberByName(userNumber, friendName);
    if (!friendNumber) return false;

    // Validate date format (DD/MM)
    if (!/^\d{2}\/\d{2}$/.test(eventDetails.date)) {
      throw new Error("Event date must be in DD/MM format");
    }

    const friend = data.users[userNumber].friends[friendNumber];
    if (!friend.events) friend.events = [];

    friend.events.push({
      ...eventDetails,
      date: eventDetails.date, // Keep DD/MM format
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
    });

    writeDB(data);
    return true;
  },

  removeFriendEvent: (userNumber, friendName, eventId) => {
    const data = readDB();
    const friendNumber = db.getFriendNumberByName(userNumber, friendName);
    if (!friendNumber) return false;

    const friend = data.users[userNumber].friends[friendNumber];
    if (!friend.events) return false;

    friend.events = friend.events.filter((event) => event.id !== eventId);
    writeDB(data);
    return true;
  },

  checkUpcomingEvents: (userNumber) => {
    const data = readDB();
    const user = data.users[userNumber];
    if (!user?.friends) return [];

    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcomingEvents = [];

    Object.entries(user.friends).forEach(([number, friend]) => {
      friend.events?.forEach((event) => {
        const [day, month] = event.date.split("/").map(Number);
        let eventDate = new Date(today.getFullYear(), month - 1, day);

        // If the date has passed this year and it's recurring, check next year
        if (eventDate < today && event.recurring) {
          eventDate.setFullYear(eventDate.getFullYear() + 1);
        }

        if (eventDate <= nextWeek && eventDate >= today) {
          upcomingEvents.push({
            friendName: friend.name,
            friendNumber: number,
            date: event.date, // Already in DD/MM format
            description: event.description,
            interests: friend.interests,
            isBirthday: event.type === "birthday",
            year: event.year, // Will be present for birthdays
          });
        }
      });
    });

    return upcomingEvents;
  },

  setFriendsList: (userNumber, friendsList) => {
    const data = readDB();
    if (!data.users[userNumber]) return false;
    data.users[userNumber].friends = friendsList;
    writeDB(data);
    return true;
  },

  getUser: (number) => {
    const data = readDB();
    return data.users[number];
  },

  // Add function to get friend number by name
  getFriendNumberByName: (userNumber, friendName) => {
    const data = readDB();
    const user = data.users[userNumber];
    if (!user?.friends) return null;

    // Find friend entry where name matches (case insensitive)
    const friendEntry = Object.entries(user.friends).find(
      ([_, friend]) => friend.name.toLowerCase() === friendName.toLowerCase()
    );

    return friendEntry ? friendEntry[0] : null;
  },

  // Update getFriend to work with either number or name
  getFriend: (userNumber, friendIdentifier) => {
    const data = readDB();
    const user = data.users[userNumber];
    if (!user?.friends) return null;

    // If it's already a phone number format
    if (friendIdentifier.includes("@c.us")) {
      return user.friends[friendIdentifier];
    }

    // Try to find by name
    const friendNumber = db.getFriendNumberByName(userNumber, friendIdentifier);
    return friendNumber ? user.friends[friendNumber] : null;
  },

  checkProduct: (productId) => {
    const data = readDB();
    console.log(productId);
    console.log(data.products[productId]);
    return data.products?.[productId] || null;
  },

  // Optional: Add function to get all products
  getProducts: () => {
    const data = readDB();
    return data.products || {};
  },

  // Update gift suggestions to consider event type
  getRandomGiftSuggestion: (interests, eventType) => {
    const products = Object.entries(readDB().products);
    // For now, still random but could be enhanced to consider event type
    const suggestions = [];
    for (let i = 0; i < 2; i++) {
      const randomProduct =
        products[Math.floor(Math.random() * products.length)];
      suggestions.push(randomProduct[1]);
    }
    return suggestions;
  },
};

module.exports = db;
