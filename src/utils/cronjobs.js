console.log("🔥 Cron file loaded");
// utils/cronjobs.js

const cron = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const ConnectionRequestModel = require("../models/connectionRequest");
const sendEmail = require("./sendEmail");

// Schedule: Every day at 9:32 PM
// Format: Minute Hour Day Month DayOfWeek
// For testing use "* * * * *" (every minute)
cron.schedule("32 21 * * *", async () => {
  console.log("✅ Cron job started...");

  try {
    // 1️⃣ Get yesterday's date
    const yesterday = subDays(new Date(), 1);

    // 2️⃣ Get start and end time of yesterday
    const yesterdayStart = startOfDay(yesterday);
    const yesterdayEnd = endOfDay(yesterday);

    console.log("📅 Date Range:", yesterdayStart, "to", yesterdayEnd);

    // 3️⃣ Find all pending "Interested" requests created yesterday
    const pendingRequests = await ConnectionRequestModel.find({
      status: "Interested",
      createdAt: {
        $gte: yesterdayStart,
        $lt: yesterdayEnd,
      },
    }).populate("fromUserId toUserId");

    console.log("📦 Pending Requests Found:", pendingRequests.length);

    if (pendingRequests.length === 0) {
      console.log("⚠️ No pending requests found.");
      return;
    }

    // 4️⃣ Extract unique email IDs
    const listOfEmails = [
      ...new Set(
        pendingRequests
          .map((req) => req.toUserId?.emailId)
          .filter(Boolean) // remove undefined/null
      ),
    ];

    console.log("📧 Emails to notify:", listOfEmails);

    // 5️⃣ Send email to each unique user
    for (const email of listOfEmails) {
        try{
      const response = await sendEmail.run(
        `New Friend Requests Pending`,
        `You have pending friend requests. Please login to DevTinder and respond.`,
        email
      );

      console.log(`📨 Email sent to ${email}`, response);

    }catch (err) {
       console.log(err); 
    }
}

    console.log("🎉 Cron job completed successfully.");
  } catch (error) {
    console.error("❌ Error in cron job:", error);
  }
});