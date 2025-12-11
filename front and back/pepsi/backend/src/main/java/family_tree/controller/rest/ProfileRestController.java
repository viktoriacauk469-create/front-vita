package family_tree.controller.rest;

import family_tree.dto.UserDTO;
import family_tree.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class ProfileRestController {

    private final UserService userService;

    @GetMapping("/me")
    public UserDTO getProfile(Principal principal) {
        return userService.getUserByEmail(principal.getName());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable Long userId) {
        return userService.getUserById(userId)
                .map(user -> ResponseEntity.ok(Map.<String, Object>of("user", user)))
                .orElse(ResponseEntity.status(404).body(Map.<String, Object>of("error", "User not found")));
    }

    @PutMapping("/me")
    public String updateProfile(Principal principal,
                                @RequestBody UpdateProfileRequest request) {

        UserDTO user = userService.getUserByEmail(principal.getName());

        user.setFirstName(request.firstName);
        user.setLastName(request.lastName);
        user.setBloodType(request.bloodType);
        user.setRhesusFactor(request.rhesusFactor);
        user.setAge(request.age);
        user.setGender(user.getGender());

        userService.updateUser(user);

        return "Profile updated";
    }

    @Data
    static class UpdateProfileRequest {
        String firstName;
        String lastName;
        String bloodType;
        String rhesusFactor;
        String gender;
        Integer age;
    }
}
