import { DataValueRepository } from "../repositories/DataValueRepository";
import { FutureData } from "../../data/future";
import { Id } from "../entities/Base";
import { DataElement } from "../entities/DataElement";

export class PostDataValueCommentUseCase {
    constructor(private dataValueRepository: DataValueRepository) {}

    execute(options: { orgUnitId: Id; period: string; dataFormId: Id; dataElement: DataElement }): FutureData<void> {
        const { dataElement, dataFormId } = options;

        return this.dataValueRepository.postValue({
            dataValue: {
                dataSetId: dataFormId,
                orgUnitId: options.orgUnitId,
                period: options.period,
                dataElementId: dataElement.id,
                //categoryOptionComboId: config.categoryOptionCombos.default.id,
                comment: dataElement.comment,
            },
        });
    }
}
