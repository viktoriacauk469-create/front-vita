
package family_tree.controller;
import family_tree.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequiredArgsConstructor
@RequestMapping("/verify")
public class VerifyController {

    private final UserService userService;

    @GetMapping
    public String getVerifyPage(Model model) {
        if (!model.containsAttribute("email")) {
            model.addAttribute("email", "");
        }
        return "auth/verify";
    }

    @PostMapping
    public String verifyCode(@RequestParam("email") String email,
                             @RequestParam("code") String code,
                             Model model,
                             RedirectAttributes redirectAttributes) {

        if (email == null || email.isBlank()) {
            model.addAttribute("error", "Email is required");
            model.addAttribute("email", email);
            return "auth/verify";
        }

        if (!userService.existsByEmail(email)) {
            model.addAttribute("error", "User with this email not found");
            model.addAttribute("email", email);
            return "auth/verify";
        }

        boolean valid = userService.verifyUserByCode(email, code);
        if (!valid) {
            model.addAttribute("error", "Invalid or expired verification code");
            model.addAttribute("email", email);
            return "auth/verify";
        }

        redirectAttributes.addFlashAttribute("success", "Email verified. You can now log in.");
        return "redirect:/login";
    }

}
