export const cn = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
};

export const convert1DTo2d = <T>(data: T[], rows: number) => {
    const res: T[][] = [];

    let temp: T[] = [];
    for (let i = 0; i < data.length; ++i) {
        if (temp.length === rows || i === data.length - 1) {
            res.push(temp);
            temp = [];
        }
        temp.push(data[i]);
    }

    return res;
};
