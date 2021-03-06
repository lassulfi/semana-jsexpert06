import { jest, expect, describe, test, beforeEach } from "@jest/globals";
import config from "../../../server/config.js";
import { Controller } from "../../../server/controller.js"
import { Service } from "../../../server/service.js";
import TestUtil from "../_util/testUtil.js";

const {
    pages: {
        homeHTML
    }
} = config

describe("#Controller - test suite for intermediation layer between business rules layer and presentation layer", () => {
    
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    test('should return a file stream', async () => {
        const controller = new Controller();

        const fileExtension = '.ext';
        
        const mockFileStream = TestUtil.generateReadableStream(['data']);
        
        jest.spyOn(
            Service.prototype,
            Service.prototype.getFileStream.name
        ).mockReturnValue({
            stream: mockFileStream, 
            type: fileExtension
        });

        const fileStream = await controller.getFileStream(homeHTML);

        expect(Service.prototype.getFileStream).toBeCalledTimes(1);
        expect(Service.prototype.getFileStream).toHaveBeenCalledTimes(1);
        expect(fileStream).toEqual({
            stream: mockFileStream,
            type: fileExtension
        });
    });
});