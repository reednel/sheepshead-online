import { prisma } from "../utils/prismaClient";
import { Request, Response } from "express";
import { getUserByUsername } from "./userController";

// Send a friend request
// Creates a friend request record
export async function sendFriendRequest(req: Request, res: Response) {
  // Get user record for the requesting user
  const { from_username } = req.params;
  const from_user = await getUserByUsername(from_username);
  if (!from_user) {
    res.status(404).json({ message: `User not found: ${from_username}` });
    return;
  }
  // Get user record for the receiving user
  const { to_username } = req.body;
  const to_user = await getUserByUsername(to_username);
  if (!to_user) {
    res.status(404).json({ message: `User not found: ${to_username}` });
    return;
  }
  // Check if users are already friends
  const areFriends = await prisma.friends.findFirst({
    where: {
      OR: [
        { user_1_id: from_user.user_id, user_2_id: to_user.user_id },
        { user_1_id: to_user.user_id, user_2_id: from_user.user_id },
      ],
    },
  });
  if (areFriends) {
    res.status(400).json({ message: "Users are already friends" });
    return;
  }
  // Check if a friend request already exists
  const friendRequest = await prisma.friend_requests.findFirst({
    where: {
      OR: [
        { from_user_id: from_user.user_id, to_user_id: to_user.user_id },
        { from_user_id: to_user.user_id, to_user_id: from_user.user_id }, // unnecessary?
      ],
    },
  });
  if (friendRequest) {
    res.status(400).json({ message: "Friend request already exists" });
    return;
  }
  // Create the friend request
  try {
    const result = await prisma.friend_requests.create({
      data: { from_user_id: from_user.user_id, to_user_id: to_user.user_id },
    });
    res.json({ message: "Friend request created" });
  } catch (error) {
    console.error(`Error sending friend request:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Revoke a friend request
// Deletes the friend request record
export async function revokeFriendRequest(req: Request, res: Response) {
  // Get user record for the revoking user
  const { from_username } = req.params;
  const from_user = await getUserByUsername(from_username);
  if (!from_user) {
    res.status(404).json({ message: `User not found: ${from_username}` });
    return;
  }
  // Get user record for the receiving user
  const { to_username } = req.body;
  const to_user = await getUserByUsername(to_username);
  if (!to_user) {
    res.status(404).json({ message: `User not found: ${to_username}` });
    return;
  }
  // Delete the friend request
  try {
    const result = await prisma.friend_requests.delete({
      where: {
        from_user_id_to_user_id: {
          from_user_id: from_user.user_id,
          to_user_id: to_user.user_id,
        },
      },
    });
    if (!result) {
      res.status(400).json({ message: "No such friend request exists" });
      return;
    }
    res.json({ message: "Friend request revoked" });
  } catch (error) {
    console.error(`Error deleting friend request:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Accept a friend request
// Creates a friends record and deletes the friend request record
export async function acceptFriendRequest(req: Request, res: Response) {
  // Get user record for the accepting user
  const { to_username } = req.params;
  const to_user = await getUserByUsername(to_username);
  if (!to_user) {
    res.status(404).json({ message: `User not found: ${to_username}` });
    return;
  }
  // Get user record for the requesting user
  const { from_username } = req.body;
  const from_user = await getUserByUsername(from_username);
  if (!from_user) {
    res.status(404).json({ message: `User not found: ${from_user}` });
    return;
  }
  // Check that a friend request exists
  const friendRequest = await prisma.friend_requests.findFirst({
    where: {
      from_user_id: from_user.user_id,
      to_user_id: to_user.user_id,
    },
  });
  if (!friendRequest) {
    res.status(400).json({ message: "No such friend request exists" });
    return;
  }
  // Check if users are already friends
  const areFriends = await prisma.friends.findFirst({
    where: {
      OR: [
        { user_1_id: from_user.user_id, user_2_id: to_user.user_id },
        { user_1_id: to_user.user_id, user_2_id: from_user.user_id },
      ],
    },
  });
  if (areFriends) {
    res.status(400).json({ message: "Users are already friends" });
    return;
  }
  // Delete the friend request and create the friendship
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const friendRequest = await prisma.friend_requests.delete({
        where: {
          from_user_id_to_user_id: {
            from_user_id: from_user.user_id,
            to_user_id: to_user.user_id,
          },
        },
      });
      const user1Id = Math.min(from_user.user_id, to_user.user_id);
      const user2Id = Math.max(from_user.user_id, to_user.user_id);
      const friend = await prisma.friends.create({
        data: { user_1_id: user1Id, user_2_id: user2Id },
      });
      return { friendRequest, friend };
    });
    res.json({ message: "Friend request accepted" });
  } catch (error) {
    console.error(
      `Error deleting friend request and creating friendship:`,
      error
    );
    res.status(500).json({ message: "Internal server error" });
  }
}

// Ignore a friend request
// Deletes the friend request record
export async function ignoreFriendRequest(req: Request, res: Response) {
  // Get user record for the ignoring user
  const { to_username } = req.params;
  const to_user = await getUserByUsername(to_username);
  if (!to_user) {
    res.status(404).json({ message: `User not found: ${to_username}` });
    return;
  }
  // Get user record for the requesting user
  const { from_username } = req.body;
  const from_user = await getUserByUsername(from_username);
  if (!from_user) {
    res.status(404).json({ message: `User not found: ${from_user}` });
    return;
  }
  // Delete the friend request
  try {
    const result = await prisma.friend_requests.delete({
      where: {
        from_user_id_to_user_id: {
          from_user_id: from_user.user_id,
          to_user_id: to_user.user_id,
        },
      },
    });
    if (!result) {
      res.status(400).json({ message: "No such friend request exists" });
      return;
    }
    res.json({ message: "Friend request ignored" });
  } catch (error) {
    console.error(`Error deleting friend request:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Remove a friend
// Deletes the friends record
export async function removeFriend(req: Request, res: Response) {
  // Get user record for the removing user
  const { from_username } = req.params;
  const from_user = await getUserByUsername(from_username);
  if (!from_user) {
    res.status(404).json({ message: `User not found: ${from_username}` });
    return;
  }
  // Get user record for the removed user
  const { to_username } = req.body;
  const to_user = await getUserByUsername(to_username);
  if (!to_user) {
    res.status(404).json({ message: `User not found: ${to_username}` });
    return;
  }
  // Delete the friendship
  try {
    const user1Id = Math.min(from_user.user_id, to_user.user_id);
    const user2Id = Math.max(from_user.user_id, to_user.user_id);
    const result = await prisma.friends.delete({
      where: {
        user_1_id_user_2_id: {
          user_1_id: user1Id,
          user_2_id: user2Id,
        },
      },
    });
    if (!result) {
      res.status(400).json({ message: "No such friendship exists" });
      return;
    }
    res.json({ message: "Friendship removed successfully" });
  } catch (error) {
    console.error(`Error deleting friendship:`, error);
    res.status(500).json({ message: "Internal server error" });
  }
}
