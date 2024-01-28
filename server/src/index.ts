import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.get(`/`, async (req, res) => {
  res.json({ message: "Sheepshead Online" });
});

// Create users record and user_configs record with all default values
app.post(`/user`, async (req, res) => {
  const result = await prisma.$transaction(async (prisma) => {
    const user = await prisma.users.create({
      data: { ...req.body },
    });
    const userConfig = await prisma.user_configs.create({
      data: { user_id: user.user_id },
    });
    return { user, userConfig };
  });
  res.json(result);
});

// Delete user record
// Cascades to user_configs, friends, and friend_requests
app.delete(`/deleteuser`, async (req, res) => {
  const { user_id } = req.body;
  const result = await prisma.$transaction(async (prisma) => {
    const user = await prisma.users.delete({
      where: { user_id: user_id },
    });
    return { user };
  });
  res.json(result);
});

// // Get a user ID from a username
// app.get(`/user/:username`, async (req, res) => {
//   const { username } = req.params;
//   const result = await prisma.users.findUnique({
//     where: { username: username },
//   });
//   res.json(result);
// });

// Create a friends record
app.post(`/friend`, async (req, res) => {
  const result = await prisma.friends.create({
    data: { ...req.body },
  });
  res.json(result);
});

// app.post(`/games`, async (req, res) => {
//   const { title, content, authorEmail } = req.body;
//   const result = await prisma.games.create({
//     data: {
//       title,
//       content,
//       published: false,
//       author: { connect: { email: authorEmail } },
//     },
//   });
//   res.json(result);
// });

app.listen(3000, () =>
  console.log("Sheepshead Online server ready at: http://localhost:3000")
);
