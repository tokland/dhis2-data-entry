import { CancelableResponse } from "@eyeseetea/d2-api/repositories/CancelableResponse";
// TODO: Use entity Future
import { Future } from "../utils/future";

export type FutureData<Data> = Future<string, Data>;

export function toFuture<Data>(res: CancelableResponse<Data>): FutureData<Data> {
    return Future.fromComputation((resolve, reject) => {
        res.getData()
            .then(resolve)
            .catch(err => {
                const message = err?.response?.data?.message || err?.message || "Unknown error";
                return reject(message.trim());
            });

        return () => res.cancel();
    });
}

export function toGenericFuture<Error, Data>(res: CancelableResponse<Data>): Future<Error, Data> {
    return Future.fromComputation((resolve, reject) => {
        res.getData()
            .then(resolve)
            .catch(err => {
                return reject(err);
            });

        return () => res.cancel();
    });
}

export function fromPromise<Data>(res: Promise<Data>): Future<string, Data> {
    return Future.fromComputation((resolve, reject) => {
        res.then(resolve).catch(err => {
            return reject(err.toString());
        });

        return () => {};
    });
}

export function toPromise<Data>(future$: FutureData<Data>): Promise<Data> {
    return future$.toPromise(errorMsg => new Error(errorMsg));
}
