package family_tree.mapper;

import family_tree.model.enums.BloodType;
import family_tree.model.enums.Gender;
import family_tree.model.enums.RhesusFactor;
import family_tree.model.enums.Role;
import org.springframework.stereotype.Component;

@Component
public class EnumMapper {

    // == Role ==
    public String roleToString(Role role) {
        return role == null ? null : role.name();
    }
    public Role stringToRole(String role) {
        return role == null ? null : Role.valueOf(role);
    }

    // == BloodType ==
    public String bloodTypeToString(BloodType bloodType) {
        return bloodType == null ? null : bloodType.name();
    }
    public BloodType stringToBloodType(String bloodType) {
        return bloodType == null ? null : BloodType.valueOf(bloodType);
    }

    // == RhesusFactor ==
    public String rhesusFactorToString(RhesusFactor rhesusFactor) {
        return rhesusFactor == null ? null : rhesusFactor.name();
    }
    public RhesusFactor stringToRhesusFactor(String rhesusFactor) {
        return rhesusFactor == null ? null : RhesusFactor.valueOf(rhesusFactor);
    }

    // == Gender ==
    public String genderToString(Gender gender) {
        return gender == null ? null : gender.name();
    }
    public Gender stringToGender(String gender) {
        return gender == null ? null : Gender.valueOf(gender);
    }

}
