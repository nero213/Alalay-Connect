import { pool } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get or create conversation between client and skilled worker
export const getOrCreateConversation = async (req, res) => {
  try {
    const client_id = req.user.id;
    const { skilled_id } = req.params; // This is actually user_id of the skilled worker

    console.log(
      "Getting conversation for client:",
      client_id,
      "skilled user:",
      skilled_id,
    );

    // Get the skilled_id from the skilled_profiles table using user_id
    const [skilledProfile] = await pool.query(
      "SELECT skilled_id FROM skilled_profiles WHERE user_id = ?",
      [skilled_id],
    );

    if (skilledProfile.length === 0) {
      return res.status(404).json({ message: "Skilled worker not found" });
    }

    const skilled_worker_id = skilledProfile[0].skilled_id;

    // Check if conversation exists
    let [conversation] = await pool.query(
      `SELECT c.*, 
              u.firstName as client_firstName, u.lastName as client_lastName,
              sp.firstName as skilled_firstName, sp.lastName as skilled_lastName,
              sp.profile_image as skilled_image,
              sp.user_id as skilled_user_id
       FROM conversations c
       JOIN users u ON u.user_id = c.client_id
       JOIN skilled_profiles sp ON sp.skilled_id = c.skilled_id
       WHERE c.client_id = ? AND c.skilled_id = ?`,
      [client_id, skilled_worker_id],
    );

    if (conversation.length === 0) {
      // Create new conversation
      const conversation_uuid = uuidv4();
      const [result] = await pool.query(
        `INSERT INTO conversations (conversation_uuid, client_id, skilled_id)
         VALUES (?, ?, ?)`,
        [conversation_uuid, client_id, skilled_worker_id],
      );

      // Get the new conversation
      [conversation] = await pool.query(
        `SELECT c.*, 
                u.firstName as client_firstName, u.lastName as client_lastName,
                sp.firstName as skilled_firstName, sp.lastName as skilled_lastName,
                sp.profile_image as skilled_image,
                sp.user_id as skilled_user_id
         FROM conversations c
         JOIN users u ON u.user_id = c.client_id
         JOIN skilled_profiles sp ON sp.skilled_id = c.skilled_id
         WHERE c.conversation_id = ?`,
        [result.insertId],
      );
    }

    res.json({ conversation: conversation[0] });
  } catch (error) {
    console.error("Error getting conversation:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get all conversations for the logged-in user
// Get all conversations for the logged-in user
export const getUserConversations = async (req, res) => {
  try {
    const user_id = req.user.id;

    // First, get the skilled_id if the user is a skilled worker
    const [skilledProfile] = await pool.query(
      "SELECT skilled_id FROM skilled_profiles WHERE user_id = ?",
      [user_id],
    );
    const skilled_id =
      skilledProfile.length > 0 ? skilledProfile[0].skilled_id : null;

    const [conversations] = await pool.query(
      `SELECT 
        c.*,
        CASE 
          WHEN c.client_id = ? THEN CONCAT(sp.firstName, ' ', sp.lastName)
          ELSE CONCAT(u.firstName, ' ', u.lastName)
        END as other_person_name,
        CASE 
          WHEN c.client_id = ? THEN sp.profile_image
          ELSE u.profile_image
        END as other_person_image,
        CASE 
          WHEN c.client_id = ? THEN 'skilled'
          ELSE 'client'
        END as other_person_type,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.conversation_id AND receiver_id = ? AND is_read = FALSE) as unread_count
      FROM conversations c
      LEFT JOIN users u ON u.user_id = c.client_id
      LEFT JOIN skilled_profiles sp ON sp.skilled_id = c.skilled_id
      WHERE c.client_id = ? OR c.skilled_id = ?
      ORDER BY COALESCE(c.last_message_at, c.updated_at) DESC`,
      [user_id, user_id, user_id, user_id, user_id, skilled_id],
    );

    res.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversation_id } = req.params;
    const user_id = req.user.id;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    // Verify user has access to this conversation
    const [conversation] = await pool.query(
      `SELECT * FROM conversations 
       WHERE conversation_id = ? AND (client_id = ? OR skilled_id = (SELECT skilled_id FROM skilled_profiles WHERE user_id = ?))`,
      [conversation_id, user_id, user_id],
    );

    if (conversation.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Get messages
    const [messages] = await pool.query(
      `SELECT m.*, 
              u.firstName as sender_firstName, u.lastName as sender_lastName,
              u.profile_image as sender_image
       FROM messages m
       JOIN users u ON u.user_id = m.sender_id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at DESC
       LIMIT ? OFFSET ?`,
      [conversation_id, parseInt(limit), offset],
    );

    // Mark messages as read
    await pool.query(
      `UPDATE messages 
       SET is_read = TRUE, read_at = NOW() 
       WHERE conversation_id = ? AND receiver_id = ? AND is_read = FALSE`,
      [conversation_id, user_id],
    );

    res.json({
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: messages.length === parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Send a message
// Send a message with optional file attachment
export const sendMessage = async (req, res) => {
  try {
    const { conversation_id, message, receiver_id } = req.body;
    const sender_id = req.user.id;
    const file = req.file;

    console.log("Send message request:", {
      conversation_id,
      message,
      receiver_id,
      sender_id,
      file: !!file,
    });

    if ((!message || !message.trim()) && !file) {
      return res.status(400).json({ message: "Message or file is required" });
    }

    let conversationId = conversation_id;
    let finalReceiverId = receiver_id;

    // If no conversation_id, create one
    if (!conversationId) {
      console.log("No conversation ID, creating new one...");

      if (!finalReceiverId) {
        return res.status(400).json({ message: "Receiver ID is required" });
      }

      // Determine if sender is client or skilled
      const [senderUser] = await pool.query(
        "SELECT role FROM users WHERE user_id = ?",
        [sender_id],
      );

      let client_id, skilled_worker_id;

      if (senderUser[0].role === "resident") {
        client_id = sender_id;
        const [skilled] = await pool.query(
          "SELECT skilled_id FROM skilled_profiles WHERE user_id = ?",
          [finalReceiverId],
        );
        if (skilled.length === 0) {
          return res.status(404).json({ message: "Skilled worker not found" });
        }
        skilled_worker_id = skilled[0].skilled_id;
      } else {
        const [skilled] = await pool.query(
          "SELECT skilled_id FROM skilled_profiles WHERE user_id = ?",
          [sender_id],
        );
        if (skilled.length === 0) {
          return res.status(404).json({ message: "Skilled profile not found" });
        }
        skilled_worker_id = skilled[0].skilled_id;
        client_id = finalReceiverId;
      }

      // Check if conversation already exists
      const [existing] = await pool.query(
        `SELECT conversation_id FROM conversations 
         WHERE client_id = ? AND skilled_id = ?`,
        [client_id, skilled_worker_id],
      );

      if (existing.length > 0) {
        conversationId = existing[0].conversation_id;
      } else {
        const conversation_uuid = uuidv4();
        const [result] = await pool.query(
          `INSERT INTO conversations (conversation_uuid, client_id, skilled_id)
           VALUES (?, ?, ?)`,
          [conversation_uuid, client_id, skilled_worker_id],
        );
        conversationId = result.insertId;
      }
    }

    // Get conversation details to determine receiver
    const [conversation] = await pool.query(
      `SELECT c.*, sp.user_id as skilled_user_id 
       FROM conversations c
       JOIN skilled_profiles sp ON sp.skilled_id = c.skilled_id
       WHERE c.conversation_id = ?`,
      [conversationId],
    );

    if (conversation.length === 0) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Determine receiver_id if not provided
    if (!finalReceiverId) {
      if (conversation[0].client_id === sender_id) {
        finalReceiverId = conversation[0].skilled_user_id;
      } else {
        finalReceiverId = conversation[0].client_id;
      }
    }

    // Process file upload
    let fileUrl = null;
    let fileType = null;
    let fileName = null;
    let fileSize = null;

    if (file) {
      fileUrl = `/uploads/messages/${file.filename}`;
      fileType = file.mimetype;
      fileName = file.originalname;
      fileSize = file.size;
    }

    // Prepare message text - set to null if empty
    const messageText = message && message.trim() ? message.trim() : null;

    // Insert message
    const [result] = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, receiver_id, message, file_url, file_type, file_name, file_size)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        conversationId,
        sender_id,
        finalReceiverId,
        messageText,
        fileUrl,
        fileType,
        fileName,
        fileSize,
      ],
    );

    // Update conversation's last message
    let lastMessage;
    if (file && messageText) {
      lastMessage = `${messageText} 📎 ${fileName}`;
    } else if (file) {
      lastMessage = `📎 ${fileName}`;
    } else {
      lastMessage = messageText;
    }

    await pool.query(
      `UPDATE conversations 
       SET last_message = ?, last_message_at = NOW(), updated_at = NOW()
       WHERE conversation_id = ?`,
      [lastMessage, conversationId],
    );

    // Get the sent message with sender details
    const [newMessage] = await pool.query(
      `SELECT m.*, 
              u.firstName as sender_firstName, u.lastName as sender_lastName,
              u.profile_image as sender_image
       FROM messages m
       JOIN users u ON u.user_id = m.sender_id
       WHERE m.message_id = ?`,
      [result.insertId],
    );

    // Create notification for receiver
    const [sender] = await pool.query(
      "SELECT firstName, lastName FROM users WHERE user_id = ?",
      [sender_id],
    );

    let notificationMessage;
    if (file && messageText) {
      notificationMessage = `📎 ${sender[0].firstName}: ${messageText.substring(0, 50)}${messageText.length > 50 ? "..." : ""} + file`;
    } else if (file) {
      notificationMessage = `📎 ${sender[0].firstName} sent you a file: ${fileName}`;
    } else {
      notificationMessage = `💬 ${sender[0].firstName}: ${messageText.substring(0, 50)}${messageText.length > 50 ? "..." : ""}`;
    }

    await pool.query(
      `INSERT INTO notifications (user_id, type, title, message, data)
       VALUES (?, 'message', 'New Message', ?, ?)`,
      [
        finalReceiverId,
        notificationMessage,
        JSON.stringify({
          conversation_id: conversationId,
          sender_id,
          hasFile: !!file,
        }),
      ],
    );

    res.status(201).json({
      message: "Message sent",
      data: newMessage[0],
      conversation_id: conversationId,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const { conversation_id } = req.params;
    const user_id = req.user.id;

    await pool.query(
      `UPDATE messages 
       SET is_read = TRUE, read_at = NOW() 
       WHERE conversation_id = ? AND receiver_id = ? AND is_read = FALSE`,
      [conversation_id, user_id],
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [result] = await pool.query(
      `SELECT COUNT(*) as unread_count 
       FROM messages 
       WHERE receiver_id = ? AND is_read = FALSE`,
      [user_id],
    );

    res.json({ unread_count: result[0].unread_count });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Delete a message (soft delete - only for the user)
export const deleteMessage = async (req, res) => {
  try {
    const { message_id } = req.params;
    const user_id = req.user.id;

    // Check if user owns the message
    const [message] = await pool.query(
      "SELECT * FROM messages WHERE message_id = ? AND sender_id = ?",
      [message_id, user_id],
    );

    if (message.length === 0) {
      return res.status(404).json({ message: "Message not found" });
    }

    await pool.query("DELETE FROM messages WHERE message_id = ?", [message_id]);

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
