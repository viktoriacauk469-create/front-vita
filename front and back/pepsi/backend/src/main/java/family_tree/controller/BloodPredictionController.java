package family_tree.controller;

import family_tree.dto.UserDTO;
import family_tree.model.User;
import family_tree.service.UserService;
import family_tree.service.implementation.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class BloodPredictionController {

    private final EmailService emailService;
    private final UserService userService;

    @GetMapping("/dashboard/prediction")
    public String getPredictionFrom(Principal principal, Model model) {

        UserDTO user = userService.getUserByEmail(principal.getName());
        model.addAttribute("user", user);
        return "dashboard/prediction";
    }
}
