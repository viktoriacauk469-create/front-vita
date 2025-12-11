package family_tree.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {

    private Long id;
    private String email;
    private String password;
    private String role;

    // parameters that have personal_information (PersonalInformation class includes that parameters)
    private String firstName;
    private String lastName;
    private Integer age;
    private String gender;
    private String bloodType;
    private String rhesusFactor;
    private String diseases;
    private String placeOfResidence;
    private String dateOfBirth;

}
