package family_tree.controller.rest;

import family_tree.dto.UserDTO;
import family_tree.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
public class BloodPredictionRestController {

    private final UserService userService;

    @GetMapping("/api/prediction")
    public UserDTO getPrediction(Principal principal) {
        return userService.getUserByEmail(principal.getName());
    }
}
