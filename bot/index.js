const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const { createClient } = require("@supabase/supabase-js");
const schedule = require("node-schedule");
require("dotenv").config();

const ADMIN_NUMBER = "917709439025@c.us";

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const whatsapp = new Client({
  authStrategy: new LocalAuth(),
});

// Add these WhatsApp event handlers before the commands object
whatsapp.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
  console.log("QR Code generated. Please scan with WhatsApp.");
});

whatsapp.on("ready", () => {
  console.log("Client is ready!");
  commands.scheduleNotifications(); // Start scheduling notifications when client is ready
});

whatsapp.on("message", async (message) => {
  console.log("Received message:", message.body);
  // Handle incoming messages here if needed
});

const commands = {
  // Function to format event message
  formatEventMessage: function (event, daysUntil) {
    if (daysUntil === 7) {
      return `🎁 *Upcoming Friend Event in a Week!*

Friend: ${event.friends.name}
Event: ${event.name}
${event.description ? `Description: ${event.description}` : ""}
Date: ${new Date(event.date).toLocaleDateString()}

_One week to go! Time to start planning_ 🌸

${event.description ? `\n💭 Remember: ${event.description}` : ""}`;
    } else {
      // 1 day notification
      return `🎯 *Friend Event Tomorrow!*

Don't forget! Tomorrow is ${event.friends.name}'s ${event.name}!
Date: ${new Date(event.date).toLocaleDateString()}
${event.description ? `\n📝 Note: ${event.description}` : ""}

_Make it special!_ ✨`;
    }
  },

  // Function to check and send event notifications
  checkAndSendEventNotifications: async function (daysAhead) {
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysAhead);

      // Format dates to match your database format
      const targetDateStr = targetDate.toISOString().split("T")[0];

      const { data: upcomingEvents, error } = await supabase
        .from("events")
        .select(
          `
          *,
          friends (
            name,
            contact
          ),
          profiles!events_user_id_fkey (
            phone
          )
        `
        )
        .eq("date", targetDateStr);

      if (error) throw error;

      // Send notifications for each event
      for (const event of upcomingEvents || []) {
        // Check if profile exists and has phone number
        if (!event.profiles) {
          console.log(`No profile found for event: ${event.name}`);
          continue;
        }

        if (!event.profiles.phone) {
          console.log(`No phone number found for event: ${event.name}`);
          continue;
        }

        // Format the WhatsApp number - remove '+' and add @c.us
        const whatsappNumber = `${event.profiles.phone.replace("+", "")}@c.us`;

        try {
          const message = this.formatEventMessage(event, daysAhead);
          await whatsapp.sendMessage(whatsappNumber, message);
          console.log(
            `Notification sent to ${whatsappNumber} for event: ${event.name}`
          );
        } catch (sendError) {
          console.error(
            `Failed to send message to ${whatsappNumber}:`,
            sendError
          );
        }
      }
    } catch (error) {
      console.error("Error checking events:", error);
    }
  },

  // Schedule notifications
  scheduleNotifications: function () {
    // Run at 10 AM every day for 7-day notifications
    schedule.scheduleJob("0 10 * * *", async () => {
      await this.checkAndSendEventNotifications(7);
    });

    // Run at 10 AM every day for 1-day notifications
    schedule.scheduleJob("0 10 * * *", async () => {
      await this.checkAndSendEventNotifications(1);
    });
  },

  // Initialize bot and start notification service
  init: function () {
    whatsapp.on("ready", () => {
      console.log("WhatsApp bot is ready!");
      this.scheduleNotifications();
    });

    // Add error handling for WhatsApp client
    whatsapp.on("disconnected", (reason) => {
      console.log("WhatsApp client was disconnected:", reason);
    });

    whatsapp.on("auth_failure", (msg) => {
      console.error("WhatsApp authentication failed:", msg);
    });

    // Add a command to manually check upcoming events (for testing)
    commands["!checkevents"] = async (message) => {
      if (message.from !== ADMIN_NUMBER) {
        return "⚠️ Sorry, this command is for administrators only.";
      }

      try {
        await this.checkAndSendEventNotifications(7);
        await this.checkAndSendEventNotifications(1);
        return "✅ Event check completed!";
      } catch (error) {
        console.error("Manual event check failed:", error);
        return "❌ Error checking events. Please check the logs.";
      }
    };
  },
};

commands.init();
whatsapp.initialize(); // Add this line to start the WhatsApp client
