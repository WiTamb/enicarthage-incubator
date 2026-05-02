package com.enicarthage.incubator.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

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
                "Connectez-vous à la plateforme pour plus de détails.\n\n" +
                "Cordialement,\nL'équipe Enicarthage Incubator",
                projectTitle, status
        );
        sendEmail(to, subject, body);
    }

    @Async
    public void sendWelcomeEmail(String to, String firstName) {
        String subject = "Bienvenue sur Enicarthage Incubator !";
        String body = String.format(
                "Bonjour %s,\n\nVotre compte a été créé avec succès sur la plateforme Enicarthage Incubator.\n\n" +
                "Vous pouvez dès maintenant soumettre vos projets et suivre leur progression.\n\n" +
                "Cordialement,\nL'équipe Enicarthage Incubator",
                firstName
        );
        sendEmail(to, subject, body);
    }
    @Async
    public void sendEvaluatorInvitation(String to, String tempPassword) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("Bienvenue sur Enicarthage Incubator - Compte Évaluateur");
            helper.setFrom("noreply@enicarthage-incubator.tn");

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
                    <p>Lors de votre première connexion, il vous sera demandé de modifier votre mot de passe et de compléter vos informations personnelles.</p>
                    <br>
                    <a href="http://localhost:4200/auth/login" 
                       style="background: #0ea5e9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                       Accéder à la plateforme
                    </a>
                    <br><br>
                    <p>Cordialement,<br>L'équipe Enicarthage Incubator</p>
                </div>
            """.formatted(to, tempPassword);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Invitation envoyée avec succès à {}", to);
        } catch (Exception e) {
            log.error("Erreur lors de l'envoi de l'invitation à {} : {}", to, e.getMessage());
        }
    }
}
