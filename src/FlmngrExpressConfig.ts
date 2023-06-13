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
import {FlmngrConfig} from "@flmngr/flmngr-server-node";

export interface FlmngrExpressConfigBase extends FlmngrConfig {
    urlFileManager: string;
    urlFiles?: string;
    overrideFramework?: string; // do not change this option in your custom integrations please
}

export interface FlmngrExpressConfig extends FlmngrExpressConfigBase {
    app: express.Express;
}