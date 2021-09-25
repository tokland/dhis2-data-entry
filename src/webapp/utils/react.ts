export function component<Props>(comp: React.FC<Props>): React.FC<Props> {
    comp.displayName = comp.name.replace(/_+$/, "");
    return comp;
}
