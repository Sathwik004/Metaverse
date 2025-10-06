"use client"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { OverlayForm } from '@/components/ui/overlay-form';
import { signout } from '@/services/api/auth';
import { CreateSpace, deleteSpace, getallspace } from '@/services/api/space';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const DashboardPage: React.FC = () => {


    const router = useRouter();
    const [showOverlay, setShowOverlay] = useState(false);

    type Space = { id: string; name: string; width: any, height: any }; // Adjust fields as needed
    const [spaces, setSpaces] = useState<Space[]>([])
    const fetchSpaces = async () => {
        try {
            const res = await getallspace();
            console.log('Fetched spaces:', res);
            if (Array.isArray(res)) {
                setSpaces(res);
            } else {
                setSpaces([]);
            }
            // You can set state here if needed
        } catch (error) {
            console.error('Error fetching spaces:', error);
            setSpaces([]);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        if (!token) {
            router.push("/auth");
        } else {
            fetchSpaces();
        }
    }, []);

    // Dummy handler for create
    const handleCreateSpace = (data: { name: string; dimensions: string; mapId?: string }) => {
        // You can replace this with your API call
        console.log('Create Space:', data);
        CreateSpace(data)
    };

    return (
        <div className='px-20 py-4'>
            {/* Nav Bar */}
            <div className='header'>
                <h2 >Metaverse</h2>
                <div>
                    <Button variant={'ghost'} className='text-red-500' onClick={() => {
                        signout()
                        router.replace('/')
                    }}>Sign Out</Button>
                </div>
            </div>

            {/* Overlay Form */}
            <OverlayForm
                open={showOverlay}
                onClose={() => setShowOverlay(false)}
                onCreate={handleCreateSpace}
            />

            {/* Your Space Section */}
            <section className='my-20'>
                <div className='flex items-center justify-between'>
                    <h3 className='text-5xl'>Your Space</h3>
                    <Button onClick={() => setShowOverlay(true)}>Create Space</Button>
                </div>
                {/* Spaces List */}
                <div className='space-list'>
                    {spaces.length == 0 ? <div className='flex items-center justify-center w-full h-100'>
                        <p className='font-extralight'>No Spaces found</p>
                    </div> : spaces.map(space => (

                        <div key={space.id}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{space.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p>{space.height} x {space.width}</p>
                                </CardContent>
                                <CardFooter className='flex justify-end space-x-4'>

                                    <Button
                                        variant="ghost"
                                        onClick={() => deleteSpace(space.id)}
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        variant="default"
                                        onClick={() => {

                                            router.push(`space/${space.id}`)
                                        }}
                                    >
                                        Join
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default DashboardPage;