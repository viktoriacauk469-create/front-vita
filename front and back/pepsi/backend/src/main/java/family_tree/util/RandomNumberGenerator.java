package family_tree.util;

import java.security.SecureRandom;
import java.time.LocalDateTime;

public final class RandomNumberGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int CODE_LENGTH = 6;

    private RandomNumberGenerator() {
        // Prevent instantiation
    }

    public static String generateSixDigitCode() {
        int number = RANDOM.nextInt(1_000_000); // from 0 to 999999
        return String.format("%0" + CODE_LENGTH + "d", number);
    }

    public static VerificationCode generateCodeWithExpiry() {
        String code = generateSixDigitCode();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(10);
        return new VerificationCode(code, expiry);
    }

    public record VerificationCode(String code, LocalDateTime expiry) {}
}