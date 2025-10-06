const axios2 = require("axios");

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const WS_URL = process.env.WS_URL || "ws://localhost:8080";
console.log(WS_URL)

const axios = {
    post: async (...args) => {
        try {
            const res = await axios2.post(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
    get: async (...args) => {
        try {
            const res = await axios2.get(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
    put: async (...args) => {
        try {
            const res = await axios2.put(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
    delete: async (...args) => {
        try {
            const res = await axios2.delete(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
}

describe("Authentication", () => {
    test("User is able to sign up and only once", async () => {
        const username = "testuser" + Math.random();
        const password = "pass1234";


        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin",
        });


        expect(response.status).toBe(200);
        const response2 = await axios.post(
            `${BACKEND_URL}/api/v1/signup`,
            {
                username,
                password,
                type: "admin",
            },
        );
        
        

        expect(response2.status).toBe(500);
    });

    test("User signup fails if username is empty or null", async () => {
        const username = "";
        const password = "pass1234";
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            password,
            type: "user"
        });
        expect(response.status).toBe(400);
        const response2 = await axios.post(
            `${BACKEND_URL}/api/v1/signup`,
            {
                username,
                password,
                type: "user"
            },
        );

        expect(response2.status).toBe(400);
    });

    test("User is able to sign in", async () => {
        const username = "testuser" + Math.random();
        const password = "pass1234";
        const iresponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "user"
        });

        expect(iresponse.status).toBe(200);
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
        });
        expect(response.status).toBe(200);
        expect(response.data.token).toBeDefined();
    });

    test("User is not able to sign in with incorrect password", async () => {
        const username = "testuser" + Math.random();
        const password = "pass1234";
        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "user"
        });

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password: "incorrectPassword",
        });
        expect(response.status).toBe(403);
    });
});

describe("User Information endpoints", () => {
    let token = null;
    let username = `testuserr-${Math.random()}`;
    let password = "pass1234";
    let avatarId = null;
    let userId = null;

    beforeAll(async () => {
        const signupResponse = await axios.post(
            `${BACKEND_URL}/api/v1/signup`,
            {
                username,
                password,
                type: "admin"
            },
        );

        userId = signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
        });

        token = response.data.token;

        const avatarResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/avatar`,
            {
                imageUrl: "https://image.com/avatar1.png",
                name: "Joe",
            },
            { headers: { authorization: `Bearer ${token}` } },
        );
        avatarId = avatarResponse.data.id;
    });

    test("User should not be able to update metadata with wrong avatarId", async () => {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1//user/metadata`,
            {
                avatarId: "999888777",
            },
            {
                headers: { authorization: `Bearer ${token}` },
            },
        );
        expect(response.status).toBe(400);
    });

    test("User should be able to update metadata with valid avatarId", async () => {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/user/metadata`,
            {
                avatarId: avatarId,
            },
            {
                headers: { authorization: `Bearer ${token}` },
            },
        );
        
        expect(response.status).toBe(200);
    });

    test("User should not be able to update metadata without auth headers", async () => {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/user/metadata`,
            {
                avatarId: avatarId,
            },
        );
        expect(response.status).toBe(401);
    });

    test("User should get metadata of other users", async () => {
        const response = await axios.get(
            `${BACKEND_URL}/api/v1/user/metadata/bulk?userIds=[${userId}]`,
        );

        expect(response.status).toBe(200);

        expect(response.data.avatars.length).toBe(1);
        expect(response.data.avatars[0].userId).toBe(avatarId);
    });

    test("Available avatars - list of recently creater avatars", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);
        expect(response.data.avatars.length).not.toBe(0);
        const currentAvatar = response.data.avatars.find(
            (avatar) => avatar.avatarId === avatarId,
        );
        expect(currentAvatar).toBeDefined();
    });
});

describe("Space Informations", () => {
    let element1Id = null;
    let element2Id = null;
    let adminToken = null;
    let adminId = null;
    let mapId = null;
    let userToken = null;
    let userId = null;

    beforeAll(async () => {
        let username = `testadmin-${Math.random()}`;
        let password = "pass1234";
        // Admin Sign up
        const signupResponse = await axios.post(
            `${BACKEND_URL}/api/v1/signup`,
            {
                username,
                password,
                type: "admin",
            },
        );
        adminId = signupResponse.data.userId;

        // Admin Sign in
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
        });

        adminToken = response.data.token;

        username = `testuser-${Math.random()}`;
        password = "pass1234";
        // user Sign up
        const userSignupResponse = await axios.post(
            `${BACKEND_URL}/api/v1/signup`,
            {
                username,
                password,
                type: "user",
            },
        );
        userId = userSignupResponse.data.userId;

        // user Sign in
        const userSignInResponse = await axios.post(
            `${BACKEND_URL}/api/v1/signin`,
            {
                username,
                password,
            },
        );

        userToken = userSignInResponse.data.token;

        const element1Response = await axios.post(
            `${BACKEND_URL}/api/v1/admin/element`,
            {
                imageUrl: "https://image.com/element1.png",
                width: 1,
                height: 1,
                static: true,
            },
            { headers: { authorization: `Bearer ${adminToken}` } },
        );

        const element2Response = await axios.post(
            `${BACKEND_URL}/api/v1/admin/element`,
            {
                imageUrl: "https://image.com/element2.png",
                width: 1,
                height: 1,
                static: true,
            },
            { headers: { authorization: `Bearer ${adminToken}` } },
        );

        element1Id = element1Response.data.elementId; // not element1.elementid?
        element2Id = element2Response.data.elementId;

        const mapResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/map`,
            {
                thumbnail: "https://thumbnail.com/a.png",
                dimensions: "100x200",
                name: "10 person interview room",
                elements: [
                    {
                        elementId: element1Id,
                        x: 20,
                        y: 20,
                    },
                    {
                        elementId: element2Id,
                        x: 18,
                        y: 20,
                    },
                    {
                        elementId: element2Id,
                        x: 18,
                        y: 19,
                    },
                ],
            },
            { headers: { authorization: `Bearer ${adminToken}` } },
        );

        mapId = mapResponse.data.mapId;
        
    });

    test("User should be able to create a space", async () => {
        
        const createSpaceResponse = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            {
                name: "Test",
                dimensions: "100x200",
                mapId: mapId,
            },
            { headers: { authorization: `Bearer ${userToken}` } },
        );

        

        expect(createSpaceResponse.data.spaceId).toBeDefined();
    });

    test("User should be able to create a space without mapid", async () => {
        const createSpaceResponse = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            {
                name: "Test",
                dimensions: "100x200",
            },
            { headers: { authorization: `Bearer ${userToken}` } },
        );

        

        expect(createSpaceResponse.data.spaceId).toBeDefined();
    });

    test("User should not be able to create a space without mapid and dimensions", async () => {
        const createSpaceResponse = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            {
                name: "Test",
            },
            {
                headers: { authorization: `Bearer ${userToken}` },
            },
        );

        expect(createSpaceResponse.status).toBe(400);
    });

    //Deleting a space
    test("User should not be able to delete a space that doesnt exist", async () => {
        const response = await axios.delete(
            `${BACKEND_URL}/api/v1/space/randomIDoesntExist`,
            {
                headers: { authorization: `Bearer ${userToken}` },
            },
        );
        expect(response.status).toBe(400);
    });

    test("User should be able to delete a space that exists", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Test",
            dimensions: "100x200",
        },{
            headers: {authorization: `Bearer ${userToken}`}
        });

        const deleteResponse = await axios.delete(
            `${BACKEND_URL}/api/v1/space/${response.data.spaceId}`,
            {
                headers: { authorization: `Bearer ${userToken}` },
            },
        );
        
        expect(deleteResponse.status).toBe(200);
    });

    test("User should not be able to delete other users space", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/space`, {
            name: "Test",
            dimensions: "100x200",
        },{
            headers: {authorization: `Bearer ${userToken}`}
        });

        const deleteResponse = await axios.delete(
            `${BACKEND_URL}/api/v1/space/${response.data.spaceId}`,
            {
                headers: { authorization: `Bearer ${adminToken}` },
            },
        );
        expect(deleteResponse.status).toBe(403);
    });

    test("Admin has not created any spaces yet", async () => {
        const allSpaceResponse = await axios.get(
            `${BACKEND_URL}/api/v1/space/all`,
            {
                headers: { authorization: `Bearer ${adminToken}` },
            },
        );

        expect(allSpaceResponse.data.spaces.length).toBe(0);

        const createSpaceResponse = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            {
                name: "Test",
                dimensions: "100x200",
                mapId: mapId,
            },
            { headers: { authorization: `Bearer ${adminToken}` } },
        );
        expect(createSpaceResponse.status).toBe(200);

        const allSpaceResponse2 = await axios.get(
            `${BACKEND_URL}/api/v1/space/all`,
            {
                headers: { authorization: `Bearer ${adminToken}` },
            },
        );

        expect(allSpaceResponse2.data.spaces.length).toBe(1);
        const filteredSpace = allSpaceResponse2.data.spaces.find(
            (space) => space.id == createSpaceResponse.data.spaceId,
        );
        expect(filteredSpace).toBeDefined();
    });
});

describe("Arena Informations", () => {
    let element1Id = null;
    let element2Id = null;
    let adminToken = null;
    let adminId = null;
    let mapId = null;
    let userToken = null;
    let userId = null;
    let spaceId = null;

    beforeAll(async () => {
        let username = `testadmin-${Math.random()}`;
        let password = "pass1234";

        // Admin Sign up
        const signupResponse = await axios.post(
            `${BACKEND_URL}/api/v1/signup`,
            {
                username,
                password,
                type: "admin",
            },
        );
        adminId = signupResponse.data.userId;

        // Admin Sign in
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
        });

        adminToken = response.data.token;

        username = `testuser-${Math.random()}`;
        password = "pass1234";
        // user Sign up
        const userSignupResponse = await axios.post(
            `${BACKEND_URL}/api/v1/signup`,
            {
                username,
                password,
                type: "user",
            },
        );
        userId = userSignupResponse.data.userId;

        // user Sign in
        const userSignInResponse = await axios.post(
            `${BACKEND_URL}/api/v1/signin`,
            {
                username,
                password,
            },
        );

        userToken = userSignInResponse.data.token;

        const element1Response = await axios.post(
            `${BACKEND_URL}/api/v1/admin/element`,
            {
                imageUrl: "https://image3.com/element1.png",
                width: 1,
                height: 1,
                static: true,
            },
            { headers: { authorization: `Bearer ${adminToken}` } },
        );

        const element2Response = await axios.post(
            `${BACKEND_URL}/api/v1/admin/element`,
            {
                imageUrl: "https://image3.com/element2.png",
                width: 1,
                height: 1,
                static: true,
            },
            { headers: { authorization: `Bearer ${adminToken}` } },
        );

        element1Id = element1Response.data.elementId; // not element1.elementid?
        element2Id = element2Response.data.elementId;

        const mapResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/map`,
            {
                thumbnail: "https://thumbnail.com/a.png",
                dimensions: "100x200",
                name: "10 person interview room",
                elements: [
                    {
                        elementId: element1Id,
                        x: 20,
                        y: 20,
                    },
                    {
                        elementId: element2Id,
                        x: 18,
                        y: 20,
                    },
                    {
                        elementId: element2Id,
                        x: 18,
                        y: 19,
                    },
                ],
            },
            { headers: { authorization: `Bearer ${adminToken}` } },
        );

        mapId = mapResponse.data.mapId;

        const createSpaceResponse = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            {
                name: "Test",
                dimensions: "100x200",
                mapId: mapId,
            },
            { headers: { authorization: `Bearer ${userToken}` } },
        );

        spaceId = createSpaceResponse.data.spaceId;
    });

    test("Should return status 400 when incorrect spaceId is provided", async () => {
        const response = await axios.get(
            `${BACKEND_URL}/api/v1/space/randomSpaceId123`,
            { headers: { authorization: `Bearer ${userToken}` } },
        );
        expect(response.status).toBe(400);
    });

    test("Should return all elements when correct spaceId is provided", async () => {
        
        const response = await axios.get(
            `${BACKEND_URL}/api/v1/space/${spaceId}`,
            {
                headers: { authorization: `Bearer ${userToken}` },
            },
        );

        expect(response.status).toBe(200);
        expect(response.data.space.dimensions).toBe("100x200");
        expect(response.data.space.elements.length).toBe(3);
    });

    test("Should add an element to the space", async () => {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/space/element`,
            {
                elementId: element1Id,
                spaceId: spaceId,
                x: 10,
                y: 10,
            },
            { headers: { authorization: `Bearer ${userToken}` } },
        );
    });

    test("Should not add an element to the space at (0,0)", async () => {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/space/element`,
            {
                elementId: element1Id,
                spaceId: spaceId,
                x: 0,
                y: 0,
            },
            { headers: { authorization: `Bearer ${userToken}` } },
        );
    });

    test("Should not add an element to the space if x and y coords are invalid", async () => {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/space/element`,
            {
                elementId: element1Id,
                spaceId: spaceId,
                x: 9999,
                y: 9999,
            },
            { headers: { authorization: `Bearer ${userToken}` } },
        );

        expect(response.status).toBe(400);
    });

    test("Should remove an element from the space", async () => {
        const response = await axios.get(
            `${BACKEND_URL}/api/v1/space/${spaceId}`,
            {
                headers: { authorization: `Bearer ${userToken}` },
            },
        );

        expect(response.status).toBe(200);
        const deleteResponse = await axios.delete(
            `${BACKEND_URL}/api/v1/space/element`,
            {
                data: {
                    spaceId: spaceId,
                    elementId: response.data.space.elements[0].id,
                },
                headers: { authorization: `Bearer ${userToken}` }
            },
        );
        //expect(deleteResponse.status).toBe(200);
        const response2 = await axios.get(
            `${BACKEND_URL}/api/v1/space/${spaceId}`,
            { headers: { authorization: `Bearer ${userToken}` } },
        );
        expect(response2.data.space.elements.length).toBe(
            response.data.space.elements.length - 1,
        );
    });
});

describe("Admin and Map creators endpoints", () => {
    let adminToken = null;
    let adminId = null;
    let userToken = null;
    let userId = null;

    beforeAll(async () => {
        let username = `testadmin-${Math.random()}`;
        let password = "pass1234";

        // Admin Sign up
        const signupResponse = await axios.post(
            `${BACKEND_URL}/api/v1/signup`,
            {
                username,
                password,
                type: "admin",
            },
        );
        adminId = signupResponse.data.userId;

        // Admin Sign in
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
        });

        adminToken = response.data.token;

        username = `testuser-${Math.random()}`;
        password = "pass1234";
        // user Sign up
        const userSignupResponse = await axios.post(
            `${BACKEND_URL}/api/v1/signup`,
            {
                username,
                password,
                type: "user",
            },
        );
        userId = userSignupResponse.data.userId;

        // user Sign in
        const userSignInResponse = await axios.post(
            `${BACKEND_URL}/api/v1/signin`,
            {
                username,
                password,
            },
        );

        userToken = userSignInResponse.data.token;
    });

    test("User should not be able to hit admin endpoints ", async () => {
        const mapResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/map`,
            {
                thumbnail: "https://thumbnail.com/a.png",
                dimensions: "100x200",
                name: "10 person interview room",
                elements: [],
            },
            { headers: { authorization: `Bearer ${userToken}` } },
        );

        const avatarResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/avatar`,
            {
                imageUrl: "https://image.com/avatar1.png",
                name: "Joe",
            },
            { headers: { authorization: `Bearer ${userToken}` } },
        );

        const elementResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/element`,
            {
                imageUrl: "https://image.com/element1.png",
                width: 1,
                height: 1,
                static: true,
            },
            { headers: { authorization: `Bearer ${userToken}` } },
        );

        const updateElementResponse = await axios.put(
            `${BACKEND_URL}/api/v1/admin/element/123`,
            {
                imageUrl: "https://image2.com/element1.png",
            },
            { headers: { authorization: `Bearer ${userToken}` } },
        );

        expect(mapResponse.status).toBe(403);
        expect(avatarResponse.status).toBe(403);
        expect(elementResponse.status).toBe(403);
        expect(updateElementResponse.status).toBe(403);
    });

    test("Admin should be able to hit all admin endpoints", async () => {
        const mapResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/map`,
            {
                thumbnail: "https://thumbnail.com/a.png",
                dimensions: "100x200",
                name: "10 person interview room",
                elements: [],
            },
            { headers: { authorization: `Bearer ${adminToken}` } },
        );

        const avatarResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/avatar`,
            {
                imageUrl: "https://image.com/avatar1.png",
                name: "Joe",
            },
            { headers: { authorization: `Bearer ${adminToken}` } },
        );

        const elementResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/element`,
            {
                imageUrl: "https://image.com/element1.png",
                width: 1,
                height: 1,
                static: true,
            },
            { headers: { authorization: `Bearer ${adminToken}` } },
        );
        expect(mapResponse.status).toBe(200);
        expect(avatarResponse.status).toBe(200);
        expect(elementResponse.status).toBe(200);
    });

    test("Admin should be able to update imageUrls of elements", async () => {
        const elementResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/element`,
            {
                imageUrl: "https://image.com/element1.png",
                width: 1,
                height: 1,
                static: true,
            },
            { headers: { authorization: `Bearer ${adminToken}` } },
        );

        const updateElementResponse = await axios.put(
            `${BACKEND_URL}/api/v1/admin/element/${elementResponse.data.elementId}`,
            {
                imageUrl: "https://image2.com/element1.png",
            },
            { headers: { authorization: `Bearer ${adminToken}` } },
        );

        expect(updateElementResponse.status).toBe(200);
    });
});


describe("Websocket", () => {
    let userToken = null;
    let userId = null;
    let adminToken = null;
    let adminId = null;
    let element1Id = null;
    let element2Id = null;
    let mapId = null;
    let spaceId = null;
    let ws1 = null;
    let ws2 = null;
    ws1Messages = [];
    ws2Messages = [];
    let userX = null;
    let userY = null;
    let adminX = null;
    let adminY = null;

    async function waitForAndPopulateMessages(msgArray) {
        return new Promise((resolve) => {
            if (msgArray.length > 0) {
                resolve(msgArray.shift());
            } else {
                let interval = setInterval(() => {
                    if (msgArray.length > 0) {
                        clearInterval(interval);
                        resolve(msgArray.shift());
                    }
                }, 1000);
            }
        });
    }

    async function setupHTTP() {
        let username = `testadmin-${Math.random()}`;
        let password = "pass1234";
        const adminSignupResponse = await axios.post(
            `${BACKEND_URL}/api/v1/signup`,
            { username, password, type: "admin" },
        );
        const adminSigninResponse = await axios.post(
            `${BACKEND_URL}/api/v1/signin`,
            { username, password },
        );
        adminId = adminSignupResponse.data.userId;
        adminToken = adminSigninResponse.data.token;

        username = `testuser-${Math.random()}`;

        const userSignupResponse = await axios.post(
            `${BACKEND_URL}/api/v1/signup`,
            { username, password,type: "user" },
        );
        const userSigninResponse = await axios.post(
            `${BACKEND_URL}/api/v1/signin`,
            { username, password },
        );
        userId = userSignupResponse.data.userId;
        userToken = userSigninResponse.data.token;

        const element1Response = await axios.post(
            `${BACKEND_URL}/api/v1/admin/element`,
            {
                imageUrl: "https://image.com/element1.png",
                width: 1,
                height: 1,
                static: true,
            },
            { headers: { authorization: `Bearer ${adminToken}` } },
        );

        const element2Response = await axios.post(
            `${BACKEND_URL}/api/v1/admin/element`,
            {
                imageUrl: "https://image.com/element2.png",
                width: 1,
                height: 1,
                static: true,
            },
            { headers: { authorization: `Bearer ${adminToken}` } },
        );

        element1Id = element1Response.data.elementId; // not element1.elementid?
        element2Id = element2Response.data.elementId;

        const mapResponse = await axios.post(
            `${BACKEND_URL}/api/v1/admin/map`,
            {
                thumbnail: "https://thumbnail.com/a.png",
                dimensions: "100x200",
                name: "10 person interview room",
                elements: [
                    {
                        elementId: element1Id,
                        x: 20,
                        y: 20,
                    },
                    {
                        elementId: element2Id,
                        x: 18,
                        y: 20,
                    },
                    {
                        elementId: element2Id,
                        x: 18,
                        y: 19,
                    },
                ],
            },
            { headers: { authorization: `Bearer ${adminToken}` } },
        );

        mapId = mapResponse.data.mapId;

        const createSpaceResponse = await axios.post(
            `${BACKEND_URL}/api/v1/space`,
            {
                name: "Test",
                dimensions: "100x200",
                mapId: mapId,
            },
            { headers: { authorization: `Bearer ${userToken}` } },
        );

        spaceId = createSpaceResponse.data.spaceId;
    }

    async function setupWS() {
        ws1 = new WebSocket(`${WS_URL}`);
        ws2 = new WebSocket(`${WS_URL}`);

        await new Promise((resolve) => {
            ws1.onopen = resolve;
        });
        await new Promise((resolve) => {
            ws2.onopen = resolve;
        });

        ws1.onmessage = (msg) => {
            console.log("WS1 onMessage ",JSON.parse(msg.data))
            
            ws1Messages.push(JSON.parse(msg.data));
        };

        ws2.onmessage = (msg) => {
            console.log("WS2 onMessage ",JSON.parse(msg.data))
            ws2Messages.push(JSON.parse(msg.data));
        };
    }

    beforeAll(async () => {
        await setupHTTP();
        await setupWS();
    });

    test("Get back ack for joining the space", async () => {
        ws1.send(
            JSON.stringify({
                type: "join",
                payload: {
                    spaceId: spaceId,
                    token: adminToken,
                },
            }),
        );
        const message1 = await waitForAndPopulateMessages(ws1Messages);
        
        ws2.send(
            JSON.stringify({
                type: "join",
                payload: {
                    spaceId: spaceId,
                    token: userToken,
                },
            }),
        );

        const message2 = await waitForAndPopulateMessages(ws2Messages);
        const message3 = await waitForAndPopulateMessages(ws1Messages);

        expect(message1.type).toBe("space-joined")
        expect(message2.type).toBe("space-joined")
        expect(message1.payload.users.length).toBe(0)
        expect(message2.payload.users.length).toBe(1)
        expect(message3.type).toBe("user-joined");
        expect(message3.payload.x).toBe(message2.payload.spawn.x);
        expect(message3.payload.y).toBe(message2.payload.spawn.y);
        expect(message3.payload.userId).toBe(userId);

        adminX = message1.payload.spawn.x;
        adminY = message1.payload.spawn.y;

        userX = message2.payload.spawn.x;
        userY = message2.payload.spawn.y;
    });

    test("User should not be able to move outside the space", async () => {
        ws1.send(
            JSON.stringify({
                type: "move",
                payload: {
                    x: 9999,
                    y: 9999,
                },
            }),
        );

        const message1 = await waitForAndPopulateMessages(ws1Messages);
        expect(message1.type).toBe("movement-rejected");
        expect(message1.payload.x).toBe(adminX);
        expect(message1.payload.y).toBe(adminY);
    });

    test("User should not be able to move 2 blocks at once", async () => {
        ws1.send(
            JSON.stringify({
                type: "move",
                payload: {
                    x: adminX + 2,
                    y: adminY,
                },
            }),
        );

        const message1 = await waitForAndPopulateMessages(ws1Messages);

        expect(message1.type).toBe("movement-rejected");
        expect(message1.payload.x).toBe(adminX);
        expect(message1.payload.y).toBe(adminY);
    });

    test("User should not be able to move diagonally", async () => {
        ws1.send(
            JSON.stringify({
                type: "move",
                payload: {
                    x: adminX + 1,
                    y: adminY + 1,
                },
            }),
        );

        const message1 = await waitForAndPopulateMessages(ws1Messages);

        expect(message1.type).toBe("movement-rejected");
        expect(message1.payload.x).toBe(adminX);
        expect(message1.payload.y).toBe(adminY);
    });

    test("Other users should be notified when a user successfully moves", async () => {
        ws1.send(
            JSON.stringify({
                type: "move",
                payload: {
                    x: adminX,
                    y: adminY + 1,
                },
            }),
        );
        const message = await waitForAndPopulateMessages(ws2Messages);
        expect(message.type).toBe("user-moved");
        expect(message.userId).toBeDefined;
        expect(message.payload.x).toBe(adminX);
        expect(message.payload.y).toBe(adminY + 1);
    });

    test("Other users should be notified when a user leaves", async () => {
        ws1.close();
        const messages = await waitForAndPopulateMessages(ws2Messages);
        expect(messages.type).toBe("user-left");
        expect(messages.payload.userId).toBe(adminId);
        ws2.close()
    });
});

