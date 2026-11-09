import { Friendship, StudentPackMessage, Learner } from '../core/types';
import { StorageRLSLayer, SUPER_ADMIN_EMAIL } from '../core/storage/StorageRLSLayer';
import { PIIFirewall } from '../core/security/piiFirewall';

export class StudentPacksService {
  /**
   * Retrieves all peer learners for safe discovery (limited to same board or grade).
   */
  public static getDiscoverablePeers(currentLearner: Learner): Learner[] {
    const all = StorageRLSLayer.getAllLearnersAdmin(SUPER_ADMIN_EMAIL);
    return all.filter(
      l =>
        l.id !== currentLearner.id &&
        l.role === 'STUDENT' &&
        l.isActive &&
        (l.grade === currentLearner.grade || l.board === currentLearner.board)
    );
  }

  /**
   * Sends a friend request.
   */
  public static sendFriendRequest(requester: Learner, receiverId: string): { success: boolean; message: string } {
    const receiver = StorageRLSLayer.getLearnerById(receiverId, requester.id);
    if (!receiver) {
      return { success: false, message: 'Student not found.' };
    }

    const friends = StorageRLSLayer.getFriends(requester.id);
    const existing = friends.find(
      f =>
        (f.requesterId === requester.id && f.receiverId === receiverId) ||
        (f.requesterId === receiverId && f.receiverId === requester.id)
    );

    if (existing) {
      if (existing.status === 'BLOCKED') {
        return { success: false, message: 'Unable to connect with this user.' };
      }
      return { success: false, message: `Friend request is already ${existing.status.toLowerCase()}.` };
    }

    const friendship: Friendship = {
      id: 'fr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
      requesterId: requester.id,
      receiverId: receiver.id,
      requesterName: requester.fullName,
      receiverName: receiver.fullName,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    StorageRLSLayer.saveFriendship(friendship);
    return { success: true, message: `Friend request sent to ${receiver.fullName}!` };
  }

  /**
   * Accepts or declines a friend request.
   */
  public static respondToRequest(
    currentLearnerId: string,
    friendshipId: string,
    action: 'ACCEPT' | 'DECLINE' | 'BLOCK'
  ): { success: boolean; message: string } {
    const friends = StorageRLSLayer.getFriends(currentLearnerId);
    const friendship = friends.find(f => f.id === friendshipId);
    if (!friendship) return { success: false, message: 'Request not found.' };

    if (action === 'ACCEPT') {
      friendship.status = 'ACCEPTED';
    } else if (action === 'DECLINE') {
      friendship.status = 'DECLINED';
    } else if (action === 'BLOCK') {
      friendship.status = 'BLOCKED';
    }

    StorageRLSLayer.saveFriendship(friendship);
    return { success: true, message: `Connection updated: ${friendship.status}.` };
  }

  /**
   * Sends a message with PII and Profanity inspection.
   * If PII or vulgarity is found, it is redacted, flagged, and audited for Admin moderation.
   */
  public static sendMessage(
    sender: Learner,
    receiverId: string,
    rawText: string
  ): { success: boolean; message?: StudentPackMessage; warning?: string } {
    const scan = PIIFirewall.scan(rawText);

    const msgId = 'msg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
    const message: StudentPackMessage = {
      id: msgId,
      senderId: sender.id,
      senderName: sender.fullName,
      receiverId,
      content: scan.redactedText,
      flaggedForReview: !scan.isSafe,
      flagReason: scan.reason,
      isDelivered: true,
      sentAt: new Date().toISOString()
    };

    StorageRLSLayer.saveMessage(message);

    if (!scan.isSafe) {
      // Record security audit log for child safety review
      StorageRLSLayer.recordSecurityViolation(
        sender.email,
        `STUDENTPACK_PII_VIOLATION:${scan.reason}`,
        `Msg to ${receiverId}`
      );
      return {
        success: true,
        message,
        warning: scan.blockedDetails || 'Content was redacted to maintain community safety.'
      };
    }

    return { success: true, message };
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
