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

// Add these flow configurations at the top
const addFriendFlow = {
  steps: ["name", "phone", "dob", "address", "interests"],
  prompts: {
    name: "What's your friend's name? 👤",
    phone: "Great! What's their phone number? 📱",
    dob: "When is their birthday? (DD/MM/YYYY) 🎂",
    address: "What's their address? 📍",
    interests:
      "What are their interests? (separate with commas) 💝\n\nSkip by typing '-'",
  },
  data: {},
};

const sendGiftFlow = {
  steps: ["friend", "product", "note"],
  prompts: {
    friend: "Who would you like to send a gift to? 👥",
    product:
      "Which gift would you like to send? (Enter Product ID) 🎁\n\nType *!store* to see our collection",
    note: "Add a personal message for your friend 💝",
  },
  data: {},
};

// Add these additional flows
const editFriendFlow = {
  steps: ["name", "field", "value"],
  prompts: {
    name: "Which friend would you like to edit? 👥",
    field:
      "What would you like to update? Choose a number:\n1️⃣ Phone Number\n2️⃣ Birthday\n3️⃣ Address\n4️⃣ Interests",
    value: "Please enter the new value 📝",
  },
  data: {},
};

const deactivateFriendFlow = {
  steps: ["name", "confirm"],
  prompts: {
    name: "Which friend would you like to deactivate? 👥",
    confirm:
      "Are you sure you want to deactivate this friend? Type 'yes' to confirm or 'no' to cancel",
  },
  data: {},
};

// Add these flow configurations at the top
const bulkAddFriendsFlow = {
  steps: ["confirm", "data"],
  prompts: {
    confirm:
      "📝 *Bulk Add Friends* 📝\n\n" +
      "You can add multiple friends at once using this format:\n\n" +
      "```\n" +
      "Name, Phone, DOB, Address, Interests\n" +
      "John Doe, 1234567890, 15/03/1990, 123 Main St, reading,gaming\n" +
      "Jane Smith, 9876543210, 25/12/1992, 456 Park Ave, cooking,art\n" +
      "```\n\n" +
      "Type *yes* to continue or *no* to go back to menu",
    data: "Please paste your friends list in the format shown above:",
  },
  data: {},
};

// Add wishlist related structures
const addWishlistFlow = {
  steps: ["item", "price", "link"],
  prompts: {
    item: "What would you like to add to your wishlist? 🎁",
    price: "What's the approximate price? (or type '-' if unknown) 💰",
    link: "Add a link to the item (or type '-' if none) 🔗",
  },
  data: {},
};

// Update the handleMainMenu function
const handleMainMenu = async () => {
  return (
    `🌸 *Welcome to Bloom Gifting Agent* 🌸\n\n` +
    `Choose an option by typing its number:\n\n` +
    `1️⃣ Add a Friend\n` +
    `2️⃣ View Friends\n` +
    `3️⃣ Send a Gift\n` +
    `4️⃣ Check Upcoming Events\n` +
    `5️⃣ Browse Gift Store\n` +
    `6️⃣ Edit Friend Details\n` +
    `7️⃣ Deactivate Friend\n` +
    `8️⃣ Edit Your Profile\n` +
    `9️⃣ View/Cancel Orders\n` +
    `🔟 Bulk Add Friends\n` +
    `1️⃣1️⃣ Manage My Wishlist\n` +
    `1️⃣2️⃣ View Friend's Wishlist\n\n` +
    `❌ Type *!cancel* anytime to cancel operation\n\n` +
    `Let's make every moment special! 🌺`
  );
};

// Add this helper function for flow management
const handleFlowStep = async (userId, flow, currentStep, message, db) => {
  const stepIndex = flow.steps.indexOf(currentStep);
  flow.data[currentStep] = message.body.trim();

  // If we've reached the last step
  if (stepIndex === flow.steps.length - 1) {
    if (flow === addFriendFlow) {
      // Process friend addition
      const friend = {
        name: flow.data.name,
        phone: flow.data.phone,
        dob: flow.data.dob,
        address: flow.data.address,
        interests:
          flow.data.interests === "-"
            ? []
            : flow.data.interests.split(",").map((i) => i.trim()),
        active: true,
        addedAt: new Date().toISOString(),
      };

      if (!db.friends[userId]) db.friends[userId] = [];
      db.friends[userId].push(friend);
      saveDB(db);

      // Clear flow data
      flow.data = {};
      userStates.delete(userId);

      return `🌸 Wonderful! ${friend.name} has been added to your garden! 🌺\n\nType *!menu* to continue`;
    } else if (flow === sendGiftFlow) {
      // Process gift sending
      // get friendlist
      const friendname = db.friends[userId][flow.data.friend - 1];
      const giftResponse = await handleSendGift(
        {
          body:
            friendname.name + "," + flow.data.product + "," + flow.data.note,
        },
        userId,
        db
      );

      // Clear flow data
      flow.data = {};
      userStates.delete(userId);

      return giftResponse;
    }

    if (flow === editFriendFlow) {
      const friend = db.friends[userId]?.find(
        (f) => f.name.toLowerCase() === flow.data.name.toLowerCase() && f.active
      );
      if (!friend) {
        return "Friend not found. Please try again with a valid friend name.";
      }

      const fieldMap = {
        1: "phone",
        2: "dob",
        3: "address",
        4: "interests",
      };

      const field = fieldMap[flow.data.field];
      if (!field) {
        return "Invalid field selection. Please try again.";
      }

      friend[field] =
        field === "interests"
          ? flow.data.value.split(",").map((i) => i.trim())
          : flow.data.value;
      saveDB(db);
      return `🌸 Successfully updated ${friend.name}'s ${field}!\n\nType *2* to view your friends.`;
    }

    if (flow === deactivateFriendFlow) {
      if (flow.data.confirm.toLowerCase() !== "yes") {
        return "Operation cancelled. Your friend remains active.";
      }

      const friend = db.friends[userId]?.find(
        (f) => f.name.toLowerCase() === flow.data.name.toLowerCase() && f.active
      );
      if (!friend) {
        return "Friend not found. Please try again with a valid friend name.";
      }

      friend.active = false;
      saveDB(db);
      return `🌸 ${friend.name} has been deactivated from your friend list.`;
    }
  }

  // Move to next step
  const nextStep = flow.steps[stepIndex + 1];
  userStates.set(userId, { flow, currentStep: nextStep });
  return flow.prompts[nextStep];
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
const STORE_URL = "https://bloomstore.neocities.org/";
const PAYMENT_LINK_BASE = "https://payment.example.com";
const ADMIN_NUMBER = "917709439025@c.us"; // Replace with actual admin WhatsApp number

const FESTIVALS = [
  { name: "Christmas", date: "25/12/2025", type: "festival" },
  { name: "Valentine's Day", date: "14/02/2025", type: "festival" },
  { name: "Mother's Day", date: "12/05/2025", type: "festival" },
  { name: "Father's Day", date: "16/06/2025", type: "festival" },
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
      `Type *2️⃣* to see all your friends 🌺`
    );
  }

  return (
    `🌸 *Upcoming Celebrations* 🌸\n\n` +
    events
      .map((event, index) => {
        const dateStr = event.date.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        return (
          `${index + 1}️⃣ *${event.name}*\n` +
          `   📅 ${dateStr}\n` +
          `   ${event.type === "birthday" ? "🎂" : "🎉"} ${event.type}\n` +
          `   ${event.type === "birthday" ? "🎁 Type *3️⃣* to send a gift" : ""}`
        );
      })
      .join("\n\n") +
    `\n\n🛍️ Type *5️⃣* to browse our curated gift collection!`
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

const handleSendGift = async (message, userId, db) => {
  const [friendName, productId, giftNote] = message.body
    .split(",")
    .map((item) => item.trim());

  if (!friendName || !productId || !giftNote) {
    return (
      `🌸 Please provide all required information:\n\n` +
      `Format: FriendName, ProductID, Gift Note\n` +
      `Example: John Doe, A1B, Happy Birthday! Enjoy your special day!\n\n` +
      `Type *!cancel* to cancel operation`
    );
  }

  // Validate friend exists
  const friend = db.friends[userId]?.find(
    (f) => f.name.toLowerCase() === friendName.toLowerCase() && f.active
  );

  if (!friend) {
    return (
      `🌸 Friend not found. Please check the name and try again.\n\n` +
      `Type *!viewfriends* to see your friend list.`
    );
  }

  // Validate product exists
  const product = db.gifts[productId];
  if (!product) {
    return `🌸 Product ID not found. Please check our store:\n${STORE_URL}`;
  }

  // Create order details
  const orderId = `ORDER${Date.now()}`;

  // Store order in DB
  if (!db.orders) db.orders = {};
  db.orders[orderId] = {
    userId,
    friendName,
    productId,
    note: giftNote,
    status: "pending_payment",
    createdAt: new Date().toISOString(),
  };
  saveDB(db);

  // Send confirmation to user
  const userConfirmation =
    `🎁 *Your gift order has been placed!* 🌸\n\n` +
    `Order ID: ${orderId}\n` +
    `For: ${friendName}\n` +
    `Gift: ${product.name}\n` +
    `Note: "${giftNote}"\n\n` +
    `We'll send you the payment link shortly! 💝`;

  // Send notification to admin
  const adminNotification =
    `🌟 *New Gift Order!* 🌟\n\n` +
    `Order ID: ${orderId}\n` +
    `Product: ${product.name} (${productId})\n` +
    `Price: ₹${product.price}\n` +
    `For: ${friendName}\n` +
    `Note: "${giftNote}"\n\n` +
    `Please send payment link using:\n` +
    `!sendpayment ${orderId} ${product.price}`;

  await whatsapp.sendMessage(ADMIN_NUMBER, adminNotification);
  return userConfirmation;
};

// Add new helper functions
const handleEditProfile = async (message, userId, db) => {
  const newName = message.body.trim();
  db.users[userId].name = newName;
  saveDB(db);
  return `✨ Your name has been updated to *${newName}*! 🌸\n\nType *!menu* to continue`;
};

const handleViewOrders = async (userId, db) => {
  if (!db.orders)
    return "You don't have any orders yet! 🌸\n\nType *5️⃣* to browse our gift collection";

  const userOrders = Object.entries(db.orders)
    .filter(
      ([_, order]) => order.userId === userId && order.status !== "cancelled"
    )
    .map(
      ([orderId, order], index) =>
        `${index + 1}️⃣ Order ID: *${orderId}*\n` +
        `   🎁 Gift: ${db.gifts[order.productId].name}\n` +
        `   👤 For: ${order.friendName}\n` +
        `   📝 Status: ${order.status}\n` +
        `   To cancel, type: *!cancelorder ${orderId}*`
    );

  if (userOrders.length === 0) {
    return "You don't have any active orders! 🌸\n\nType *5️⃣* to browse our gift collection";
  }

  return (
    `🛍️ *Your Orders* 🛍️\n\n` +
    userOrders.join("\n\n") +
    `\n\nType the cancel command to cancel any order`
  );
};

const handleCancelOrder = async (orderId, userId, db) => {
  if (!db.orders?.[orderId]) {
    return "🌸 Order not found. Please check the order ID and try again.";
  }

  const order = db.orders[orderId];
  if (order.userId !== userId) {
    return "🌸 This order doesn't belong to you.";
  }

  if (order.status === "cancelled") {
    return "This order is already cancelled.";
  }

  if (order.status === "completed") {
    return "🌸 Sorry, completed orders cannot be cancelled.";
  }

  order.status = "cancelled";
  saveDB(db);

  // Notify admin
  const adminMessage =
    `🚫 *Order Cancelled* 🚫\n\n` +
    `Order ID: ${orderId}\n` +
    `Customer: ${db.users[userId].name}\n` +
    `Product: ${db.gifts[order.productId].name}`;
  await whatsapp.sendMessage(ADMIN_NUMBER, adminMessage);

  return (
    `🌸 Your order has been cancelled successfully.\n\n` +
    `Order ID: ${orderId}\n` +
    `Type *5️⃣* to browse more gifts!`
  );
};

// Add new helper functions for wishlist management
const handleAddWishlistItem = async (userId, item, price, link, db) => {
  if (!db.wishlists) db.wishlists = {};
  if (!db.wishlists[userId]) db.wishlists[userId] = [];

  db.wishlists[userId].push({
    item,
    price: price === "-" ? "Not specified" : price,
    link: link === "-" ? null : link,
    addedAt: new Date().toISOString(),
  });

  saveDB(db);
  return `✨ Added "${item}" to your wishlist!\n\nType *11* to view your wishlist`;
};

const handleViewWishlist = async (userId, db) => {
  if (!db.wishlists?.[userId] || db.wishlists[userId].length === 0) {
    return "Your wishlist is empty! Type *11* and select 'Add Item' to start adding items.";
  }

  return (
    `🎁 *Your Wishlist* 🎁\n\n` +
    db.wishlists[userId]
      .map(
        (item, index) =>
          `${index + 1}️⃣ *${item.item}*\n` +
          `   💰 ${item.price}\n` +
          `   ${item.link ? `🔗 ${item.link}\n` : ""}`
      )
      .join("\n")
  );
};

// Add bulk friend processing function
const handleBulkAddFriends = async (data, userId, db) => {
  const lines = data.split("\n").filter((line) => line.trim());
  const results = {
    success: [],
    failed: [],
  };

  for (const line of lines) {
    try {
      const [name, phone, dob, address, interests] = line
        .split(",")
        .map((item) => item.trim());

      if (!name || !phone || !dob || !address) {
        results.failed.push(`${name || "Unknown"} - Missing required fields`);
        continue;
      }

      const friend = {
        name,
        phone,
        dob,
        address,
        interests: interests ? interests.split(" ").map((i) => i.trim()) : [],
        active: true,
        addedAt: new Date().toISOString(),
      };

      if (!db.friends[userId]) db.friends[userId] = [];
      db.friends[userId].push(friend);
      results.success.push(name);
    } catch (error) {
      results.failed.push(
        `${line.split(",")[0] || "Unknown"} - Invalid format`
      );
    }
  }

  saveDB(db);

  return (
    `🌸 *Bulk Add Results* 🌸\n\n` +
    `✅ Successfully added ${results.success.length} friends:\n` +
    results.success.map((name) => `   • ${name}`).join("\n") +
    (results.failed.length
      ? `\n\n❌ Failed to add ${results.failed.length} friends:\n` +
        results.failed.map((error) => `   • ${error}`).join("\n")
      : "") +
    `\n\nType *2* to view all your friends!`
  );
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

  // Registration check with friendly message
  if (!isRegistered(userId, db)) {
    if (!userStates.has(userId)) {
      userStates.set(userId, "REGISTERING");
      await message.reply(
        `🌸 *Welcome to Bloom!* 🌸\n\n` +
          `We're excited to help you celebrate life's special moments.\n\n` +
          `To get started, please share your name with us! 💝`
      );
      return;
    } else if (userStates.get(userId) === "REGISTERING") {
      const response = await handleRegistration(message, userId, db);
      userStates.delete(userId);
      await message.reply(response);
      return;
    }
  }

  // Handle numeric menu selections for new options
  if (!userStates.has(userId) && /^[1-9]$/.test(message.body)) {
    switch (message.body) {
      case "1":
        userStates.set(userId, { flow: addFriendFlow, currentStep: "name" });
        await message.reply(addFriendFlow.prompts.name);
        return;

      case "2":
        const friends = db.friends[userId] || [];
        if (friends.length === 0) {
          await message.reply(
            "🌸 You haven't added any friends yet!\n\nType *1* to add your first friend."
          );
          return;
        }
        const viewResponse =
          "🌸 *Your Friends* 🌸\n\n" +
          friends
            .filter((f) => f.active)
            .map(
              (friend, index) =>
                `${index + 1}️⃣ *${friend.name}*\n` +
                `   📱 ${friend.phone}\n` +
                `   🎂 ${friend.dob}\n` +
                `   📍 ${friend.address}\n` +
                `   💝 Interests: ${friend.interests.join(", ") || "-"}`
            )
            .join("\n\n");
        await message.reply(viewResponse);
        return;

      case "3":
        const activeFriends = (db.friends[userId] || []).filter(
          (f) => f.active
        );
        if (activeFriends.length === 0) {
          await message.reply(
            "🌸 You haven't added any friends yet!\n\nType *1* to add your first friend."
          );
          return;
        }
        userStates.set(userId, { flow: sendGiftFlow, currentStep: "friend" });
        const friendList =
          "Choose a friend by typing their number:\n\n" +
          activeFriends.map((f, i) => `${i + 1}️⃣ ${f.name}`).join("\n");
        await message.reply(friendList);
        return;

      case "4":
        const eventsResponse = await handleUpcomingEvents(userId, db);
        await message.reply(eventsResponse);
        return;

      case "5":
        const storeResponse =
          "🎁 *Our Gift Collection* 🎁\n\n" +
          Object.entries(db.gifts)
            .filter(([key]) => key !== "categories")
            .map(
              ([id, gift], index) =>
                `${index + 1}️⃣ *${id}* - ${gift.name}\n` +
                `💝 ${gift.description}\n` +
                `💰 ₹${gift.price}`
            )
            .join("\n\n") +
          "\n\nTo send a gift, type *3️⃣* and follow the prompts!";
        await message.reply(storeResponse);
        return;

      case "6":
        if (!(db.friends[userId] || []).filter((f) => f.active).length) {
          await message.reply(
            "🌸 You haven't added any friends yet!\n\nType *1* to add your first friend."
          );
          return;
        }
        userStates.set(userId, { flow: editFriendFlow, currentStep: "name" });
        await message.reply(editFriendFlow.prompts.name);
        return;

      case "7":
        if (!(db.friends[userId] || []).filter((f) => f.active).length) {
          await message.reply(
            "🌸 You haven't added any friends yet!\n\nType *1* to add your first friend."
          );
          return;
        }
        userStates.set(userId, {
          flow: deactivateFriendFlow,
          currentStep: "name",
        });
        await message.reply(deactivateFriendFlow.prompts.name);
        return;

      case "8":
        userStates.set(userId, "EDITING_PROFILE");
        await message.reply(
          `✨ *Edit Your Profile* ✨\n\n` +
            `Your current name is: *${db.users[userId].name}*\n\n` +
            `Please enter your new name or type *!cancel* to keep your current name`
        );
        return;

      case "9":
        const ordersResponse = await handleViewOrders(userId, db);
        await message.reply(ordersResponse);
        return;

      case "10":
        userStates.set(userId, {
          flow: bulkAddFriendsFlow,
          currentStep: "confirm",
        });
        await message.reply(bulkAddFriendsFlow.prompts.confirm);
        return;

      case "11":
        const wishlistMenu =
          `🎁 *Your Wishlist Menu* 🎁\n\n` +
          `1️⃣ View My Wishlist\n` +
          `2️⃣ Add New Item\n` +
          `3️⃣ Remove Item\n\n` +
          `Choose an option or type *!cancel* to go back`;
        await message.reply(wishlistMenu);
        return;

      case "12":
        const friends1 = db.friends[userId]?.filter((f) => f.active) || [];
        if (friends1.length === 0) {
          await message.reply(
            "You haven't added any friends yet! Type *1* to add friends."
          );
          return;
        }
        const friendsList =
          `👥 *Choose a friend to view their wishlist:*\n\n` +
          friends1.map((f, i) => `${i + 1}️⃣ ${f.name}`).join("\n");
        await message.reply(friendsList);
        return;
    }
  }

  // Handle order cancellation command
  if (message.body.startsWith("!cancelorder")) {
    const orderId = message.body.split(" ")[1];
    const response = await handleCancelOrder(orderId, userId, db);
    await message.reply(response);
    return;
  }

  // Handle flow states
  if (userStates.has(userId)) {
    const state = userStates.get(userId);
    if (state.flow && state.currentStep) {
      const response = await handleFlowStep(
        userId,
        state.flow,
        state.currentStep,
        message,
        db
      );
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

    case "!sendgift":
      userStates.set(userId, "SENDING_GIFT");
      await message.reply(
        "Please enter the gift details in this format:\n" +
          "FriendName, ProductID, Gift Note\n" +
          "Example: John Doe, A1B, Happy Birthday! Enjoy your special day!\n\n" +
          "Type *!cancel* to cancel operation"
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

    case "SENDING_GIFT":
      const giftResponse = await handleSendGift(message, userId, db);
      userStates.delete(userId);
      await message.reply(giftResponse);
      return;

    case "EDITING_PROFILE":
      const profileResponse = await handleEditProfile(message, userId, db);
      userStates.delete(userId);
      await message.reply(profileResponse);
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
        recommendations.map((gift, i) => `${i + 1}️⃣ 🎁 ${gift}`).join("\n") +
        `\n\n` +
        `🛍️ *Ready to make their day special?*\n` +
        `Type *5️⃣* to browse more gifts\n` +
        `Or type *3️⃣* to send a gift now!\n\n` +
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
