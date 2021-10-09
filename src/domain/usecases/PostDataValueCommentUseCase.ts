import { DataValueRepository } from "../repositories/DataValueRepository";
import { FutureData } from "../../data/future";
import { Id } from "../entities/Base";
import { DataElement } from "../entities/DataElement";

export class PostDataValueCommentUseCase {
    constructor(private dataValueRepository: DataValueRepository) {}

    execute(options: {
        orgUnitId: Id;
        period: string;
        dataSetId: Id;
        dataElement: DataElement;
        comment: string;
    }): FutureData<void> {
        const { dataElement, dataSetId, comment } = options;

        return this.dataValueRepository.postValue({
            dataValue: {
                dataSetId: dataSetId,
                orgUnitId: options.orgUnitId,
                period: options.period,
                dataElementId: dataElement.id,
                comment,
            },
        });
    }
}
