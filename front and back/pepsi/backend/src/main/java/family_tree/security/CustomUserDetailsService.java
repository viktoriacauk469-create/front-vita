package family_tree.security;

import family_tree.exception.UserIsNotRegisteredException;
import family_tree.model.User;
import family_tree.model.UserVerification;
import family_tree.repository.UserRepository;
import family_tree.repository.UserVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserVerificationRepository userVerificationRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        UserVerification userVerification = userVerificationRepository.findByUser(user)
                .orElseThrow(() -> new UserIsNotRegisteredException(" User is not registered "));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                userVerification.isVerified(),
                true,
                true,
                true,
                Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }
}
