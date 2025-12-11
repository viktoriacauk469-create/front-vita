package family_tree.mapper;

import family_tree.model.PersonalInformation;
import family_tree.model.User;
import family_tree.dto.UserDTO;
import family_tree.model.enums.BloodType;
import family_tree.model.enums.RhesusFactor;
import family_tree.model.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class UserMapper {

    private final EnumMapper enumMapper;

    public UserDTO toUserDTO(User user) {
        if (user == null) return null;

        Optional<PersonalInformation> personalOpt = Optional.ofNullable(user.getPersonalInformation())
                .orElse(Collections.emptyList())
                .stream()
                .filter(pi -> Boolean.TRUE.equals(pi.getIsMainProfile()))
                .findFirst();


        UserDTO dto = UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .firstName(personalOpt.map(PersonalInformation::getFirstName).orElse(null))
                .lastName(personalOpt.map(PersonalInformation::getLastName).orElse(null))
                .age(personalOpt.map(PersonalInformation::getAge).orElse(null))
                .gender(personalOpt.map(personalInformation -> enumMapper.genderToString(personalInformation.getGender())).orElse(null))
                .bloodType(personalOpt.map(pi -> pi.getBloodType() != null ? pi.getBloodType().name() : null).orElse(null))
                .rhesusFactor(personalOpt.map(pi -> pi.getRhesusFactor() != null ? pi.getRhesusFactor().name() : null).orElse(null))
                .diseases(personalOpt.map(PersonalInformation::getDisease).orElse(null))
                .dateOfBirth(personalOpt.map(pi -> pi.getDateOfBirth() != null ? pi.getDateOfBirth().toString() : null).orElse(null))
                .build();

        return dto;
    }

    public User toUser(UserDTO dto) {
        if (dto == null) return null;

        User user = User.builder()
                .id(dto.getId())
                .email(dto.getEmail())
                .role(dto.getRole() != null ? Role.valueOf(dto.getRole()) : Role.USER)
                .build();

        if (dto.getFirstName() != null || dto.getLastName() != null) {
            PersonalInformation pi = PersonalInformation.builder()
                    .firstName(dto.getFirstName())
                    .lastName(dto.getLastName())
                    .bloodType(dto.getBloodType() != null ? BloodType.valueOf(dto.getBloodType()) : null)
                    .rhesusFactor(dto.getRhesusFactor() != null ? RhesusFactor.valueOf(dto.getRhesusFactor()) : null)
                    .user(user)
                    .isMainProfile(true) // основний профіль
                    .build();
            user.getPersonalInformation().add(pi);
        }

        return user;
    }
}

