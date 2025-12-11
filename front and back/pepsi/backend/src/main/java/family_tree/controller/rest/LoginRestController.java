package family_tree.controller.rest;

import family_tree.dto.UserDTO;
import family_tree.model.User;
import family_tree.model.UserVerification;
import family_tree.repository.UserRepository;
import family_tree.repository.UserVerificationRepository;
import family_tree.mapper.UserMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import static org.springframework.security.web.context.HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class LoginRestController {

    private final UserRepository userRepository;
    private final UserVerificationRepository userVerificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        Map<String, Object> response = new HashMap<>();

        // Find user by email
        User user = userRepository.findUserByEmail(request.email)
                .orElse(null);

        if (user == null) {
            response.put("error", "Invalid email or password");
            return ResponseEntity.status(401).body(response);
        }

        // Check password
        if (!passwordEncoder.matches(request.password, user.getPassword())) {
            response.put("error", "Invalid email or password");
            return ResponseEntity.status(401).body(response);
        }

        // Check if user is verified
        UserVerification userVerification = userVerificationRepository.findByUser(user)
                .orElse(null);

        if (userVerification == null || !userVerification.isVerified()) {
            response.put("error", "Please verify your email before logging in");
            return ResponseEntity.status(403).body(response);
        }

        // Create authentication token
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                user.getEmail(),
                null,
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );

        // Set authentication in security context
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(authToken);
        SecurityContextHolder.setContext(securityContext);

        // Create or update session
        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(SPRING_SECURITY_CONTEXT_KEY, securityContext);

        // Return user data
        UserDTO userDTO = userMapper.toUserDTO(user);
        response.put("success", true);
        response.put("user", userDTO);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkAuth(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        HttpSession session = request.getSession(false);
        if (session == null) {
            response.put("authenticated", false);
            return ResponseEntity.ok(response);
        }

        SecurityContext context = (SecurityContext) session.getAttribute(SPRING_SECURITY_CONTEXT_KEY);
        if (context == null || context.getAuthentication() == null || !context.getAuthentication().isAuthenticated()) {
            response.put("authenticated", false);
            return ResponseEntity.ok(response);
        }

        String email = context.getAuthentication().getName();
        User user = userRepository.findUserByEmail(email).orElse(null);
        
        if (user == null) {
            response.put("authenticated", false);
            return ResponseEntity.ok(response);
        }

        UserDTO userDTO = userMapper.toUserDTO(user);
        response.put("authenticated", true);
        response.put("user", userDTO);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logged out successfully");
        
        return ResponseEntity.ok(response);
    }

    @Data
    static class LoginRequest {
        private String email;
        private String password;
    }
}
