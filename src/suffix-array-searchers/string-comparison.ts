
export class StringComparison {

    public static compareOrdinal(
        strA: string,
        indexA: number,
        strB: string,
        indexB: number,
        length: number
    ): number {

        const endA = Math.min(indexA + length, strA.length);
        const endB = Math.min(indexB + length, strB.length);

        let iA = indexA;
        let iB = indexB;

        while (iA < endA && iB < endB) {
            const codeA = strA.charCodeAt(iA);
            const codeB = strB.charCodeAt(iB);

            if (codeA < codeB) {
                return -1;
            }
            if (codeA > codeB) {
                return 1;
            }

            iA++;
            iB++;
        }

        const lenComparedA = endA - indexA;
        const lenComparedB = endB - indexB;

        if (lenComparedA === lenComparedB) {
            return 0;
        }
        return lenComparedA < lenComparedB ? -1 : 1;
    }
}
