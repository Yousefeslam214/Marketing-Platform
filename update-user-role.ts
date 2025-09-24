// Quick script to update user role to admin
import { db } from "./server/db.js";
import { users } from "./shared/schema.js";
import { eq } from "drizzle-orm";

async function updateUserRole(
  email: string,
  role: "admin" | "marketing" | "advertiser"
) {
  try {
    const [updatedUser] = await db
      .update(users)
      .set({ role })
      .where(eq(users.email, email))
      .returning();

    console.log("User updated:", updatedUser);
    process.exit(0);
  } catch (error) {
    console.error("Error updating user:", error);
    process.exit(1);
  }
}

// Update superadmin user to admin role
updateUserRole("superadmin@example.com", "admin");
