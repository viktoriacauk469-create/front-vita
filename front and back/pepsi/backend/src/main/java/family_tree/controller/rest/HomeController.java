package family_tree.controller.rest;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String helloWorld() {
        return "Hello world!";
    }
}
// solve conflict

