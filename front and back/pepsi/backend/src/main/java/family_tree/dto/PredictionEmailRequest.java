package family_tree.dto;

import lombok.Data;

import java.util.Map;

@Data
public class PredictionEmailRequest {
    private String toEmail;
    private ParentDTO father;
    private ParentDTO mother;
    private Map<String, Double> aboProbabilities;
    private Map<String, Double> rhProbabilities;

    @Data
    public static class ParentDTO {
        private String bloodType;
        private String rh;
    }
}
