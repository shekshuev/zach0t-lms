import { User } from "../models/user.schema";

export default defineNitroPlugin(async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log("User already exist, skipping admin init");
      return;
    } else {
      await User.insertOne({
        username: "admin",
        passwordHash: await hashPassword("Qwerty123!"),
        firstName: "John",
        lastName: "Doe",
        role: "admin",
        status: "active",
      });
      console.log('Admin created: userName "admin", password "Qwerty123!"');
    }
  } catch (err) {
    console.error("Error checking user count:", err);
    return;
  }
});
