package com.enicarthage.incubator.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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
}
