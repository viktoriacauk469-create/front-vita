package family_tree.repository;

import family_tree.model.User;
import family_tree.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findUserById(Long id);
    Optional<User> findUserByEmail(String email);

    Boolean existsByEmail(String email);

    void deleteByEmail(String email);

}
