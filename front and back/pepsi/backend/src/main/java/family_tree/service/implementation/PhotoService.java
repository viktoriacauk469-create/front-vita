package family_tree.service.implementation;

import family_tree.exception.PersonNotFoundException;
import family_tree.model.PersonalInformation;
import family_tree.repository.PersonalInformationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PhotoService {

    private final PersonalInformationRepository personalInformationRepository;

    @Value("${app.upload.dir:uploads/photos}")
    private String uploadDir;

    @Value("${app.upload.max-file-size:10485760}") // 10MB
    private long maxFileSize;

    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    @Transactional
    public PersonalInformation uploadPhoto(Long personId, MultipartFile file) throws IOException {
        validateFile(file);

        PersonalInformation person = personalInformationRepository.findById(personId)
                .orElseThrow(() -> new PersonNotFoundException("Person with" + personId + "not found"));

                        // Видалити старе фото якщо є
        if (person.hasPhoto()) {
            deleteOldPhoto(person);
        }

        createUploadDirectoryIfNotExists();

        String fileName = generateUniqueFileName(file.getOriginalFilename());

        Path filePath = saveFileToStorage(file, fileName);

        person.setPhoto(fileName, filePath.toString());

        PersonalInformation savedPerson = personalInformationRepository.save(person);
        return savedPerson;
    }

    /**
     * Отримати дані фото персони
     */
    public byte[] getPersonPhoto(Long personId) throws IOException {
        PersonalInformation person = personalInformationRepository.findById(personId)
                .orElseThrow(() -> new PersonNotFoundException("Person with" + personId + "not found"));

        if (!person.hasPhoto()) {
            throw new PersonNotFoundException("Person with" + personId + "not found");
        }

        Path filePath = Paths.get(person.getPhotoFilePath());

        if (!Files.exists(filePath)) {
            throw new PersonNotFoundException("Person with" + personId + "not found");
        }

        return Files.readAllBytes(filePath);
    }

    /**
     * Видалити фото персони
     */
    @Transactional
    public void deletePersonPhoto(Long personId) throws IOException {
        PersonalInformation person = personalInformationRepository.findById(personId)
                .orElseThrow(() -> new PersonNotFoundException("Person with" + personId + "not found"));

        if (!person.hasPhoto()) {
            throw new PersonNotFoundException("Person with" + personId + "not found");
        }

        // Видалити файл з диску
        deleteOldPhoto(person);

        // Очистити поля фото в БД
        person.removePhoto();
        personalInformationRepository.save(person);
    }


    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException("The file size exceeds the maximum allowed (" + maxFileSize + " bite)");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Unsupported file type. Allowed: " + ALLOWED_CONTENT_TYPES);
        }
    }

    private void createUploadDirectoryIfNotExists() throws IOException {
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
    }

    private String generateUniqueFileName(String originalFileName) {
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        return UUID.randomUUID().toString() + extension;
    }

    private Path saveFileToStorage(MultipartFile file, String fileName) throws IOException {
        Path filePath = Paths.get(uploadDir, fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        return filePath;
    }

    private void deleteOldPhoto(PersonalInformation person) throws IOException {
        if (person.getPhotoFilePath() != null) {
            Path oldFilePath = Paths.get(person.getPhotoFilePath());
            Files.deleteIfExists(oldFilePath);
        }
    }
}