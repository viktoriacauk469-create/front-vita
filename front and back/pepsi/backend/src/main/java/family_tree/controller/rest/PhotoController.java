package family_tree.controller.rest;

import family_tree.model.PersonalInformation;

import family_tree.service.implementation.PhotoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
@Slf4j
public class PhotoController {

    private final PhotoService photoService;

    /**
     * Завантажити/замінити фото для персони
     */
    @PostMapping("/upload/{personId}")
    public ResponseEntity<?> uploadPhoto(
            @PathVariable Long personId,
            @RequestParam("file") MultipartFile file) {
        try {
            PersonalInformation person = photoService.uploadPhoto(personId, file);
            return ResponseEntity.ok("Фото успішно завантажено для " + person.getFirstName());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Помилка валідації: " + e.getMessage());
        } catch (IOException e) {
            log.error("Помилка завантаження файлу", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Помилка завантаження файлу");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Отримати фото персони
     */
    @GetMapping("/person/{personId}")
    public ResponseEntity<byte[]> getPersonPhoto(@PathVariable Long personId) {
        try {
            byte[] photoData = photoService.getPersonPhoto(personId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);

            return ResponseEntity.ok()

                    .headers(headers)
                    .body(photoData);
        } catch (IOException e) {
            log.error("Помилка читання файлу фото для персони з ID: {}", personId, e);
            return ResponseEntity.notFound().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Видалити фото персони
     */
    @DeleteMapping("/person/{personId}")
    public ResponseEntity<?> deletePersonPhoto(@PathVariable Long personId) {
        try {
            photoService.deletePersonPhoto(personId);
            return ResponseEntity.ok("Фото успішно видалено");
        } catch (IOException e) {
            log.error("Помилка видалення файлу фото для персони з ID: {}", personId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Помилка видалення файлу");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}