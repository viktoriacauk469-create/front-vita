package family_tree.controller.rest;

import family_tree.dto.UserDTO;
import family_tree.mapper.EnumMapper;
import family_tree.model.PersonalInformation;
import family_tree.service.PersonalService;
import family_tree.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/relatives")
public class PersonalInformationRestController {

    private final PersonalService personalService;
    private final UserService userService;
    private final EnumMapper enumMapper;

    @GetMapping
    public List<PersonalInformation> getRelatives(Principal principal) {
        UserDTO user = userService.getUserByEmail(principal.getName());
        return personalService.getPersonalsForUser(user.getId());
    }

    @PostMapping
    public PersonalInformation addRelative(Principal principal,
                                           @RequestBody RelativeRequest request) {
        UserDTO user = userService.getUserByEmail(principal.getName());
        
        PersonalInformation.PersonalInformationBuilder builder = PersonalInformation.builder()
                .firstName(request.firstName)
                .middleName(request.middleName)
                .lastName(request.lastName)
                .age(request.age)
                .disease(request.disease);
        
        if (request.dateOfBirth != null) {
            builder.dateOfBirth(java.time.LocalDate.parse(request.dateOfBirth));
        }
        if (request.gender != null) {
            builder.gender(enumMapper.stringToGender(request.gender));
        }
        if (request.bloodType != null) {
            builder.bloodType(enumMapper.stringToBloodType(request.bloodType));
        }
        if (request.rhesusFactor != null) {
            builder.rhesusFactor(enumMapper.stringToRhesusFactor(request.rhesusFactor));
        }
        
        PersonalInformation person = builder.build();
        return personalService.createPersonalForUser(user.getId(), person);
    }

    @DeleteMapping("/{id}")
    public String removeRelative(@PathVariable Long id) {
        personalService.removeRelative(id);
        return "Relative removed";
    }

    @Data
    static class RelativeRequest {
        String firstName;
        String middleName;
        String lastName;
        Integer age;
        String dateOfBirth;
        String gender;
        String bloodType;
        String rhesusFactor;
        String disease;
    }
}
