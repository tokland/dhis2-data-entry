import { NamedRef } from "../../../domain/entities/Base";

export interface TreeViewNode {
    id: string;
    name: string;
    level: number;
    children: NamedRef[];
    strikeout?: boolean;
}
