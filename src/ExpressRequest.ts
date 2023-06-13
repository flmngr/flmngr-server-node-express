/**
 *
 * Flmngr server package for Node (Express).
 *
 * This file is a part of the server side implementation of Flmngr -
 * the JavaScript/TypeScript file manager widely used for building apps and editors.
 *
 * Comes as a standalone package for custom integrations,
 * and as a part of N1ED web content builder.
 *
 * Flmngr file manager:       https://flmngr.com
 * N1ED web content builder:  https://n1ed.com
 * Developer website:         https://edsdk.com
 *
 * License: GNU General Public License Version 3 or later
 *
 **/

import express from "express";
import {FlmngrRequest} from "@flmngr/flmngr-server-node";

export class ExpressRequest implements FlmngrRequest {

    constructor(
        protected req: express.Request,
    ) {}

    public getParameterNumber(name: string, defaultValue?: number): number {
        let strValue = this.getParameterString(name, null);

        let isCorrectNumber = true;
        if (strValue !== null) {
            isCorrectNumber = "" + parseInt(strValue) === strValue;
        } else {
            isCorrectNumber = false;
        }

        if (isCorrectNumber)
            return parseInt(strValue);
        else
            return defaultValue;
    }

    public getParameterString(name: string, defaultValue?: string): string {
        let value = this.req.body[name];
        if (typeof value === "string") // may be string[]
            return value;
        else
            return defaultValue;
    }

    public getParameterStringArray(name: string, defaultValue?: string[]): string[] {
        let value = this.req.body[name];
        if (typeof value === "string")
            value = [ value ];
        if (Array.isArray(value))
            return value;
        else
            return defaultValue;
    }

    public getParameterFile(name: string): { data: Buffer; fileName: string } {
        if (!("postFile" in this.req))
            return null;
        return {
            data: (this.req["postFile"] as any)["data"],
            fileName: (this.req["postFile"] as any)["filename"]["filename"]
        };
    }

}