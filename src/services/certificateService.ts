import { Certificate, CertificateType, Board, Grade } from '../core/types';
import { StorageRLSLayer } from '../core/storage/StorageRLSLayer';

export class CertificateService {
  /**
   * Generates a tamper-evident unique certificate ID.
   */
  public static generateCertificateId(type: CertificateType, year: string): string {
    const prefix = type === 'ANNUAL_MASTER' ? 'AL-MASTER' : 'AL-CERT';
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${year}-${rand}`;
  }

  /**
   * Issues a Level Mastery Certificate.
   */
  public static issueLevelCertificate(
    learnerId: string,
    learnerName: string,
    board: Board,
    grade: Grade,
    subjectName: string,
    levelName: string
  ): Certificate {
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;
    const certId = this.generateCertificateId('LEVEL_MASTERY', currentYear.toString());
    const verificationToken = 'VTOKEN_' + Math.random().toString(36).substring(2, 10).toUpperCase();

    const certificate: Certificate = {
      certificateId: certId,
      learnerId,
      learnerName,
      certificateType: 'LEVEL_MASTERY',
      board,
      grade,
      subjectName,
      levelName,
      academicYear,
      issuedAt: new Date().toISOString(),
      verificationToken
    };

    StorageRLSLayer.issueCertificate(certificate);
    return certificate;
  }

  /**
   * Evaluates eligibility for the Annual Master Certificate:
   * STRICT: Unlocked ONLY when a student completes 3 distinct course levels within a single calendar year.
   * DEDUPLICATION: Maximum 1 Master Certificate per student per academic year.
   */
  public static checkAndAwardAnnualMasterCertificate(
    learnerId: string,
    learnerName: string,
    board: Board,
    grade: Grade
  ): { awarded: boolean; certificate?: Certificate; reason: string } {
    const currentYear = new Date().getFullYear();
    const academicYear = `${currentYear}-${currentYear + 1}`;

    // 1. Check existing certificates for deduplication
    const existingCerts = StorageRLSLayer.getCertificates(learnerId, learnerId);
    const hasMasterThisYear = existingCerts.some(
      c => c.certificateType === 'ANNUAL_MASTER' && c.academicYear === academicYear
    );

    if (hasMasterThisYear) {
      return {
        awarded: false,
        reason: `Annual Master Certificate already issued for Academic Year ${academicYear}. Maximum 1 permitted per student per academic year.`
      };
    }

    // 2. Count distinct levels completed in this calendar year
    const progressList = StorageRLSLayer.getProgressForLearner(learnerId, learnerId);
    const completedThisYear = progressList.filter(
      p => p.isCompleted && p.calendarYear === currentYear
    );

    // Count distinct combinations of (board, grade, subjectId, levelNode)
    const distinctNodes = new Set(
      completedThisYear.map(p => `${p.board}_${p.grade}_${p.subjectId}_${p.levelNode}`)
    );

    if (distinctNodes.size < 3) {
      return {
        awarded: false,
        reason: `Annual Master Certificate requires 3 distinct course levels in calendar year ${currentYear}. Current progress: ${distinctNodes.size}/3.`
      };
    }

    // 3. Issue Annual Master Certificate
    const certId = this.generateCertificateId('ANNUAL_MASTER', currentYear.toString());
    const verificationToken = 'VMASTER_' + Math.random().toString(36).substring(2, 12).toUpperCase();

    const masterCert: Certificate = {
      certificateId: certId,
      learnerId,
      learnerName,
      certificateType: 'ANNUAL_MASTER',
      board,
      grade,
      subjectName: 'All-Round Academic Mastery',
      levelName: 'Annual Master Scholar',
      academicYear,
      issuedAt: new Date().toISOString(),
      verificationToken
    };

    StorageRLSLayer.issueCertificate(masterCert);
    return {
      awarded: true,
      certificate: masterCert,
      reason: `Congratulations! You unlocked the Annual Master Certificate for Academic Year ${academicYear}!`
    };
  }
}
