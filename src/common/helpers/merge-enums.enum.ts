// 여러 enum을 하나로 합치는 헬퍼
export function mergeEnums<T extends object[]>(...enums: T) {
    return enums.reduce(
        (acc, cur) => {
            Object.assign(acc, cur);
            return acc;
        },
        {} as Record<string, string | number>,
    );
}
