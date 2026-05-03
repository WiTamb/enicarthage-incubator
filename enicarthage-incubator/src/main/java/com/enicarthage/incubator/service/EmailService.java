package com.enicarthage.incubator.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    // ─── Generic ──────────────────────────────────────────────────────────────

    @Async
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            message.setFrom("noreply@enicarthage-incubator.tn");
            mailSender.send(message);
            log.info("Email envoyé à {}", to);
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de l'email à {} : {}", to, e.getMessage());
        }
    }

    @Async
    public void sendProjectStatusEmail(String to, String projectTitle, String status) {
        String subject = "Mise à jour de votre projet – Enicarthage Incubator";
        String body = String.format(
                "Bonjour,\n\nLe statut de votre projet \"%s\" a été mis à jour : %s.\n\n" +
                "Connectez-vous à la plateforme pour plus de détails.\n\nCordialement,\nL'équipe Enicarthage Incubator",
                projectTitle, status);
        sendEmail(to, subject, body);
    }

    @Async
    public void sendWelcomeEmail(String to, String firstName) {
        String subject = "Bienvenue sur Enicarthage Incubator !";
        String body = String.format(
                "Bonjour %s,\n\nVotre compte a été créé avec succès sur la plateforme Enicarthage Incubator.\n\n" +
                "Vous pouvez dès maintenant soumettre vos projets et suivre leur progression.\n\nCordialement,\nL'équipe Enicarthage Incubator",
                firstName);
        sendEmail(to, subject, body);
    }

    // ─── HTML emails ──────────────────────────────────────────────────────────

    @Async
    public void sendEvaluatorInvitation(String to, String tempPassword) {
        String htmlContent = """
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #0369a1;">Bienvenue dans l'équipe des Évaluateurs</h2>
                <p>Bonjour,</p>
                <p>Un administrateur vient de vous créer un compte sur la plateforme <b>Enicarthage Incubator</b>.</p>
                <p>Voici vos identifiants temporaires :</p>
                <ul style="background: #f1f5f9; padding: 15px; border-radius: 8px; list-style-type: none;">
                    <li><b>Email :</b> %s</li>
                    <li><b>Mot de passe provisoire :</b> %s</li>
                </ul>
                <p>Lors de votre première connexion, il vous sera demandé de modifier votre mot de passe.</p>
                <br>
                <a href="http://localhost:4200/auth/login"
                   style="background: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                   Accéder à la plateforme
                </a>
                <br><br>
                <p>Cordialement,<br>L'équipe Enicarthage Incubator</p>
            </div>
            """.formatted(to, tempPassword);
        sendHtml(to, "Bienvenue sur Enicarthage Incubator - Compte Évaluateur", htmlContent);
    }

    @Async
    public void sendAcceptanceEmail(String to, String candidateName, String roundName, double averageScore, String nextRoundName) {
        String subject = "✅ Résultats " + roundName + " — Vous avez été sélectionné(e)";
        String body = """
                <html><body style="font-family:Arial,sans-serif;color:#333;">
                <div style="max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
                  <div style="background:#1a73e8;padding:24px;text-align:center;">
                    <h1 style="color:white;margin:0;">Félicitations !</h1>
                  </div>
                  <div style="padding:24px;">
                    <p>Bonjour <strong>%s</strong>,</p>
                    <p>Nous avons le plaisir de vous informer que vous avez été <strong>sélectionné(e)</strong>
                       pour passer au round suivant.</p>
                    <div style="background:#f1f8fe;border-left:4px solid #1a73e8;padding:16px;margin:16px 0;border-radius:4px;">
                      <p style="margin:0;font-size:18px;"><strong>Round terminé :</strong> %s</p>
                      <p style="margin:8px 0 0;font-size:22px;color:#1a73e8;"><strong>Score final : %.1f / 100</strong></p>
                    </div>
                    <p>Prochaine étape : <strong>%s</strong></p>
                    <div style="text-align:center;margin-top:24px;">
                      <a href="http://localhost:4200/candidate" style="background:#1a73e8;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;">
                        Accéder à mon espace
                      </a>
                    </div>
                  </div>
                </div></body></html>
                """.formatted(candidateName, roundName, averageScore, nextRoundName);
        sendHtml(to, subject, body);
    }

    @Async
    public void sendRejectionEmail(String to, String candidateName, String roundName, double averageScore) {
        String subject = "❌ Résultats " + roundName + " — Résultats de sélection";
        String body = """
                <html><body style="font-family:Arial,sans-serif;color:#333;">
                <div style="max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
                  <div style="background:#d93025;padding:24px;text-align:center;">
                    <h1 style="color:white;margin:0;">Résultats de sélection</h1>
                  </div>
                  <div style="padding:24px;">
                    <p>Bonjour <strong>%s</strong>,</p>
                    <p>Après examen attentif des dossiers, nous regrettons de vous informer que votre candidature
                       n'a pas été retenue pour passer au round suivant.</p>
                    <div style="background:#fde8e8;border-left:4px solid #d93025;padding:16px;margin:16px 0;border-radius:4px;">
                      <p style="margin:0;font-size:18px;"><strong>Round :</strong> %s</p>
                      <p style="margin:8px 0 0;font-size:22px;color:#d93025;"><strong>Score final : %.1f / 100</strong></p>
                    </div>
                    <p>Nous vous remercions pour votre participation.</p>
                  </div>
                </div></body></html>
                """.formatted(candidateName, roundName, averageScore);
        sendHtml(to, subject, body);
    }

    @Async
    public void sendSelectionReadyEmail(String to, String recipientName, String roundName, String sessionName) {
        String subject = "📋 Liste de sélection disponible — " + roundName;
        String body = """
                <html><body style="font-family:Arial,sans-serif;color:#333;">
                <div style="max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
                  <div style="background:#34a853;padding:24px;text-align:center;">
                    <h1 style="color:white;margin:0;">Action requise</h1>
                  </div>
                  <div style="padding:24px;">
                    <p>Bonjour <strong>%s</strong>,</p>
                    <p>L'évaluation de tous les candidats du round <strong>%s</strong> (session : <strong>%s</strong>) est terminée.</p>
                    <p>Une liste provisoire a été générée. Veuillez vous connecter pour consulter, modifier (avec justification) et valider la liste finale.</p>
                    <div style="text-align:center;margin-top:24px;">
                      <a href="http://localhost:4200/admin" style="background:#34a853;color:white;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;">
                        Accéder au tableau de bord
                      </a>
                    </div>
                  </div>
                </div></body></html>
                """.formatted(recipientName, roundName, sessionName);
        sendHtml(to, subject, body);
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private void sendHtml(String to, String subject, String htmlBody) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(msg);
            log.info("📧 Email envoyé à {}", to);
        } catch (Exception e) {
            log.error("❌ Échec envoi email à {} : {}", to, e.getMessage());
        }
    }
}
