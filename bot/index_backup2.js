const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const db = require("./database");

const ADMIN_NUMBER = "917709439025@c.us";

const whatsapp = new Client({
  authStrategy: new LocalAuth(),
});

const WELCOME_MESSAGE = `🌸 Welcome to Bloom! We're here to help you be an amazing friend. 

To get started, please register with:
!register <your name>

Visit our gift catalog at: https://bloomstore.neocities.org/
We'll help you remember birthdays and make gifting effortless! 🎁`;

const commands = {
  "!register": async (message, args) => {
    const name = args.join(" ");
    if (!name) return "🌺 Please provide your name: !register <your name>";
    db.addUser(message.from, name);
    return `🌸 Welcome to the Bloom family, ${name}! 

We're excited to help you nurture your friendships. Use !help to see what we can do together! ✨`;
  },

  "!addfriend": async (message, args) => {
    // Format: !addfriend number name address
    if (args.length < 3) return "Usage: !addfriend <number> <name> <address>";
    const [number, name, ...address] = args;
    const friendNumber = `${number}@c.us`;
    db.addFriend(message.from, friendNumber, name, address.join(" "));
    return `Friend ${name} added successfully!`;
  },

  "!wishlist": async (message, args) => {
    if (!args.length)
      return "✨ Manage your wishlist:\n!wishlist add <items...>\n!wishlist remove <items...>\n!wishlist show";

    const action = args[0].toLowerCase();
    const items = args.slice(1);

    switch (action) {
      case "add":
        if (!items.length)
          return "🎁 What would you like to add to your wishlist?";
        db.addToWishlist(message.from, items);
        return "✨ Items added to your wishlist! Your friends will love this!";

      case "remove":
        if (!items.length) return "🌸 Which items would you like to remove?";
        db.removeFromWishlist(message.from, items);
        return "✨ Items removed from your wishlist!";

      case "show":
        const user = db.getUser(message.from);
        if (!user?.wishlist?.length)
          return "🎁 Your wishlist is empty! Add some items you'd love to receive!";
        return `✨ Your Wishlist:\n${user.wishlist
          .map((item, i) => `${i + 1}. ${item}`)
          .join("\n")}`;

      default:
        return "Invalid action. Use: add, remove, or show";
    }
  },

  "!friendwishlist": async (message, args) => {
    // Format: !friendwishlist friendName
    if (!args.length)
      return "🎁 Whose wishlist would you like to see? Usage: !friendwishlist <friend_name>";

    const friendName = args[0];
    const friend = db.getFriend(message.from, friendName);
    if (!friend) {
      return "Friend not found! Make sure to use their exact name (without spaces)";
    }

    const friendNumber = db.getFriendNumberByName(message.from, friendName);
    const friendData = db.getUser(friendNumber);

    if (!friendData?.wishlist?.length) {
      return `${friend.name}'s wishlist is empty!`;
    }

    return `${friend.name}'s wishlist:\n${friendData.wishlist
      .map((item, i) => `${i + 1}. ${item}`)
      .join("\n")}`;
  },

  "!sendgift": async (message, args) => {
    console.log("Gift command received:", {
      messageBody: message.body,
      args: args,
    });

    // If no additional input, show the help message
    if (message.body.trim() === "!sendgift") {
      return `🎁 Ready to make someone's day special?

Send your gift details in this format:
!sendgift
friend_name
product_id
your_message

Available products:
${Object.entries(db.getProducts())
  .map(([id, product]) => `${id}: ${product.name} - ₹${product.price}`)
  .join("\n")}

Example:
!sendgift
priya
P1
Happy birthday! Hope you enjoy this gift 🎉`;
    }

    try {
      // Split the message into lines and remove empty lines and whitespace
      const lines = message.body
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      console.log("Parsed lines:", lines);

      // Remove the !sendgift command from the first line
      lines.shift();

      // Check if we have all required fields
      if (lines.length < 2) {
        return `⚠️ Please provide all details in this format:

!sendgift
friend_name
product_id
your_message (optional)`;
      }

      const [friendName, productId, ...messageParts] = lines;
      const giftMessage = messageParts.join("\n").trim();

      console.log("Parsed gift details:", {
        friendName,
        productId,
        giftMessage,
      });

      const friend = db.getFriend(message.from, friendName);
      if (!friend) {
        return "⚠️ Friend not found! Make sure to use their exact name (without spaces)";
      }

      const product = db.checkProduct(productId);
      if (!product) {
        return `⚠️ Invalid product ID. Available products:
${Object.entries(db.getProducts())
  .map(([id, p]) => `${id}: ${p.name} - ₹${p.price}`)
  .join("\n")}`;
      }

      const friendNumber = db.getFriendNumberByName(message.from, friendName);

      // Notify admin
      await whatsapp.sendMessage(
        ADMIN_NUMBER,
        `🎁 New gift order!

From: ${message.from}
To: ${friend.name} (${friendNumber})
Product: ${product.name} (${productId})
Price: ₹${product.price}
Message: ${giftMessage || "No message"}`
      );

      return `✨ Gift request sent successfully!

🎁 Order Details:
To: ${friend.name}
Product: ${product.name}
Price: ₹${product.price}
${giftMessage ? `\nYour message: ${giftMessage}` : ""}

We'll send you payment details shortly! 💝`;
    } catch (error) {
      console.error("Error in sendgift command:", error);
      return `⚠️ Error: ${error.message}`;
    }
  },

  "!contact": async (message, args) => {
    const note = args.join(" ");
    await whatsapp.sendMessage(
      ADMIN_NUMBER,
      `💌 Customer care message from ${message.from}:\n${note}`
    );
    return "🌸 Message received! Our friendly team will get back to you soon!";
  },

  "!friend": async (message, args) => {
    console.log("Friend command received:", {
      messageBody: message.body,
      args: args,
    });

    // If no additional input, show the help message
    if (message.body.trim() === "!friend") {
      return `🌷 Let's add a friend! Send each detail on a new line:

!friend
+country_code_phone_number
friend_name
DD/MM/YYYY
address
interests

Example:
!friend
+919860264506
priya
08/01/1978
pune
singing,watching series,cooking,skincare

Note: Phone number must include country code (e.g., +91 for India)`;
    }

    try {
      // Split the message into lines and remove empty lines and whitespace
      const lines = message.body
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      console.log("Parsed lines:", lines);

      // Remove the !friend command from the first line
      lines.shift();

      // Check if we have all required fields
      if (lines.length < 5) {
        return `⚠️ Please provide all details in this format:

!friend
+country_code_phone_number
friend_name
DD/MM/YYYY
address
interests`;
      }

      const [phoneWithCode, name, dob, address, interests] = lines;

      console.log("Parsed friend details:", {
        phoneWithCode,
        name,
        dob,
        address,
        interests,
      });

      // Validate phone number format (must start with + followed by digits)
      if (!phoneWithCode.match(/^\+\d{10,14}$/)) {
        return "⚠️ Please provide a valid phone number with country code (e.g., +919876543210)";
      }

      // Strip the + from the phone number
      const number = phoneWithCode.substring(1);

      // Validate date format
      if (!dob.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        return "⚠️ Date must be in DD/MM/YYYY format";
      }

      const friendNumber = `${number}@c.us`;

      const result = db.updateFriend(message.from, friendNumber, {
        name,
        dob,
        address,
        interests,
      });

      return result
        ? `✅ Friend ${name} added successfully!
        
📱 Phone: ${phoneWithCode}
🎂 Birthday: ${dob}
📍 Address: ${address}
❤️ Interests: ${interests}`
        : "❌ Failed to add friend. Please try again.";
    } catch (error) {
      console.error("Error in friend command:", error);
      return `⚠️ Error: ${error.message}`;
    }
  },

  "!setfriends": async (message, args) => {
    // Format: !setfriends number1|name1|dob1|address1|interests1 ## number2|name2|dob2|address2|interests2
    if (!args.length)
      return "Usage: !setfriends <friend1_details> ## <friend2_details> ...";

    const friendsList = args
      .join(" ")
      .split("##")
      .map((friend) => {
        const [number, name, dob, address, interests] = friend
          .trim()
          .split("|")
          .map((item) => item.trim());
        return [`${number}@c.us`, { name, dob, address, interests }];
      });

    const friendsObject = Object.fromEntries(friendsList);
    db.setFriendsList(message.from, friendsObject);
    return "Friends list updated successfully!";
  },

  "!setwishlist": async (message, args) => {
    // Format: !setwishlist item1 | item2 | item3
    if (!args.length) return "Usage: !setwishlist <item1> | <item2> | ...";
    const items = args
      .join(" ")
      .split("|")
      .map((item) => item.trim());
    db.setWishlist(message.from, items);
    return "Wishlist updated successfully!";
  },

  "!friends": async (message) => {
    const user = db.getUser(message.from);
    if (!user || !user.friends) return "No friends found!";
    return Object.entries(user.friends)
      .map(
        ([number, data]) =>
          `${data.name} (${number})
         Birthday: ${data.dob}
         Address: ${data.address}
         Interests: ${data.interests}`
      )
      .join("\n\n");
  },

  "!event": async (message, args) => {
    if (!args.length) {
      return `🎉 Add an event for your friend!

Send details in this format:
!event
friend_name
DD/MM
description
yes/no (recurring)

Examples:
!event
John_Doe
25/12
Birthday party
yes`;
    }

    const [friendName, date, description, recurring] = message.body
      .split("\n")
      .slice(1) // Skip the command line
      .map((arg) => arg.trim());

    if (!friendName || !date || !description) {
      return "Please provide friend name, date, and description separated by |";
    }

    try {
      const success = db.addFriendEvent(message.from, friendName, {
        date,
        description,
        recurring: recurring?.toLowerCase() === "yes",
      });

      return success
        ? `🎉 Event added for ${friendName}!
Date: ${date}
Description: ${description}
${
  recurring?.toLowerCase() === "yes"
    ? "🔄 This event will repeat yearly"
    : "📅 This is a one-time event"
}`
        : "Friend not found or invalid event details";
    } catch (error) {
      return error.message;
    }
  },

  "!help": async () => {
    return `🌸 *Bloom - Your Thoughtful Gifting Companion* 🎁

*Account*
• !r <name> - Register yourself
• !contact <message> - Reach support team

*Friend Management*
• !friend - Add/edit friend
  Format:
  phone_number
  friend_name
  DD/MM/YYYY
  address
  interests

• !friends - View all friends

• !event - Add friend event
  Format:
  friend_name
  DD/MM
  description
  yes/no (recurring)

*Wishlist*
• !w add <items> - Add to wishlist
• !w show - View your wishlist
• !w remove <items> - Remove items
• !fw <friend_name> - See friend's wishlist

*Gifting*
• !g - Send a gift
  Format:
  friend_name
  productID
  your_message

*Date Formats*
• Birthdays: DD/MM/YYYY
• Events: DD/MM

🏪 Browse gifts: bloomstore.neocities.org

Need help? Use !contact! ✨`;
  },
};

const COMMAND_ALIASES = {
  "!r": "!register",
  "!f": "!friend",
  "!w": "!wishlist",
  "!fw": "!friendwishlist",
  "!g": "!sendgift",
  "!h": "!help",
};

const checkAndSendReminders = async () => {
  const data = readDB();

  for (const [userNumber, user] of Object.entries(data.users)) {
    const upcomingEvents = db.checkUpcomingEvents(userNumber);

    if (upcomingEvents.length) {
      for (const event of upcomingEvents) {
        const suggestions = db.getRandomGiftSuggestion(event.interests);
        const message = `🎉 ${event.friendName}'s ${
          event.description
        } is coming up on ${event.date}!

Gift Suggestions based on their interests (${event.interests}):
${suggestions
  .map((product) => `- ${product.name} (₹${product.price})`)
  .join("\n")}

Send a gift with:
!g ${event.friendName}|<product_id>|<your message>

Browse more gifts at: https://bloomstore.neocities.org/`;

        await whatsapp.sendMessage(userNumber, message);
      }
    }
  }
};

const scheduleReminders = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0); // Set to 9 AM

  const timeUntilNextCheck = tomorrow - now;

  console.log(
    `Next reminder check scheduled for: ${tomorrow.toLocaleString()}`
  );

  // Schedule first check
  setTimeout(() => {
    // Run the first check
    checkAndSendReminders();

    // Then setup daily interval
    setInterval(checkAndSendReminders, 24 * 60 * 60 * 1000);
  }, timeUntilNextCheck);
};

// Start the reminder scheduler
scheduleReminders();

whatsapp.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

whatsapp.on("ready", () => {
  console.log("Client is ready!");
});

whatsapp.on("message", async (message) => {
  console.log("Received message:", message.body);

  const user = db.getUser(message.from);

  // If user is not registered, handle registration
  if (!user) {
    if (!message.body.startsWith("!register")) {
      await whatsapp.sendMessage(message.from, WELCOME_MESSAGE);
      return;
    }
  }

  // Handle commands for registered users
  if (!message.body.startsWith("!")) {
    if (user) {
      await whatsapp.sendMessage(
        message.from,
        `🌸 Hi ${user.name}! How can we help you today? Send !help to see what we can do together! ✨`
      );
    }
    return;
  }

  // Get the command from the first line
  const firstLine = message.body.split("\n")[0].trim();
  const [commandName, ...firstLineArgs] = firstLine.split(" ");
  const actualCommand = COMMAND_ALIASES[commandName] || commandName;

  console.log({
    originalCommand: commandName,
    actualCommand,
    hasHandler: !!commands[actualCommand],
    messageBody: message.body,
    firstLine,
    firstLineArgs,
  });

  const handler = commands[actualCommand];

  if (handler) {
    try {
      // Pass the entire message object and first line args
      const response = await handler(message, firstLineArgs);
      if (response) {
        await whatsapp.sendMessage(message.from, response);
      }
    } catch (error) {
      console.error("Error processing command:", error);
      await whatsapp.sendMessage(message.from, `⚠️ Error: ${error.message}`);
    }
  } else {
    await whatsapp.sendMessage(
      message.from,
      "❌ Command not recognized. Use !help to see available commands."
    );
  }
});

whatsapp.initialize();
