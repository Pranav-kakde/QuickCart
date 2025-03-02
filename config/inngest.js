import { Inngest } from "inngest";
import connectDB from "./db";
import User from "@/models/user";
import mongoose from "mongoose";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "ClearStock-next" });

// Inngest function to save user data to a database
export const syncUserCreation = inngest.createFunction(
    {
        id: 'sync-user-from-clerk',
    },
    [ { event: 'clerk/user.created' } ],
    async ({ event }) => {
        try {
            await connectDB(); // Ensure database connection

            const { id, first_name, last_name, email_addresses, image_url } = event.data;

            const userData = {
                _id: new mongoose.Types.ObjectId(id), // Convert to ObjectId if needed
                email: email_addresses[0].email_address,
                name: `${first_name} ${last_name}`,
                imageUrl: image_url,
            };

            await User.create(userData);
            console.log("User created:", userData);
        } catch (error) {
            console.error("Error creating user:", error);
        }
    }
);

// Inngest function to update user data in the database
export const syncUserUpdation = inngest.createFunction(
    {
        id: 'update-user-from-clerk',
    },
    [ { event: 'clerk/user.updated' } ],
    async ({ event }) => {
        try {
            await connectDB(); // Ensure database connection

            const { id, first_name, last_name, email_addresses, image_url } = event.data;

            const userData = {
                email: email_addresses[0].email_address,
                name: `${first_name} ${last_name}`,
                imageUrl: image_url,
            };

            await User.findByIdAndUpdate(id, userData, { new: true });
            console.log("User updated:", id);
        } catch (error) {
            console.error("Error updating user:", error);
        }
    }
);

// Inngest function to delete user from the database
export const syncUserDeletion = inngest.createFunction(
    {
        id: 'delete-user-with-clerk',
    },
    [ { event: 'clerk/user.deleted' } ],
    async ({ event }) => {
        try {
            await connectDB(); // Ensure database connection
            const { id } = event.data;

            await User.findByIdAndDelete(id);
            console.log("User deleted:", id);
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    }
);
