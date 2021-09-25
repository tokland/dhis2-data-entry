export type Id = string;
export type Code = string;

export interface Ref {
    id: Id;
}

export interface NamedRef extends Ref {
    name: string;
}

export interface CodedRef extends Ref {
    code: Code;
}

export function getId<Obj extends Ref>(obj: Obj): Id {
    return obj.id;
}

export function getRef<Obj extends Ref>(obj: Obj): Ref {
    return { id: obj.id };
}

export function buildRef(id: Id): Ref {
    return { id: id };
}

export function getCode<Obj extends { code: string }>(obj: Obj): string {
    return obj.code;
}
