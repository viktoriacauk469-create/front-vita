package family_tree.repository;

import family_tree.model.PersonalInformation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PersonalInformationRepository extends JpaRepository<PersonalInformation, Long> {

    List<PersonalInformation> findByUserId(Long userId);


}
