"use client"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getspace } from '@/services/api/space';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const JoinPage: React.FC = () => {
    const router = useRouter();
    const [spaceId, setSpaceId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleJoinSpace = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!spaceId.trim()) {
            setError('Please enter a Space ID');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Validate if space exists by trying to fetch it
            const spaceData = await getspace(spaceId.trim());

            if (spaceData) {
                // Space exists, redirect to it
                router.push(`/space/${spaceId.trim()}`);
            } else {
                setError('Space not found. Please check the Space ID.');
            }
        } catch (error) {
            console.error('Error validating space:', error);
            setError('Space not found or invalid Space ID.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Join a Space</CardTitle>
                    <p className="text-muted-foreground">
                        Enter the Space ID to join an existing space
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleJoinSpace} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="spaceId">Space ID</Label>
                            <Input
                                id="spaceId"
                                type="text"
                                placeholder="Enter Space ID"
                                value={spaceId}
                                onChange={(e) => setSpaceId(e.target.value)}
                                disabled={isLoading}
                                className={error ? 'border-red-500' : ''}
                            />
                            {error && (
                                <p className="text-sm text-red-500">{error}</p>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isLoading}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1"
                            >
                                {isLoading ? 'Joining...' : 'Join Space'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default JoinPage;