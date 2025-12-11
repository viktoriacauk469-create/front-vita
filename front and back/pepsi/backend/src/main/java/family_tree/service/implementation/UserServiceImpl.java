package family_tree.service.implementation;

import family_tree.dto.UserDTO;
import family_tree.exception.UserNotFoundException;
import family_tree.logger.Logger;
import family_tree.mapper.EnumMapper;
import family_tree.mapper.UserMapper;
import family_tree.model.PersonalInformation;
import family_tree.model.User;
import family_tree.model.UserVerification;
import family_tree.repository.UserRepository;
import family_tree.repository.UserVerificationRepository;
import family_tree.service.UserService;
import family_tree.util.RandomNumberGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserVerificationRepository userVerificationRepository;
    private final Logger securityLogger;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final EnumMapper enumMapper;

    @Override
    @Transactional
    public UserDTO register(UserDTO userDTO, RandomNumberGenerator.VerificationCode verificationCode) {

        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = User.builder()
                .email(userDTO.getEmail())
                .password(passwordEncoder.encode(userDTO.getPassword()))
                .build();
        
        // Ініціалізувати колекцію, якщо вона null
        if (user.getPersonalInformation() == null) {
            user.setPersonalInformation(new ArrayList<>());
        }

        User savedUser = userRepository.save(user);

        UserVerification userVerification = UserVerification.builder()
                .user(savedUser) // <- важливо прив'язати користувача
                .verificationToken(verificationCode.code())
                .verificationTokenExpiry(verificationCode.expiry())
                .isVerified(false)
                .build();

        userVerificationRepository.save(userVerification);

        // Створити PersonalInformation для користувача, якщо є дані
        if (userDTO.getFirstName() != null || userDTO.getLastName() != null || 
            userDTO.getBloodType() != null || userDTO.getDiseases() != null) {
            
            PersonalInformation.PersonalInformationBuilder builder = PersonalInformation.builder()
                    .user(savedUser)
                    .isMainProfile(true);
            
            if (userDTO.getFirstName() != null) {
                builder.firstName(userDTO.getFirstName());
            }
            if (userDTO.getLastName() != null) {
                builder.lastName(userDTO.getLastName());
            }
            if (userDTO.getAge() != null) {
                builder.age(userDTO.getAge());
            }
            if (userDTO.getGender() != null) {
                builder.gender(enumMapper.stringToGender(userDTO.getGender()));
            }
            if (userDTO.getBloodType() != null) {
                builder.bloodType(enumMapper.stringToBloodType(userDTO.getBloodType()));
            }
            if (userDTO.getRhesusFactor() != null) {
                builder.rhesusFactor(enumMapper.stringToRhesusFactor(userDTO.getRhesusFactor()));
            }
            if (userDTO.getDiseases() != null) {
                builder.disease(userDTO.getDiseases());
            }
            if (userDTO.getDateOfBirth() != null) {
                builder.dateOfBirth(java.time.LocalDate.parse(userDTO.getDateOfBirth()));
            }
            
            PersonalInformation personalInfo = builder.build();
            savedUser.getPersonalInformation().add(personalInfo);
            userRepository.save(savedUser);
        }

        securityLogger.logRegistrationSuccess(savedUser.getEmail());

        return userMapper.toUserDTO(savedUser);
    }

    @Override
    @Transactional
    public UserDTO updateUser(UserDTO userDTO) {
        User user = userRepository.findById(userDTO.getId())
                .orElseThrow(() -> new RuntimeException("Користувача не знайдено"));

        PersonalInformation personalInformation = user.getPersonalInformation().stream()
                .filter(PersonalInformation::getIsMainProfile)
                .findFirst()
                .orElseGet(() -> {
                    PersonalInformation pi = PersonalInformation.builder()
                            .user(user)
                            .isMainProfile(true)
                            .build();
                    user.getPersonalInformation().add(pi);
                    return pi;
                });

        personalInformation.setFirstName(userDTO.getFirstName());
        personalInformation.setLastName(userDTO.getLastName());
        personalInformation.setAge(userDTO.getAge());
        personalInformation.setGender(enumMapper.stringToGender(userDTO.getGender()));

        if (userDTO.getBloodType() != null)
            personalInformation.setBloodType(enumMapper.stringToBloodType(userDTO.getBloodType()));
        if (userDTO.getRhesusFactor() != null)
            personalInformation.setRhesusFactor(enumMapper.stringToRhesusFactor(userDTO.getRhesusFactor()));

        userRepository.save(user);
        return userMapper.toUserDTO(user);
    }

    @Override
    public void deleteUser(String email) {
        if (email == null) {
            throw new UserNotFoundException("user.not_found");
        }
        userRepository.deleteByEmail(email);
    }

    @Override
    @Transactional
    public void changePassword(String email, String newPassword) {
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("user.not_found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        securityLogger.logPasswordResetSuccess(email);
        userRepository.save(user);
    }

    @Override
    public Boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public UserDTO getUserByEmail(String email) {
        return userRepository
                .findUserByEmail(email)
                .map(userMapper::toUserDTO).orElseThrow(() -> new UserNotFoundException("User with email: " + email + "not found"));
    }

    @Override
    public Optional<UserDTO> getUserById(Long id) {
        return userRepository
                .findUserById(id)
                .map(userMapper::toUserDTO);
    }

    @Override
    @Transactional
    public boolean verifyUserByCode(String email, String code) {
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("user.not_found"));

        UserVerification userVerification = userVerificationRepository.findByUser(user)
                .orElseThrow(() -> new UserNotFoundException("User is not already registered"));

        if (userVerification.isVerified()) return true; // already verified

        if (userVerification.getVerificationToken() == null) return false;
        if (!userVerification.getVerificationToken().equals(code)) return false;
        LocalDateTime expiry = userVerification.getVerificationTokenExpiry();
        if (expiry == null || expiry.isBefore(LocalDateTime.now())) return false;

        // Code matches and is not expired - mark as verified
        userVerification.setVerified(true);
        userVerification.setVerificationToken(null);
        userVerification.setVerificationTokenExpiry(null);
        userVerificationRepository.save(userVerification);

        securityLogger.logRegistrationSuccess(email);
        return true;
    }

    @Override
    @Transactional
    public void markAsVerified(String email) {
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("user.not_found"));

        UserVerification userVerification = userVerificationRepository.findByUser(user)
                .orElseThrow(() -> new UserNotFoundException("User is not already registered"));

        userVerification.setVerified(true);
        userVerification.setVerificationToken(null);
        userVerification.setVerificationTokenExpiry(null);

        userVerificationRepository.save(userVerification);

        securityLogger.logRegistrationSuccess(email);
    }
}
