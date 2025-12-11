package family_tree.mapper;

import family_tree.util.DataTransferObject;

public interface ClassMapper<E, DTO extends DataTransferObject> {

    E toEntity(DTO dto);
    DTO toDTO(E entity);

}