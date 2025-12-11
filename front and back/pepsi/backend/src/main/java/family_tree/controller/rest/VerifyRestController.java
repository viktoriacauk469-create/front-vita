package family_tree.controller.rest;

import family_tree.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class VerifyRestController {

    private final UserService userService;

    @PostMapping("/verify")
    public Object verify(@RequestBody VerifyRequest request) {

        if (!userService.existsByEmail(request.getEmail())) {
            return "User not found";
        }

        boolean valid = userService.verifyUserByCode(request.getEmail(), request.getCode());
        if (!valid) {
            return "Invalid or expired verification code";
        }

        return "Email verified";
    }

    @Data
    static class VerifyRequest {
        private String email;
        private String code;
    }
}
