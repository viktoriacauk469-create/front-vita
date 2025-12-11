package family_tree.service;


import family_tree.model.PersonalInformation;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface PersonalService {
    PersonalInformation createPersonalForUser(Long userId, PersonalInformation personal);
    void removeRelative(Long personalId);
    List<PersonalInformation> getPersonalsForUser(Long userId);
    PersonalInformation addRelative(Long personId, Long relativeId);
    PersonalInformation removeRelative(Long personId, Long relativeId);
    PersonalInformation updatePerson(Long personId, PersonalInformation relative);
}
