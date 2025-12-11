package family_tree.controller;

import family_tree.dto.UserDTO;
import family_tree.model.PersonalInformation;
import family_tree.service.PersonalService;
import family_tree.service.UserService;
import family_tree.service.implementation.PhotoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.security.Principal;
import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/relatives")
public class PersonalInformationController {

    private final PersonalService personalService;
    private final UserService userService;
    private final PhotoService photoService;

    @GetMapping
    public String getRelatives(Principal principal, Model model) {
        UserDTO user = userService.getUserByEmail(principal.getName());
        if (user == null) return "redirect:/login";

        List<PersonalInformation> personals = personalService.getPersonalsForUser(user.getId());
        model.addAttribute("userId", user.getId());
        model.addAttribute("userPersonals", personals);

        return "dashboard/relatives";
    }

    @PostMapping("/add")
    public String addRelative(Principal principal,
                              @RequestParam("relativeFirstName") String firstName,
                              @RequestParam("relativeLastName") String lastName,
                              @RequestParam("relativeAge") Integer age,
                              @RequestParam(value = "photo", required = false) MultipartFile photo,
                              RedirectAttributes redirectAttributes) {
        try {
            UserDTO user = userService.getUserByEmail(principal.getName());

            PersonalInformation personal = PersonalInformation.builder()
                    .firstName(firstName)
                    .lastName(lastName)
                    .age(age)
                    .build();

            PersonalInformation savedPersonal = personalService.createPersonalForUser(user.getId(), personal);

            if (photo != null && !photo.isEmpty()) {
                try {
                    photoService.uploadPhoto(savedPersonal.getId(), photo);
                } catch (Exception e) {
                    redirectAttributes.addFlashAttribute("warning",
                            "Персону створено, але фото не завантажено: " + e.getMessage());
                    return "redirect:/relatives";
                }
            }

            redirectAttributes.addFlashAttribute("success", "Персону успішно додано!");
            return "redirect:/relatives";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/relatives";
        }
    }

    @PostMapping("/remove")
    public String removeRelative(@RequestParam Long personId,
                                 RedirectAttributes redirectAttributes) {
        try {
            try {
                photoService.deletePersonPhoto(personId);
            } catch (Exception e) {}

            personalService.removeRelative(personId);
            redirectAttributes.addFlashAttribute("success", "Персону видалено!");
            return "redirect:/relatives";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/relatives";
        }
    }

    @PostMapping("/upload-photo/{personId}")
    public String uploadPhoto(@PathVariable Long personId,
                              @RequestParam("photo") MultipartFile photo,
                              RedirectAttributes redirectAttributes) {
        try {
            photoService.uploadPhoto(personId, photo);
            redirectAttributes.addFlashAttribute("success", "Фото успішно завантажено!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Помилка завантаження фото: " + e.getMessage());
        }
        return "redirect:/relatives";
    }

    @PostMapping("/delete-photo/{personId}")
    public String deletePhoto(@PathVariable Long personId,
                              RedirectAttributes redirectAttributes) {
        try {
            photoService.deletePersonPhoto(personId);
            redirectAttributes.addFlashAttribute("success", "Фото видалено!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Помилка видалення фото: " + e.getMessage());
        }
        return "redirect:/relatives";
    }
}