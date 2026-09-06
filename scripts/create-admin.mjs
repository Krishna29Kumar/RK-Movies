// Run this once to create your first admin account:
//   node --env-file=.env.local scripts/create-admin.mjs
//
// It connects directly to your MongoDB (using MONGODB_URI from .env.local),
// asks for name/email/password, hashes the password, and inserts an Admin
// document. No public signup route exists for admins on purpose — this is
// the only way to create one, so run it locally, not on a server.

import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("MONGODB_URI is not set. Run this with: node --env-file=.env.local scripts/create-admin.mjs");
    process.exit(1);
}

const AdminSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, lowercase: true, trim: true },
    passwordHash: String,
    createdAt: { type: Date, default: () => new Date() },
});

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

async function main() {
    const rl = readline.createInterface({ input: stdin, output: stdout });

    const name = await rl.question("Admin name: ");
    const email = (await rl.question("Admin email: ")).trim().toLowerCase();
    const password = await rl.question("Admin password (min 8 chars): ");

    rl.close();

    if (!name || !email || password.length < 8) {
        console.error("Name, email, and an 8+ character password are all required.");
        process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);

    const existing = await Admin.findOne({ email });
    if (existing) {
        console.error(`An admin with the email ${email} already exists.`);
        await mongoose.disconnect();
        process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await Admin.create({ name, email, passwordHash });

    console.log(`\nAdmin account created for ${email}. You can now sign in at /admin/login.`);
    await mongoose.disconnect();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});