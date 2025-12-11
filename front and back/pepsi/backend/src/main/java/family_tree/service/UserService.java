package family_tree.service;

import family_tree.dto.UserDTO;
import family_tree.model.enums.Role;
import family_tree.util.RandomNumberGenerator;

import java.util.List;
import java.util.Optional;

public interface UserService {

    UserDTO register(UserDTO userDTO, RandomNumberGenerator.VerificationCode verificationCode);
    UserDTO updateUser(UserDTO user);
    void deleteUser(String email);
    void changePassword(String email, String newPassword);

    Boolean existsByEmail(String email);
    UserDTO getUserByEmail(String email);
    Optional<UserDTO> getUserById(Long id);

    // New methods for verification
    boolean verifyUserByCode(String email, String code);
    void markAsVerified(String email);
}
