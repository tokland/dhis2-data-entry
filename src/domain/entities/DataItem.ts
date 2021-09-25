import _ from "lodash";
import { Code } from "./Base";
import { DataElement } from "./DataElement";
import { Indicator } from "./Indicator";

export type DataItem = { type: "dataElement"; item: DataElement } | { type: "indicator"; item: Indicator };

export type SortingInfo = SortingInfoItem[];

export interface SortingInfoItem {
    indicatorCode: Code;
    afterDataElementCode: Code;
}

/* Insert indicators after data elements matching with a sorting info object */
export function sortDataItems(
    dataElementItems: DataItem[],
    indicatorItems: DataItem[],
    sortingInfo: SortingInfo
): DataItem[] {
    const afterRelationships = _(sortingInfo)
        .groupBy(info => info.afterDataElementCode)
        .value();

    const indicatorItemsByCode = _.keyBy(indicatorItems, item => item.item.code);

    const baseItems = _(dataElementItems)
        .flatMap(dataElementItem => {
            const indicatorItemsAfter = _(afterRelationships[dataElementItem.item.code])
                .map(info => indicatorItemsByCode[info.indicatorCode])
                .compact()
                .value();
            return [dataElementItem, ...indicatorItemsAfter];
        })
        .value();

    const baseIds = baseItems.map(o => o.item.id);
    const indicatorItemsWithoutSortingInfo = indicatorItems.filter(o => !baseIds.includes(o.item.id));

    return _.concat(baseItems, indicatorItemsWithoutSortingInfo);
}
