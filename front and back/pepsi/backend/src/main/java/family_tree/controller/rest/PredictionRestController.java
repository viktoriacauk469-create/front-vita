package family_tree.controller.rest;

import family_tree.dto.PredictionEmailRequest;
import family_tree.service.implementation.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/prediction")
@RequiredArgsConstructor
public class PredictionRestController {
    private final EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<String> sendEmail(@RequestBody PredictionEmailRequest request) {
        try {
            emailService.sendPredictionEmail(request);
            return ResponseEntity.ok("Email sent");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}