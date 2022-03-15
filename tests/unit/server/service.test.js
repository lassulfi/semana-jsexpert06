import { jest, expect, describe, test, beforeEach } from "@jest/globals";
import fs from "fs";
import config from "../../../server/config.js";
import { Service } from "../../../server/service.js";
import TestUtil from "../_util/testUtil.js";
import fsPromises from "fs/promises";
import path from 'path';

const {
    dir: {
        publicDirectory
    },
    pages: {
        homeHTML,
    }
} = config;

describe("#Service - test suite with business rules or processing", () => {

    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    describe("#createFileStream", () => {
        test("should create a readable file stream", () => {
            const service = new Service();

            const mockFileStream = TestUtil.generateReadableStream(['data']);

            jest.spyOn(fs, fs.createReadStream.name)
                .mockReturnValue(mockFileStream);

            const fileStream = service.createFileStream(homeHTML);

            expect(fs.createReadStream).toHaveBeenCalledWith(homeHTML);
            expect(fs.createReadStream).toHaveBeenCalledTimes(1);
            expect(fileStream).toEqual(mockFileStream);
        });
    });

    describe("#getFileInfo", () => {
        test("should return file info", async () => {
            const service = new Service();

            jest.spyOn(fsPromises, fsPromises.access.name).mockReturnValue();

            const extension = `.${homeHTML.split('.')[1]}`;
            const fullFilePath = path.join(publicDirectory, homeHTML);

            const fileInfo = await service.getFileInfo(homeHTML);

            expect(fsPromises.access).toHaveBeenCalledWith(fullFilePath);
            expect(fsPromises.access).toHaveBeenCalledTimes(1);
            expect(fileInfo).toEqual({
                type: extension,
                name: fullFilePath,
            });
        });
    });

    describe("#getFileStream", () => {
        test("should return a readable file stream", async () => {
            const service = new Service();

            const mockFileStream = TestUtil.generateReadableStream(['data']);

            const fullFilePath = path.join(publicDirectory, homeHTML);

            const extension = `.${homeHTML.split('.')[1]}`;

            jest.spyOn(fs, fs.createReadStream.name)
                .mockReturnValue(mockFileStream);

            jest.spyOn(fsPromises, fsPromises.access.name).mockReturnValue();

            const fileStream = await service.getFileStream(homeHTML);

            expect(fs.createReadStream).toHaveBeenCalledWith(fullFilePath);
            expect(fs.createReadStream).toHaveBeenCalledTimes(1);
            expect(fsPromises.access).toHaveBeenCalledWith(fullFilePath);
            expect(fsPromises.access).toHaveBeenCalledTimes(1);
            expect(fileStream).toEqual({
                stream: mockFileStream,
                type: extension,
            });
        });
    });

});
