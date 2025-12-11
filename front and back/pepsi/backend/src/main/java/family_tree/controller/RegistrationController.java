package family_tree.controller;

import family_tree.dto.UserDTO;
import family_tree.service.UserService;
import family_tree.service.implementation.EmailService;
import family_tree.util.RandomNumberGenerator;
import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequiredArgsConstructor
public class RegistrationController {

    private final UserService userService;
    private final EmailService emailService;

    @GetMapping("/register")
    public String getRegistrationForm(Model model) {
        if (!model.containsAttribute("user")) {
            model.addAttribute("user", new UserDTO());
        }
        return "auth/register";
    }

    @PostMapping("/register")
    public String register(
            @Valid @ModelAttribute("user") UserDTO userDTO,
            BindingResult bindingResult,
            RedirectAttributes redirectAttributes) {

        // ✅ 1. Валідація
        if (bindingResult.hasErrors()) {
            return "auth/register";
        }

        // ✅ 2. Email вже існує
        if (userService.existsByEmail(userDTO.getEmail())) {
            bindingResult.rejectValue(
                    "email",
                    "error.user",
                    "Email is already in use"
            );
            return "auth/register";
        }

        // ✅ 3. Генеруємо код
        RandomNumberGenerator.VerificationCode verificationCode =
                RandomNumberGenerator.generateCodeWithExpiry();

        // ✅ 4. Реєструємо користувача
        try {
            userService.register(userDTO, verificationCode);
        } catch (Exception e) {
            e.printStackTrace();
            bindingResult.reject("registration.error", "Registration failed");
            return "auth/register";
        }

        // ✅ 5. Відправляємо email (НЕ ламає реєстрацію)
        try {
            emailService.sendVerificationCodeEmail(
                    userDTO.getEmail(),
                    verificationCode.code()
            );
        } catch (MessagingException e) {
            System.err.println("Failed to send verification email");
            e.printStackTrace();
            // НЕ return — користувач уже створений
        }

        // ✅ 6. Redirect на сторінку підтвердження
        redirectAttributes.addFlashAttribute(
                "success",
                "Registration successful. Please check your email for the verification code."
        );
        redirectAttributes.addFlashAttribute(
                "email",
                userDTO.getEmail()
        );

        // ✅ DEBUG (можеш прибрати пізніше)
        System.out.println(
                "=== VERIFICATION CODE FOR " +
                        userDTO.getEmail() +
                        ": " + verificationCode.code() + " ==="
        );

        return "redirect:/verify";
    }
}
