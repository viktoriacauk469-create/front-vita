package family_tree.controller.rest;

import family_tree.dto.UserDTO;
import family_tree.service.UserService;
import family_tree.service.implementation.EmailService;
import family_tree.util.RandomNumberGenerator;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class RegistrationRestController {

    private final UserService userService;
    private final EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody UserDTO userDTO,
            BindingResult bindingResult) {

        // ✅ 1. Валідація
        if (bindingResult.hasErrors()) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", "Invalid input"));
        }

        // ✅ 2. Перевірка на існування email
        if (userService.existsByEmail(userDTO.getEmail())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already in use"));
        }

        // ✅ 3. Реєстрація користувача
        RandomNumberGenerator.VerificationCode code;
        try {
            code = RandomNumberGenerator.generateCodeWithExpiry();
            userService.register(userDTO, code);
            System.out.println("User registered successfully");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Registration failed"));
        }

        // ✅ 4. Відправка email (НЕ ламає реєстрацію)
        boolean emailSent = true;
        try {
            emailService.sendVerificationCodeEmail(
                    userDTO.getEmail(),
                    code.code()
            );
            System.out.println("Verification email sent");
        } catch (MessagingException e) {
            emailSent = false;
            System.err.println("Failed to send verification email");
            e.printStackTrace();
        }

        // ✅ 5. Відповідь клієнту
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put(
                "message",
                emailSent
                        ? "Verification code sent to email"
                        : "Registered successfully, but email was not sent"
        );

        // ✅ DEBUG (можеш прибрати пізніше)
        System.out.println(
                "=== VERIFICATION CODE FOR " +
                        userDTO.getEmail() +
                        ": " + code.code() + " ==="
        );

        return ResponseEntity.ok(response);
    }
}
