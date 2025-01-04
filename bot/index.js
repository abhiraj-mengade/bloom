const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const fs = require("fs");
const path = require("path");

// Database setup
const DB_PATH = path.join(__dirname, "db.json");
const initializeDB = () => {
  if (!fs.existsSync(DB_PATH)) {
    const initialDB = {
      users: {},
      friends: {},
      gifts: {},
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDB, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
};

// Helper functions
const saveDB = (db) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
};

const isRegistered = (userId, db) => {
  return db.users.hasOwnProperty(userId);
};

const handleRegistration = async (message, userId, db) => {
  const name = message.body.trim();
  db.users[userId] = {
    name: name,
    registeredAt: new Date().toISOString(),
  };
  saveDB(db);
  return (
    `Welcome to Bloom, ${name}! 🌸\n\n` +
    `Let's help you stay connected with your loved ones! 🌺\n\n` +
    `Here's what you can do:\n\n` +
    `🌷 Type *!menu* to see all commands\n` +
    `🌹 Type *!addfriend* to add your first friend\n` +
    `🌻 Type *!upcoming* to see upcoming events\n` +
    `🌼 Type *!store* to browse our gift collection\n\n` +
    `We're here to make gifting beautiful and effortless! 💝`
  );
};

// Enhanced helper functions
const handleCancel = async (userId) => {
  userStates.delete(userId);
  return "Operation cancelled. Type !menu to see available options.";
};

const handleMainMenu = async () => {
  return (
    `🌸 *Welcome to Bloom Gifting Agent* 🌸\n\n` +
    `Here are all available commands:\n\n` +
    `🌹 *!addfriend* - Add a new friend to your garden\n` +
    `👥 *!viewfriends* - View your circle of friends\n` +
    `✏️ *!editfriend* - Update friend's details\n` +
    `💫 *!deactivate* - Deactivate a friend\n` +
    `🎁 *!sendgift* - Send a thoughtful gift\n` +
    `🎂 *!birthdays* - Check upcoming celebrations\n` +
    `🛍️ *!store* - Browse our gift collection\n` +
    `❌ *!cancel* - Cancel current operation\n\n` +
    `Let's make every moment special! 🌺`
  );
};

const handleAddFriend = async (message, userId, db) => {
  const [name, phone, dob, address, interests] = message.body
    .split(",")
    .map((item) => item.trim());

  if (!name || !phone || !dob || !address) {
    return (
      `🌸 Oops! Please provide all required information:\n\n` +
      `Format: Name, Phone, DOB (DD/MM/YYYY), Address, Interests(optional)\n\n` +
      `Example:\n` +
      `Sarah Smith, +1234567890, 15/03/1990, 123 Bloom St NYC, reading;cooking;travel\n\n` +
      `Type *!cancel* to go back to menu 🌺`
    );
  }

  if (!db.friends[userId]) {
    db.friends[userId] = [];
  }

  db.friends[userId].push({
    name,
    phone,
    dob,
    address,
    interests: interests ? interests.split(";") : [],
    active: true,
    addedAt: new Date().toISOString(),
  });

  saveDB(db);
  return (
    `🌸 Wonderful! ${name} has been added to your garden! 🌺\n\n` +
    `What would you like to do next?\n` +
    `🌷 Type *!addfriend* to add another friend\n` +
    `👥 Type *!viewfriends* to view your friends\n` +
    `🎁 Type *!sendgift* to send a gift\n` +
    `📋 Type *!menu* to see all options`
  );
};

const handleViewFriends = async (userId, db) => {
  if (!db.friends[userId] || db.friends[userId].length === 0) {
    return (
      `🌸 Your garden is ready for new friends!\n\n` +
      `Type *!addfriend* to add your first friend 🌺`
    );
  }

  const activeFriends = db.friends[userId].filter((friend) => friend.active);
  return (
    `🌸 *Your Blooming Circle of Friends* 🌸\n\n` +
    activeFriends
      .map(
        (friend, index) =>
          `${index + 1}. ✨ *${friend.name}*\n` +
          `   📱 ${friend.phone}\n` +
          `   🎂 ${friend.dob}\n` +
          `   📍 ${friend.address}\n` +
          `   💝 Interests: ${friend.interests.join(", ") || "None specified"}`
      )
      .join("\n\n")
  );
};

const handleDeactivateFriend = async (message, userId, db) => {
  const friendName = message.body.trim();
  const friendIndex = db.friends[userId].findIndex(
    (f) => f.name.toLowerCase() === friendName.toLowerCase() && f.active
  );

  if (friendIndex === -1) {
    return "Friend not found. Please check the name and try again.";
  }

  db.friends[userId][friendIndex].active = false;
  saveDB(db);
  return `${friendName} has been deactivated from your friend list.`;
};

const handleEditFriend = async (message, userId, db) => {
  const [friendName, field, newValue] = message.body
    .split(",")
    .map((item) => item.trim());

  const friendIndex = db.friends[userId].findIndex(
    (f) => f.name.toLowerCase() === friendName.toLowerCase() && f.active
  );

  if (friendIndex === -1) {
    return "Friend not found. Please check the name and try again.";
  }

  const validFields = ["name", "phone", "dob", "address", "interests"];
  if (!validFields.includes(field.toLowerCase())) {
    return `Invalid field. You can edit: ${validFields.join(", ")}`;
  }

  db.friends[userId][friendIndex][field.toLowerCase()] =
    field.toLowerCase() === "interests" ? newValue.split(";") : newValue;

  saveDB(db);
  return `Updated ${friendName}'s ${field} successfully!`;
};

// WhatsApp client setup
const whatsapp = new Client({
  authStrategy: new LocalAuth(),
});

// State management for user interactions
const userStates = new Map();

whatsapp.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

whatsapp.on("ready", () => {
  console.log("Bloom Gifting Agent is ready! 🌸");
});

// Add these constants at the top
const STORE_URL = "https://bloom-gifts.example.com";
const PAYMENT_LINK_BASE = "https://payment.example.com";
const ADMIN_NUMBER = "admin-number@c.us"; // Replace with actual admin WhatsApp number

const FESTIVALS = [
  { name: "Christmas", date: "25/12/2023", type: "festival" },
  { name: "Valentine's Day", date: "14/02/2024", type: "festival" },
  { name: "Mother's Day", date: "12/05/2024", type: "festival" },
  { name: "Father's Day", date: "16/06/2024", type: "festival" },
  // Add more festivals as needed
];

// Add these helper functions
const parseDate = (dateStr) => {
  const [day, month, year] = dateStr.split("/");
  return new Date(year, month - 1, day);
};

const getUpcomingEvents = (userId, db) => {
  const today = new Date();
  const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Get upcoming birthdays
  const upcomingBirthdays =
    db.friends[userId]
      ?.filter((friend) => friend.active)
      .map((friend) => {
        const [day, month] = friend.dob.split("/");
        const eventDate = new Date(today.getFullYear(), month - 1, day);
        if (eventDate < today) {
          eventDate.setFullYear(today.getFullYear() + 1);
        }
        return {
          name: friend.name,
          date: eventDate,
          type: "birthday",
        };
      }) || [];

  // Get upcoming festivals
  const upcomingFestivals = FESTIVALS.map((festival) => ({
    ...festival,
    date: parseDate(festival.date),
  })).filter((event) => event.date >= today && event.date <= sevenDaysFromNow);

  return [...upcomingBirthdays, ...upcomingFestivals].sort(
    (a, b) => a.date - b.date
  );
};

const getGiftRecommendations = (friend) => {
  const db = initializeDB();
  const allCategories = db.gifts.categories;
  let recommendations = [];

  // If friend has interests, prioritize related categories
  if (friend.interests && friend.interests.length > 0) {
    friend.interests.forEach((interest) => {
      const matchingCategory = Object.entries(allCategories).find(
        ([category]) => category.toLowerCase().includes(interest.toLowerCase())
      );

      if (matchingCategory) {
        recommendations.push(...matchingCategory[1]);
      }
    });
  }

  // Add some random recommendations if we don't have enough
  while (recommendations.length < 5) {
    const randomCategory =
      Object.values(allCategories)[
        Math.floor(Math.random() * Object.values(allCategories).length)
      ];
    const randomGift =
      randomCategory[Math.floor(Math.random() * randomCategory.length)];
    if (!recommendations.includes(randomGift)) {
      recommendations.push(randomGift);
    }
  }

  return recommendations.slice(0, 5);
};

// Add these command handlers
const handleUpcomingEvents = async (userId, db) => {
  const events = getUpcomingEvents(userId, db);

  if (events.length === 0) {
    return (
      `🌸 No upcoming celebrations in the next 7 days!\n\n` +
      `Type *!viewfriends* to see all your friends 🌺`
    );
  }

  return (
    `🌸 *Upcoming Celebrations* 🌸\n\n` +
    events
      .map((event) => {
        const dateStr = event.date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        return (
          `${event.type === "birthday" ? "🎂" : "🎉"} *${event.name}*\n` +
          `   📅 ${dateStr}\n` +
          `   ${
            event.type === "birthday" ? "🎁 Send a gift with !sendgift" : ""
          }`
        );
      })
      .join("\n\n") +
    `\n\n🛍️ Type *!store* to browse our curated gift collection!`
  );
};

const handleOrderGift = async (message, userId, db) => {
  const [friendName, productId, note] = message.body
    .split(",")
    .map((item) => item.trim());

  const friend = db.friends[userId]?.find(
    (f) => f.name.toLowerCase() === friendName.toLowerCase() && f.active
  );

  if (!friend) {
    return (
      `🌸 Oops! Friend not found.\n\n` +
      `Please check the name and try again.\n` +
      `Type *!viewfriends* to see your friend list 🌺`
    );
  }

  // Generate order ID
  const orderId = `ORDER${Date.now()}`;

  // Store order details (you might want to add an orders section to your DB)
  if (!db.orders) db.orders = {};
  db.orders[orderId] = {
    userId,
    friendName,
    productId,
    note,
    status: "pending_payment",
    createdAt: new Date().toISOString(),
  };
  saveDB(db);

  // Notify admin about new order
  const adminMessage = `New Order!\nOrder ID: ${orderId}\nFor: ${friendName}\nProduct: ${productId}\nNote: ${note}`;
  await whatsapp.sendMessage(ADMIN_NUMBER, adminMessage);

  return (
    `🎁 *Your gift order has been created!* 🌸\n\n` +
    `Order ID: ${orderId}\n` +
    `For: ${friendName}\n` +
    `Note: "${note}"\n\n` +
    `We'll send you the payment link shortly! 💝`
  );
};

const handleCheckStore = async () => {
  return `Visit our store to browse gifts! 🎁\n${STORE_URL}`;
};

whatsapp.on("message", async (message) => {
  const db = initializeDB();
  const userId = message.from;

  // Handle cancel command globally
  if (message.body.toLowerCase() === "!cancel") {
    const response = await handleCancel(userId);
    await message.reply(response);
    return;
  }

  // Registration flow
  if (!isRegistered(userId, db)) {
    if (!userStates.has(userId)) {
      userStates.set(userId, "REGISTERING");
      await message.reply(
        "Welcome to Bloom! 🌸\nPlease enter your name to get started:"
      );
      return;
    } else if (userStates.get(userId) === "REGISTERING") {
      const response = await handleRegistration(message, userId, db);
      userStates.delete(userId);
      await message.reply(response);
      return;
    }
  }

  // Handle commands for registered users
  switch (message.body.toLowerCase()) {
    case "!menu":
      const menuResponse = await handleMainMenu();
      await message.reply(menuResponse);
      return;

    case "!addfriend":
      userStates.set(userId, "ADDING_FRIEND");
      await message.reply(
        "Please enter friend's details in this format:\n" +
          "Name, Phone, DOB (DD/MM/YYYY), Address, Interests(optional)\n" +
          "Example: John Doe, +1234567890, 15/03/1990, 123 Main St NYC, reading;gaming;travel\n" +
          "\nType !cancel to cancel operation"
      );
      return;

    case "!viewfriends":
      const viewResponse = await handleViewFriends(userId, db);
      await message.reply(viewResponse);
      return;

    case "!deactivate":
      userStates.set(userId, "DEACTIVATING_FRIEND");
      await message.reply(
        "Please enter the name of the friend you want to deactivate:\n" +
          "\nType !cancel to cancel operation"
      );
      return;

    case "!editfriend":
      userStates.set(userId, "EDITING_FRIEND");
      await message.reply(
        "Please enter the details in this format:\n" +
          "FriendName, FieldToEdit, NewValue\n" +
          "Example: John Doe, phone, +1987654321\n" +
          "\nType !cancel to cancel operation"
      );
      return;

    case "!upcoming":
      const eventsResponse = await handleUpcomingEvents(userId, db);
      await message.reply(eventsResponse);
      return;

    case "!store":
      const storeResponse = await handleCheckStore();
      await message.reply(storeResponse);
      return;

    case "!ordergift":
      userStates.set(userId, "ORDERING_GIFT");
      await message.reply(
        "Please enter the order details in this format:\n" +
          "FriendName, ProductID, Gift Note\n" +
          "Example: John Doe, PROD123, Happy Birthday!\n" +
          "\nType !cancel to cancel operation"
      );
      return;
  }

  // Handle state-based responses
  switch (userStates.get(userId)) {
    case "ADDING_FRIEND":
      const addResponse = await handleAddFriend(message, userId, db);
      userStates.delete(userId);
      await message.reply(addResponse);
      return;

    case "DEACTIVATING_FRIEND":
      const deactivateResponse = await handleDeactivateFriend(
        message,
        userId,
        db
      );
      userStates.delete(userId);
      await message.reply(deactivateResponse);
      return;

    case "EDITING_FRIEND":
      const editResponse = await handleEditFriend(message, userId, db);
      userStates.delete(userId);
      await message.reply(editResponse);
      return;

    case "ORDERING_GIFT":
      const orderResponse = await handleOrderGift(message, userId, db);
      userStates.delete(userId);
      await message.reply(orderResponse);
      return;
  }

  // Default response
  await message.reply(
    "I didn't understand that command. Type !menu to see available options."
  );
});

whatsapp.initialize();

// Add birthday reminder checker
setInterval(async () => {
  const db = initializeDB();

  for (const userId in db.friends) {
    const events = getUpcomingEvents(userId, db);
    const birthdays = events.filter((event) => event.type === "birthday");

    for (const birthday of birthdays) {
      const friend = db.friends[userId].find((f) => f.name === birthday.name);
      const recommendations = getGiftRecommendations(friend);

      const message =
        `🎂 *Special Birthday Alert!* 🌸\n\n` +
        `✨ ${friend.name}'s birthday is coming up on ${friend.dob}!\n\n` +
        `💝 *Curated Gift Ideas Just for Them:*\n` +
        recommendations.map((gift, i) => `${i + 1}. 🎁 ${gift}`).join("\n") +
        `\n\n` +
        `🛍️ *Ready to make their day special?*\n` +
        `Browse more gifts: ${STORE_URL}\n` +
        `Or type *!sendgift* to order now!\n\n` +
        `Let's make this birthday unforgettable! 🌺`;

      await whatsapp.sendMessage(userId, message);
    }
  }
}, 24 * 60 * 60 * 1000); // Check once per day

// Add admin payment link handler
whatsapp.on("message", async (message) => {
  if (
    message.from === ADMIN_NUMBER &&
    message.body.startsWith("!sendpayment")
  ) {
    const [command, orderId, amount] = message.body.split(" ");
    const db = initializeDB();

    if (db.orders && db.orders[orderId]) {
      const order = db.orders[orderId];
      const paymentLink = `${PAYMENT_LINK_BASE}/${orderId}?amount=${amount}`;

      await whatsapp.sendMessage(
        order.userId,
        `🌸 *Your Bloom Gift Order* 🌸\n\n` +
          `Order ID: ${orderId}\n` +
          `Amount: $${amount}\n\n` +
          `💝 Complete your gift order here:\n` +
          `${paymentLink}\n\n` +
          `Thank you for spreading joy with Bloom! 🌺`
      );

      db.orders[orderId].status = "payment_sent";
      saveDB(db);
    }
  }
});
