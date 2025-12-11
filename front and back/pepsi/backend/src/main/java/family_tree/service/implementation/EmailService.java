package family_tree.service.implementation;

import family_tree.dto.PredictionEmailRequest;
import family_tree.logger.Logger;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final SpringTemplateEngine templateEngine;
    private final JavaMailSender mailSender;
    private final Logger securityLogger;

    @Value("${spring.mail.username}")
    private String from;

    // 👇 ТУТ ГОЛОВНА ЗМІНА — ДОДАЛИ throws MessagingException
    public void sendVerificationCodeEmail(String email, String code) throws MessagingException {
        String subject = "Your verification code";
        String path = "/verify"; // сторінка, де юзер вводить код
        String message = "Use the code below to verify your email:";
        String templateName = "email/verification_code.html";

        System.out.println("Attempting to send verification email to: " + email);
        System.out.println("From: " + from);
        System.out.println("Code: " + code);

        String actionUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path(path)
                .toUriString();

        Context contextForThymeleaf = new Context();
        contextForThymeleaf.setVariables(Map.of(
                "subject", subject,
                "message", message,
                "code", code,
                "actionUrl", actionUrl
        ));

        String htmlBody = templateEngine.process(templateName, contextForThymeleaf);
        System.out.println("Email template processed successfully");

        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper =
                new MimeMessageHelper(mimeMessage, true, StandardCharsets.UTF_8.name());

        helper.setTo(email);
        helper.setSubject(subject);
        helper.setFrom(from);
        helper.setText(htmlBody, true);

        System.out.println("Sending email via mailSender...");
        mailSender.send(mimeMessage);
        System.out.println("Email sent successfully to: " + email);
    }

    public void sendPredictionEmail(PredictionEmailRequest request) throws MessagingException {
        MimeMessage msg = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(msg, true, "UTF-8");

        helper.setTo(request.getToEmail());
        helper.setSubject("Результат передбачення групи крові");
        helper.setFrom(from); // 👈 краще теж використовувати реальний акаунт

        Context context = new Context();
        context.setVariable("father", request.getFather());
        context.setVariable("mother", request.getMother());
        context.setVariable("aboProbabilities", request.getAboProbabilities());
        context.setVariable("rhProbabilities", request.getRhProbabilities());

        String html = templateEngine.process("email/prediction_result.html", context);

        helper.setText(html, true);
        mailSender.send(msg);
    }
}
