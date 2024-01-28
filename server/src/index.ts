import express from "express";
import userRoutes from "./routes/userRoutes";
import friendRoutes from "./routes/friendRoutes";

const app = express();
app.use(express.json());

app.use(userRoutes);
app.use(friendRoutes);

app.listen(3000, () =>
  console.log("Sheepshead Online server ready at: http://localhost:3000")
);

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
