export default interface Response<T> {
    message: string;
    data: T | null;
    error: Error | null;
}
