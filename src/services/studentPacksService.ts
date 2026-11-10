import { Friendship, StudentPackMessage, Learner } from '../core/types';
import { ApiClient } from '../core/api/apiClient';
import { StorageRLSLayer } from '../core/storage/StorageRLSLayer';

export class StudentPacksService {
  /**
   * Retrieves all peer learners for safe discovery (limited to same board or grade).
   */
  public static async getDiscoverablePeers(currentLearner: Learner): Promise<Learner[]> {
    try {
      const res = await ApiClient.getDiscoverablePeers(currentLearner.id);
      if (res.success && res.peers) {
        return res.peers;
      }
    } catch (e) {
      console.warn('[StudentPacksService] Falling back to local peers:', e);
    }
    return [];
  }

  /**
   * Retrieves friendships for the active student.
   */
  public static async getFriendships(learnerId: string): Promise<Friendship[]> {
    try {
      const res = await ApiClient.getFriendships(learnerId);
      if (res.success && res.friends) {
        return res.friends;
      }
    } catch (e) {
      console.warn('[StudentPacksService] Offline friends note:', e);
    }
    return StorageRLSLayer.getFriends(learnerId);
  }

  /**
   * Sends a friend request.
   */
  public static async sendFriendRequest(requester: Learner, receiverId: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await ApiClient.sendFriendRequest(requester.id, receiverId);
      return { success: res.success, message: res.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Unable to send friend request.' };
    }
  }

  /**
   * Accepts or declines a friend request.
   */
  public static async respondToRequest(
    currentLearnerId: string,
    friendshipId: string,
    action: 'ACCEPT' | 'DECLINE' | 'BLOCK'
  ): Promise<{ success: boolean; message: string }> {
    try {
      const res = await ApiClient.respondToFriendRequest(currentLearnerId, friendshipId, action);
      return { success: res.success, message: res.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to update request.' };
    }
  }

  /**
   * Retrieves conversation messages with a peer.
   */
  public static async getMessages(learnerId: string, peerId: string): Promise<StudentPackMessage[]> {
    try {
      const res = await ApiClient.getStudentMessages(learnerId, peerId);
      if (res.success && res.messages) {
        return res.messages.map((m: any) => ({
          id: m.id,
          senderId: m.senderId,
          senderName: m.senderName,
          receiverId: m.receiverId,
          content: m.content,
          flaggedForReview: Boolean(m.flaggedForReview),
          flagReason: m.flagReason,
          isDelivered: true,
          sentAt: m.createdAt
        }));
      }
    } catch (e) {
      console.warn('[StudentPacksService] Offline messages note:', e);
    }
    return [];
  }

  /**
   * Sends a message with PII and Profanity inspection.
   */
  public static async sendMessage(
    sender: Learner,
    receiverId: string,
    rawText: string
  ): Promise<{ success: boolean; message?: StudentPackMessage; warning?: string }> {
    try {
      const res = await ApiClient.sendStudentMessage(sender.id, receiverId, rawText);
      if (res.success && res.message) {
        const msg: StudentPackMessage = {
          id: res.message.id,
          senderId: res.message.senderId,
          senderName: res.message.senderName,
          receiverId: res.message.receiverId,
          content: res.message.content,
          flaggedForReview: Boolean(res.message.flaggedForReview),
          flagReason: res.message.flagReason,
          isDelivered: true,
          sentAt: res.message.createdAt
        };
        return { success: true, message: msg, warning: res.warning };
      }
      return { success: false, warning: 'Failed to send message.' };
    } catch (err: any) {
      return { success: false, warning: err.message || 'Error transmitting message.' };
    }
  }

  /**
   * Reports a user or message for Admin review.
   */
  public static reportUser(
    reporter: Learner,
    targetLearnerId: string,
    reason: string
  ): { success: boolean; message: string } {
    StorageRLSLayer.recordSecurityViolation(
      reporter.email,
      'USER_REPORT_SUBMITTED',
      `Target: ${targetLearnerId} | Reason: ${reason}`
    );
    return {
      success: true,
      message: 'Report submitted. Our safety team will review this interaction within 24 hours.'
    };
  }
}
