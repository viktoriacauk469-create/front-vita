package family_tree.logger;

import family_tree.model.enums.Role;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class Logger {

    public void logLoginSuccess(String email) {
        log.info("User logged in: {}", maskEmail(email));
    }

    public void logLoginFailure(String email, String reason) {
        log.warn("Login failed ({}): {}", reason, maskEmail(email));
    }

    public void logRegistrationSuccess(String email) {
        log.info("User successfully registered: {}", maskEmail(email));
    }

    public void logDeleteSuccess(String email) {
        log.info("User successfully deleted: {}", maskEmail(email));
    }

    public void logError(String email, int statusCode, String message) {
        log.info("User {}, got an errorPage with code {}, {}", maskEmail(email), statusCode, message);
    }

    public void logPasswordRecoveryRequest(String email) {
        log.info("Password recovery request: {}", maskEmail(email));
    }

    public void logEmailSendError(String email) {
        log.error("Failed sending email to: {}", maskEmail(email));
    }

    public void logPasswordResetSuccess(String email) {
        log.info("Password reset success: {}", maskEmail(email));
    }

    public void logRoleSuccessfullyChanged(String email, Role role) {
        log.info("User -> {}, role was successfully changed to: {}", maskEmail(email), role);
    }

    public void logGeneralError(Exception ex) {
        log.error("General exception occurred: {}", ex.getMessage(), ex);
    }

    public void logAccessDenied(String user, String endpoint) {
        log.warn("Access denied: user={} tried to access {}", maskEmail(user), endpoint);
    }

    // for safety -> {in logs we do not show private information about users}
    private String maskEmail(String email) {
        if (email == null) return "unknown";
        int atIndex = email.indexOf("@");
        if (atIndex <= 1) return "***";
        return email.substring(0, Math.min(3, atIndex)) + "***" + email.substring(atIndex);
    }

}
