declare module 'estraverse' {
    export interface Visitor {
        enter?: (node: any, parent: any) => void;
        leave?: (node: any, parent: any) => void;
    }

    export function traverse(ast: any, visitor: Visitor): void;
}
