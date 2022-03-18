import { jest, expect, describe, test, beforeEach } from "@jest/globals";
import Server from "../../../server/server.js";
import superTest from "supertest";
import portfinder from "portfinder";
import { Transform } from "stream";
import { setTimeout } from "timers/promises"

const RETENTION_DATA_PERIOD = 200;

const getAvailablePort = portfinder.getPortPromise;

describe("API E2E Test Suite", () => {

    const commandResponse = JSON.stringify({
        result: "ok"
    });

    const possibleCommands = {
        start: "start",
        stop: "stop",
    };

    const testServer = superTest(Server());

    test("GET /unknown - given an unknown route it shoudl return a 404 status code", async () => {
        const response = await testServer.get('/unkown');
        expect(response.statusCode).toStrictEqual(404);
    });

    function pipeAndReadStreamData(stream, onChunk) {
        const transform = new Transform({
            transform(chunk, enc, cb) {
                onChunk(chunk);
                cb(null, chunk);
            }
        });

        return stream.pipe();
    }

    function commandSender(testServer) {
        return {
            async send(command) {
                const response = 
                    await testServer
                        .post('/controller')
                        .send({
                            command
                        });
                
                expect(response.text).toStrictEqual(commandResponse);
            }
        }
    }

    describe("client workflow", () => {

        async function getTestServer() {
            const getSuperTest = port => superTest(`http://localhost:${port}`);
            const port = await getAvailablePort();

            return new Promise((resolve, reject) => {
                const server = Server().listen(port)
                    .once("listening", () => {
                        const testServer = getSuperTest(port);
                        const response = {
                            testServer,
                            kill() {
                                server.close();
                            },
                        };

                        return resolve(response);
                    })
                    .once("error", reject);
            })
        }

        test("it should not receive data stream if the process is not playing", async () => {
            const server = await getTestServer();
            const onChunk = jest.fn();
            pipeAndReadStreamData(
                server.testServer.get("/stream"),
                onChunk
            );
            
            await setTimeout(RETENTION_DATA_PERIOD);

            server.kill();
            
            expect(onChunk).not.toHaveBeenCalled();

        });
        test("it should receive data stream if the process is playing", async () => {
            const server = await getTestServer();
            const onChunk = jest.fn();
            const {
                send 
            } = commandSender(server.testServer);

            pipeAndReadStreamData(
                server.testServer.get("/stream"),
                onChunk
            );

            await send(possibleCommands.start);
            await setTimeout(RETENTION_DATA_PERIOD);
            await send(possibleCommands.stop);

            const [
                [buffer]
            ] = onChunk.mock.calls

            expect(buffer).toBeInstanceOf(Buffer);
            expect(buffer.length).toBeGreaterThan(1000);

            server.kill();
        });
    })
});