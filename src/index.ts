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

import bodyParser from "body-parser";
import express from "express";
import {ReadStream} from "fs";
const cors = require('cors');
const busboy = require('connect-busboy');

import {FlmngrExpressConfig} from "./FlmngrExpressConfig";
import {ExpressRequest} from "./ExpressRequest";
import {FlmngrServer} from "@flmngr/flmngr-server-node";

export {FlmngrExpressConfig} from "./FlmngrExpressConfig";
export function bindFlmngr(config: FlmngrExpressConfig): void {

    config.app.use(cors());
    config.app.use(busboy());

    config.app.use(config.urlFileManager, bodyParser.json());
    config.app.use(config.urlFileManager, bodyParser.urlencoded({extended: true}));

    if (!!config.urlFiles) {
        // Serve static files uploaded to the storage
        config.app.use(
            config.urlFiles,
            express.static(config.dirFiles)
        );
    }

    config.app.post(config.urlFileManager, (req: express.Request, res: express.Response) => {

        config.request = new ExpressRequest(req);

        // The BusBoy library is used to parse another POST requests with "multipart/form-data" encoding.
        // Almost all the requests have "application/x-www-form-urlencoded" encoding,
        // and only the upload request containing a file is sent in multipart format.
        let busboy = (req as any).busboy;
        busboy.on('file', function(fieldname: string, file: any, filename: string, encoding: string, mimetype: string) {

            if (fieldname === "file") {
                (req as any)["postFile"] = {
                    "filename": filename,
                    "data": null
                };
                file.on('data', function (data: Buffer) {
                    let oldData: Buffer = (req as any)["postFile"]["data"];
                    let newData = oldData == null ? data : Buffer.concat([oldData, data]);
                    (req as any)["postFile"]["data"] = newData;
                });
            }
        });
        busboy.on('field', (fieldname: string, val: any, fieldnameTruncated: string, valTruncated: any, encoding: string, mimetype: string) => {
            req.body[fieldname] = val;
        });
        busboy.on('finish', () => {
            FlmngrServer.flmngrRequest(
                config,
                {
                    onFinish: (
                        httpStatusCode: number,
                        headers: { [key: string]: string },
                        response: string |                               // - only together with httpStatusCode != 200
                                  { error: string | null, data: any } |  // - normal response
                                  ReadStream                             // - when sending a file
                    ) => {
                        for (const headerName in headers)
                            res.header(headerName, headers[headerName]);
                        res.statusCode = httpStatusCode;

                        if (typeof response === "string") {
                            res.send(response);
                        } else if (typeof response === "object" && response.constructor.name === "ReadStream") {
                            (response as ReadStream).pipe(res);
                        } else {
                            res.json(response);
                        }
                    },
                    onLogError: (error: string) => {
                        config.onLogError || console.log(error);
                    }
                },
                config.overrideFramework || "express"
            ).then(r  => {});
        });
        req.pipe(busboy);

    })

}