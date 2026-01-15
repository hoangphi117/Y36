const Friend = require("../../models/Friendship");
const User = require("../../models/User");

class FriendController {
  async sendFriendRequest(req, res) {
    try {
      const fromUserId = req.user.id;
      const { userId: toUserId } = req.params;

      if (fromUserId === toUserId) {
        return res
          .status(400)
          .json({ message: "Cannot send friend request to yourself" });
      }

      const targetUser = await User.findById(toUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const existing = await Friend.findBetweenUsers(fromUserId, toUserId);

      if (existing) {
        return res.status(400).json({
          message: `Friendship already exists with status: ${existing.status}`,
        });
      }

      await Friend.sendFriendRequest(fromUserId, toUserId);
      return res.status(201).json({
        message: "Friend request sent successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  async acceptFriendRequest(req, res) {
    try {
      const currentUserId = req.user.id;
      const { userId: fromUserId } = req.params;

      const updated = await Friend.acceptFriendRequest(
        fromUserId,
        currentUserId
      );

      if (!updated) {
        return res.status(400).json({
          message: "No pending friend request found",
        });
      }

      return res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  async rejectFriendRequest(req, res) {
    try {
      const currentUserId = req.user.id;
      const { userId: fromUserId } = req.params;

      const deleted = await Friend.rejectFriendRequest(
        fromUserId,
        currentUserId
      );

      if (!deleted) {
        return res.status(400).json({
          message: "No pending friend request found",
        });
      }

      return res.status(200).json({
        message: "Friend request rejected",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  async unfriend(req, res) {
    try {
      const currentUserId = req.user.id;
      const { userId: otherUserId } = req.params;

      const deleted = await Friend.unfriend(currentUserId, otherUserId);

      if (!deleted) {
        return res.status(400).json({
          message: "No friendship found to unfriend",
        });
      }

      return res.status(200).json({
        message: "Unfriended successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  async blockUser(req, res) {
    try {
      const currentUserId = req.user.id;
      const { userId: blockedId } = req.params;

      if (currentUserId === blockedId) {
        return res.status(400).json({ message: "Cannot block yourself" });
      }

      await Friend.blockUser(currentUserId, blockedId);

      return res.status(200).json({
        message: "User blocked successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  async getFriends(req, res) {
    try {
      const result = await Friend.getFriends(req.user.id, req.query);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  async getIncomingRequests(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const result = await Friend.getIncomingRequests(userId, {
        page,
        limit,
      });

      return res.status(200).json({
        message: "Get incoming requests successfully",
        ...result,
      });
    } catch (error) {
      console.error("Get incoming requests error:", error);
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }

  async getOutgoingRequests(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

      const result = await Friend.getOutgoingRequests(userId, {
        page,
        limit,
      });

      return res.status(200).json({
        message: "Get outgoing requests successfully",
        ...result,
      });
    } catch (error) {
      console.error("Get outgoing requests error:", error);
      return res.status(500).json({
        message: "Server error",
        error: error.message,
      });
    }
  }
}

module.exports = new FriendController();
