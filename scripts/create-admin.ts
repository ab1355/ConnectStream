import { hashPassword } from "../server/auth";

async function createHash() {
  const hash = await hashPassword("admin");
  console.log("Hashed password:", hash);
}

createHash().catch(console.error);
