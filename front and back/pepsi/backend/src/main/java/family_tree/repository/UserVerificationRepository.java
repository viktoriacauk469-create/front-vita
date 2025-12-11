package family_tree.repository;

import family_tree.model.User;
import family_tree.model.UserVerification;
import jdk.jfr.Registered;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserVerificationRepository extends JpaRepository<UserVerification, Long> {

    Optional<UserVerification> findByUser(User user);

    Optional<UserVerification> findById(Long userId);

    Optional<UserVerification> findByVerificationToken(String token);

    boolean existsByUser(User user);
}
