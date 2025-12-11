package family_tree.exception;

public class UserIsNotRegisteredException extends RuntimeException {
    public UserIsNotRegisteredException(String message) {
        super(message);
    }
}
