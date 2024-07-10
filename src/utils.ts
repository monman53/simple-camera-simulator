export const humanReadable = (x: number) => {
    return x.toPrecision(4);
}

export const removeElement = (arr: any[], idx: number) => {
    if (window.confirm("Really remove?")) {
        arr.splice(idx, 1)
    }
}