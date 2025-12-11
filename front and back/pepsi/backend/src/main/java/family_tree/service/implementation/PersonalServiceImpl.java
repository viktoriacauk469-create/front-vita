package family_tree.service.implementation;

import family_tree.exception.PersonNotFoundException;
import family_tree.mapper.EnumMapper;
import family_tree.model.PersonalInformation;
import family_tree.model.User;
import family_tree.repository.PersonalInformationRepository;
import family_tree.repository.UserRepository;
import family_tree.service.PersonalService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PersonalServiceImpl implements PersonalService {

    private final PersonalInformationRepository personalRepository;
    private final UserRepository userRepository;
    private final EnumMapper enumMapper;

    @Override
    @Transactional
    public PersonalInformation createPersonalForUser(Long userId, PersonalInformation personal) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new PersonNotFoundException("User not found: " + userId));
        personal.setUser(user);
        PersonalInformation saved = personalRepository.save(personal);
        user.getPersonalInformation().add(saved);
        return saved;
    }

    @Override
    @Transactional
    public void removeRelative(Long personalId) {
        PersonalInformation personal = personalRepository.findById(personalId)
                .orElseThrow(() -> new PersonNotFoundException("Personal not found: " + personalId));
        personalRepository.delete(personal);
    }

    @Override
    public List<PersonalInformation> getPersonalsForUser(Long userId) {
        return personalRepository.findByUserId(userId);
    }

    @Override
    public PersonalInformation addRelative(Long personId, Long relativeId) {
        PersonalInformation person = personalRepository.findById(personId)
                .orElseThrow(() -> new PersonNotFoundException("Personal not found: " + personId));
        PersonalInformation relative = personalRepository.findById(relativeId)
                .orElseThrow(() -> new PersonNotFoundException("Personal not found: " + relativeId));

        person.addRelative(relative);

        personalRepository.save(person);
        personalRepository.save(relative);

        return person;
    }

    @Override
    public PersonalInformation removeRelative(Long personId, Long relativeId) {
        PersonalInformation person = personalRepository.findById(personId)
                .orElseThrow(() -> new PersonNotFoundException("Personal not found: " + personId));
        PersonalInformation relative = personalRepository.findById(relativeId)
                .orElseThrow(() -> new PersonNotFoundException("Personal not found: " + relativeId));

        person.removeRelative(relative);

        personalRepository.save(person);
        personalRepository.save(relative);

        return person;
    }

    @Override
    @Transactional
    public PersonalInformation updatePerson(Long personId, PersonalInformation updatedPerson) {
        if (updatedPerson == null) {
            throw new IllegalArgumentException("Updated data cannot be null");
        }

        PersonalInformation person = personalRepository.findById(personId)
                .orElseThrow(() -> new PersonNotFoundException("Personal not found: " + personId));

        if (updatedPerson.getFirstName() != null && !updatedPerson.getFirstName().trim().isEmpty()) {
            person.setFirstName(updatedPerson.getFirstName().trim());
        }

        if (updatedPerson.getMiddleName() != null) {
            person.setMiddleName(updatedPerson.getMiddleName().trim());
        }

        if (updatedPerson.getLastName() != null && !updatedPerson.getLastName().trim().isEmpty()) {
            person.setLastName(updatedPerson.getLastName().trim());
        }

        if (updatedPerson.getAge() != null && updatedPerson.getAge() >= 0) {
            person.setAge(updatedPerson.getAge());
        }

        if (updatedPerson.getDateOfBirth() != null) {
            person.setDateOfBirth(updatedPerson.getDateOfBirth());
        }

        if (updatedPerson.getGender() != null) {
            person.setGender(updatedPerson.getGender());
        }

        if (updatedPerson.getBloodType() != null) {
            person.setBloodType(updatedPerson.getBloodType());
        }

        if (updatedPerson.getRhesusFactor() != null) {
            person.setRhesusFactor(updatedPerson.getRhesusFactor());
        }

        if (updatedPerson.getDisease() != null) {
            person.setDisease(updatedPerson.getDisease());
        }

        return personalRepository.save(person);
    }
}
