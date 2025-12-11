package family_tree.controller;

import family_tree.dto.UserDTO;
import family_tree.model.enums.BloodType;
import family_tree.model.enums.RhesusFactor;
import family_tree.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.security.Principal;
import java.util.Arrays;

@Controller
@RequiredArgsConstructor
@RequestMapping("/user")
public class ProfileController {

    private final UserService userService;

    @GetMapping("/profile")
    public String showProfile(Model model, Principal principal) {
        if (principal == null) return "redirect:/login";

        UserDTO user = userService.getUserByEmail(principal.getName());
        if (user == null) {
            model.addAttribute("errorMessage", "Користувача не знайдено.");
            return "user/profile";
        }

        // Передаємо дані до Thymeleaf
        model.addAttribute("user", user);
        model.addAttribute("bloodTypes", Arrays.asList(BloodType.values()));
        model.addAttribute("rhesusOptions", Arrays.asList(RhesusFactor.values()));

        return "user/profile";
    }

    @PostMapping("/profile")
    public String saveProfile(Principal principal,
                              @RequestParam String firstName,
                              @RequestParam String lastName,
                              @RequestParam String bloodType,
                              @RequestParam String rhFactor,
                              @RequestParam Integer age,
                              RedirectAttributes redirectAttributes) {

        UserDTO userDTO = userService.getUserByEmail(principal.getName());
        if (userDTO == null) {
            redirectAttributes.addFlashAttribute("errorMessage", "Користувача не знайдено.");
            return "redirect:/user/profile";
        }

        userDTO.setFirstName(firstName);
        userDTO.setLastName(lastName);
        userDTO.setBloodType(bloodType);
        userDTO.setRhesusFactor(rhFactor);
        userDTO.setAge(age);

        try {
            userService.updateUser(userDTO);
            redirectAttributes.addFlashAttribute("successMessage", "Профіль збережено.");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("errorMessage", "Помилка при збереженні профілю.");
            e.printStackTrace();
        }

        return "redirect:/user/profile";
    }

}
