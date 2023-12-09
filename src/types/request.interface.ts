import { Request } from "express";

export type RequestWithUserPayload = Request & {
    user?: JWTPayload;
};

export interface JWTPayload {
    username: string;
    fName: string;
    iat: number;
}
