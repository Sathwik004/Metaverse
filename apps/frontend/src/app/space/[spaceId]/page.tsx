"use client"
import { getspace } from '@/services/api/space';
import { deepStrictEqual } from 'assert';
import { useParams, useRouter } from 'next/navigation';
import { stringify } from 'querystring';
import { useState, useEffect, useRef } from 'react';

const WS = process.env.WS || "ws://localhost:8080";


export default function DashboardPathPage() {
    const params = useParams();
    const spaceIdParam = params.spaceId;
    const router = useRouter()

    // User data structure
    interface User {
        id: string;
        x: number;
        y: number;
    }

    const [usercount, setusercount] = useState(0)
    const [space, setSpace] = useState<{ name?: string; spaceName?: string; dimensions?: string } | null>(null);
    const [users, setUsers] = useState<User[]>([]); //TODO: Try using any here
    const [currentUser, setCurrentUser] = useState<User>({
        id: 'IdNotFound',
        x: 0,
        y: 0,
    });
    const spaceId = Array.isArray(spaceIdParam) ? spaceIdParam[0] : spaceIdParam;

    const wsRef = useRef<WebSocket | null>(null);

    // Movement functions
    const handleMovement = (direction: 'w' | 'a' | 's' | 'd') => {

        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.log('WebSocket not connected');
            return;
        }

        setCurrentUser(prevUser => {
            if (!prevUser) return prevUser;

            const directionMap = {
                w: { dx: 0, dy: -1 },
                s: { dx: 0, dy: 1 },
                a: { dx: -1, dy: 0 },
                d: { dx: 1, dy: 0 },
            };

            const newX = prevUser.x + directionMap[direction].dx;
            const newY = prevUser.y + directionMap[direction].dy;

            // Check bounds
            if (
                newX < 0 ||
                newY < 0 ||
                newX >= (space?.dimensions ? parseDimensions(space.dimensions).width : 10) ||
                newY >= (space?.dimensions ? parseDimensions(space.dimensions).height : 10)
            ) {
                return prevUser;
            }

            // Send message using latest position
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(
                    JSON.stringify({
                        type: 'move',
                        payload: { x: newX, y: newY },
                    })
                );
            }
            console.log("Current User Moved ", prevUser)

            return { ...prevUser, x: newX, y: newY };

        });
    };

    useEffect(() => {
        if (wsRef.current) {
            return
        }
        const ws = new WebSocket(WS); // Adjust server URL if needed
        wsRef.current = ws;

        if (spaceId) {
            (async () => {
                const spaceData = await getspace(spaceId);
                setSpace(spaceData.space);
            })();
        }

        ws.onopen = () => {
            const token = localStorage.getItem('auth_token')
            ws.send(JSON.stringify({
                type: "join",
                payload: {
                    spaceId: spaceId,
                    token: token,
                },
            }));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Received:', data);

            if (data.type == 'space-joined') {
                // Initialize users array with existing users + current user
                setUsers(users => {
                    const allusers: User[] = data.users.map((user: any) => ({
                        id: user.id || user.userId,
                        x: user.x || 0,
                        y: user.y || 0,
                    }));

                    setusercount(allusers.length + 1);


                    return allusers
                })

                setCurrentUser(currentUser => {

                    const user = ({ id: data.payload.userid, x: data.payload.spawn.x, y: data.payload.spawn.y })
                    console.log("Current user after joining space ", user)
                    return user
                })


            }
            else if (data.type == 'user-joined') {
                // Add a new white dot where user spawns


                setUsers(prevUsers => {
                    const newUser: User = {
                        id: data.payload.userId,
                        x: data.payload.x || 0,
                        y: data.payload.y || 0,
                    };
                    return [...prevUsers, newUser]
                });
                setusercount(usercount => usercount + 1);
            }
            else if (data.type == 'user-left') {
                // Remove the user dot
                setUsers(prevUsers => {
                    const leftUserId = data.payload.userId;

                    const usersn = prevUsers.filter(user => user.id !== leftUserId)
                    console.log("Users after a user left ", usersn)
                    return usersn
                });
                setusercount(usercount => usercount - 1);
            }
            else if (data.type == 'user-moved') {
                setUsers(users => {

                    const user = data.payload
                    const allusers = users.map((u) =>
                        u.id === user.userId
                            ? { ...u, x: user.x, y: user.y } // update only the moved user
                            : u // keep others unchanged
                    );
                    console.log("User Moved ", user)


                    return allusers
                })
            }
            else if (data.type == 'user-rejected') {
                alert("Unable to Join Space. Space is full")
                router.replace('/dashboard')
            }
        };

        ws.onclose = () => {
            console.log('Disconnected');
        };

        return () => {
            ws.close();
        };
    }, []);

    // Keyboard event listener for WASD movement
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            const key = event.key.toLowerCase();
            if (['w', 'a', 's', 'd'].includes(key)) {
                event.preventDefault(); // Prevent default browser behavior
                handleMovement(key as 'w' | 'a' | 's' | 'd');
            }
        };

        // Add event listener
        window.addEventListener('keydown', handleKeyPress);

        // Cleanup event listener on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, []);


    // Parse dimensions from space data
    const parseDimensions = (dimensionString: string) => {
        if (!dimensionString) return { width: 10, height: 10 };
        const [width, height] = dimensionString.split('x').map(Number);
        return { width: width || 10, height: height || 10 };
    };

    const dimensions = space?.dimensions ? parseDimensions(space.dimensions) : { width: 10, height: 10 };

    return (
        <main className='p-4'>
            <h2>Welcome to {space?.name}</h2>
            <p>Total Users: {usercount}</p>

            {/* Grid Container with Scrollable Viewport */}
            <div className="flex items-center justify-center my-30 overflow-auto">
                <div
                    className="relative bg-gray-800"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${dimensions.width}, 20px)`,
                        gridTemplateRows: `repeat(${dimensions.height}, 20px)`,
                        width: `${dimensions.width * 20}px`,
                        height: `${dimensions.height * 20}px`
                    }}
                >
                    {/* Create grid cells */}
                    {Array.from({ length: dimensions.width * dimensions.height }).map((_, index) => (
                        <div
                            key={index}
                            className="bg-black border-1 border-gray-600 w-5 h-5"
                        />
                    ))}

                    {/* Render all user dots */}
                    {users.map((user) => (
                        <div
                            key={user.id}
                            className={`absolute rounded-full z-10 bg-white`}
                            style={{
                                width: '16px',
                                height: '16px',
                                left: `${user.x * 20 + 2}px`, // Position based on grid coordinates
                                top: `${user.y * 20 + 2}px`,  // Position based on grid coordinates
                            }}
                            title={`User ${user.id}`}
                        ></div>
                    ))}
                    {currentUser && (
                        <div
                            className="absolute rounded-full z-10 bg-green-500"
                            style={{
                                width: '16px',
                                height: '16px',
                                left: `${currentUser.x * 20 + 2}px`,
                                top: `${currentUser.y * 20 + 2}px`,
                            }}
                            title="You"
                        ></div>
                    )}
                </div>
            </div>

            <div className="mt-2 text-sm text-gray-600">
                Grid Size: {dimensions.width} x {dimensions.height}
            </div>
        </main>
    );
}