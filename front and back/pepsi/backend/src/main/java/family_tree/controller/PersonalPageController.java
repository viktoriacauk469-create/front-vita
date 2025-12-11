package family_tree.controller;

import family_tree.model.PersonalInformation;
import family_tree.service.PersonalService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/person")
@RequiredArgsConstructor
public class PersonalPageController {

    private final PersonalService personalService;

    @GetMapping("/edit/{id}")
    public String showEditPage(@PathVariable Long id, Model model) {
        PersonalInformation person = personalService
                .getPersonalsForUser(id)
                .stream()
                .findFirst()
                .orElseThrow();

        model.addAttribute("person", person);
        return "person-edit"; // person-edit.html
    }

    @PostMapping("/edit/{id}")
    public String updatePerson(
            @PathVariable Long id,
            @ModelAttribute("person") PersonalInformation updated
    ) {
        personalService.updatePerson(id, updated);
        return "redirect:/dashboard"; // повернення куди треба
    }
}
