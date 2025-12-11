package family_tree.controller.rest;

import family_tree.model.PersonalInformation;
import family_tree.service.PersonalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/persons")
@RequiredArgsConstructor
public class PersonalRestController {

    private final PersonalService personalService;

    // GET all persons of user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PersonalInformation>> getPersons(@PathVariable Long userId) {
        return ResponseEntity.ok(personalService.getPersonalsForUser(userId));
    }

    // GET one person
    @GetMapping("/{id}")
    public ResponseEntity<PersonalInformation> getPerson(@PathVariable Long id) {
        return ResponseEntity.ok(personalService
                .getPersonalsForUser(id)
                .stream()
                .findFirst()
                .orElseThrow()
        );
    }

    // UPDATE person (React Form)
    @PutMapping("/{id}")
    public ResponseEntity<PersonalInformation> updatePerson(
            @PathVariable Long id,
            @RequestBody PersonalInformation updated
    ) {
        return ResponseEntity.ok(personalService.updatePerson(id, updated));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePerson(@PathVariable Long id) {
        personalService.removeRelative(id);
        return ResponseEntity.noContent().build();
    }
}
