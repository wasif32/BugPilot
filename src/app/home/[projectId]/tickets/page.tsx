"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Calendar, Users, Target, ClipboardList } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import AddMembersDialog from '@/components/AddMembersDialog';
import { CreateTicketDialog } from '@/components/CreateTicketDialog';

// Import the Skeleton component
import { Skeleton } from '@/components/ui/skeleton';

// -------------------- Constants --------------------
const ItemTypes = {
    TICKET: 'ticket',
};

// -------------------- Interfaces --------------------
interface TicketUser {
    _id: string;
    name: string;
}

interface UserDetails {
    _id: string;
    name: string;
    email: string;
}

interface PopulatedProjectMember {
    _id: string;
    user: UserDetails;
    role: string;
}

interface IProject {
    _id: string;
    name: string;
    description?: string;
    members: PopulatedProjectMember[];
    createdBy: TicketUser;
    __v: number;
}

interface ITicket {
    _id: string;
    title: string;
    description?: string;
    status: 'To Do' | 'In Progress' | 'Done';
    priority: 'Low' | 'Medium' | 'High';
    project: string;
    assignees: TicketUser[];
    createdBy: TicketUser;
    createdAt: string;
    updatedAt: string;
}

// -------------------- Utility Functions --------------------
const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// -------------------- TicketCard --------------------
const TicketCard: React.FC<{ ticket: ITicket }> = ({ ticket }) => {
    const router = useRouter(); 
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ItemTypes.TICKET,
        item: { id: ticket._id, currentStatus: ticket.status },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    const getPriorityColor = (priority: ITicket['priority']) => {
        switch (priority) {
            case 'High': return 'text-red-400';
            case 'Medium': return 'text-yellow-400';
            case 'Low': return 'text-green-400';
            default: return 'text-gray-400';
        }
    };

    const handleClick = () => {
        router.push(`/home/${ticket.project}/tickets/${ticket._id}`); // Navigate to the details page
    };
    return (
        <div
            ref={drag}
            className={`
                bg-[#2B2E3E] rounded-lg p-4 shadow-md border border-[#3C4155] mb-4 cursor-grab
                ${isDragging ? 'opacity-50 border-dashed border-blue-500' : 'opacity-100'}
            `}
            onClick={handleClick} 
        >
            <h3 className="text-lg font-semibold mb-2">{ticket.title}</h3>
            {ticket.description && (
                <p className="text-gray-300 text-sm mb-3">{ticket.description}</p>
            )}
            <div className="flex items-center text-sm mb-2">
                <Target size={14} className={`mr-1 ${getPriorityColor(ticket.priority)}`} />
                <span className={getPriorityColor(ticket.priority)}>{ticket.priority} Priority</span>
            </div>
            <div className="flex items-center text-gray-400 text-sm mb-2">
                <Users size={14} className="mr-1" />
                <span>
                    {ticket.assignees?.length ? ticket.assignees.map(a => a.name).join(', ') : 'Unassigned'}
                </span>
            </div>
            <div className="flex justify-between items-center text-gray-400 text-xs mt-2">
                <div className="flex items-center">
                    <ClipboardList size={12} className="mr-1" />
                    <span>Created by {ticket.createdBy?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center">
                    <Calendar size={12} className="mr-1" />
                    <span>{formatDate(ticket.createdAt)}</span>
                </div>
            </div>
        </div>
    );
};

// -------------------- Column --------------------
const Column: React.FC<{
    status: ITicket['status'];
    tickets: ITicket[];
    moveTicket: (id: string, newStatus: ITicket['status']) => void;
    isLoading?: boolean; // Add isLoading prop
}> = ({ status, tickets, moveTicket, isLoading }) => {
    const [{ isOver, canDrop }, drop] = useDrop(() => ({
        accept: ItemTypes.TICKET,
        drop: (item: { id: string; currentStatus: ITicket['status'] }) => {
            if (item.currentStatus !== status) moveTicket(item.id, status);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    }));

    const getHeaderStyle = () => {
        switch (status) {
            case 'To Do': return 'bg-gray-700';
            case 'In Progress': return 'bg-yellow-700';
            case 'Done': return 'bg-green-700';
            default: return 'bg-gray-700';
        }
    };

    const borderClass = isOver && canDrop ? 'border-blue-500' : canDrop ? 'border-gray-500' : 'border-[#3C4155]';

    return (
        <div ref={drop} className={`bg-[#222530] rounded-lg p-4 shadow-xl flex flex-col h-full border-2 ${borderClass}`}>
            <h2 className={`text-xl font-semibold p-3 mb-4 rounded text-white ${getHeaderStyle()}`}>
                {status} {isLoading ? '' : `(${tickets.length})`} {/* Hide count during loading */}
            </h2>
            <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                    // Skeleton for tickets within a column
                    Array.from({ length: 3 }).map((_, i) => ( // Render 3 skeleton cards per column
                        <div key={i} className="bg-[#2B2E3E] rounded-lg p-4 shadow-md mb-4">
                            <Skeleton className="h-5 w-3/4 mb-2 bg-gray-700" /> {/* Title */}
                            <Skeleton className="h-3 w-full mb-1 bg-gray-700" /> {/* Description line 1 */}
                            <Skeleton className="h-3 w-5/6 mb-3 bg-gray-700" /> {/* Description line 2 */}
                            <div className="flex items-center mb-2">
                                <Skeleton className="h-3 w-20 mr-1 bg-gray-700 rounded-full" /> {/* Priority tag */}
                            </div>
                            <div className="flex items-center mb-2">
                                <Skeleton className="h-3 w-24 mr-1 bg-gray-700 rounded-full" /> {/* Assignee */}
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <Skeleton className="h-3 w-20 bg-gray-700" /> {/* Created By */}
                                <Skeleton className="h-3 w-20 bg-gray-700" /> {/* Date */}
                            </div>
                        </div>
                    ))
                ) : (
                    tickets.length ? tickets.map(t => <TicketCard key={t._id} ticket={t} />) : (
                        <p className="text-gray-400 text-center py-4">No tickets here.</p>
                    )
                )}
            </div>
        </div>
    );
};

// -------------------- TicketsPage (Main Component) --------------------
export default function TicketsPage() {
    const { user, token } = useAuth();
    const { projectId } = useParams() as { projectId: string };

    const [projectMembers, setProjectMembers] = useState<PopulatedProjectMember[]>([]);
    const [tickets, setTickets] = useState<ITicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [admin, setAdmin] = useState(false);

    const fetchProjectDetails = useCallback(async () => {
        if (!token || !projectId) {
            setProjectMembers([]);
            return;
        }
        try {
            const { data } = await api.get<IProject>(`/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProjectMembers(data.members || []);
            if (user.id == data.createdBy._id) {
                setAdmin(true)
            }
        } catch (err) {
            console.error("Project fetch failed:", err);
            // Don't set a global error for members if tickets load,
            // but log it. Or, combine loading states if project details are critical
        }
    }, [token, projectId]);

    const fetchTickets = useCallback(async () => {
        // Only set global loading for tickets fetch, as it's the main content
        setLoading(true);
        setError(null); // Clear previous errors

        if (!token || !user || !projectId) {
            setTickets([]);
            setLoading(false);
            return;
        }

        try {
            // Add a small artificial delay to see the skeleton, remove in production
            await new Promise(resolve => setTimeout(resolve, 500));

            const { data } = await api.get<ITicket[]>(`/tickets/project/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTickets(data);
        } catch (err) {
            console.error("Ticket fetch failed:", err);
            setError("Failed to load tickets. Please try again.");
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }, [token, user, projectId]);

    useEffect(() => {
        fetchProjectDetails(); // Fetch project details (members)
        fetchTickets(); // Fetch tickets
    }, [fetchProjectDetails, fetchTickets]); // Depend on memoized fetch functions

    const moveTicket = useCallback(async (id: string, newStatus: ITicket['status']) => {
        let originalStatus: ITicket['status'] | undefined;
        setTickets(prev => {
            const ticket = prev.find(t => t._id === id);
            originalStatus = ticket?.status;
            // Optimistically update the UI
            return prev.map(t => t._id === id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t);
        });

        try {
            if (!token) throw new Error("Authentication token missing.");
            await api.put(`/tickets/${id}`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (err) {
            console.error("Ticket status update failed:", err);
            setError("Failed to update ticket status. Please try again.");
            // Revert UI on error
            if (originalStatus) {
                setTickets(prev => prev.map(t => t._id === id ? { ...t, status: originalStatus! } : t));
            } else {
                // Fallback to refetch if original status couldn't be determined
                fetchTickets();
            }
        }
    }, [token, fetchTickets]);

    const toDo = tickets.filter(t => t.status === 'To Do');
    const inProgress = tickets.filter(t => t.status === 'In Progress');
    const done = tickets.filter(t => t.status === 'Done');

    // --- Render Error State (if any) ---
    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-900 text-red-500 p-4">
                <p className="text-xl font-semibold mb-4">{error}</p>
                <button
                    onClick={fetchTickets}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                    Retry Loading Tickets
                </button>
            </div>
        );
    }

    // --- Render Main Content (either loaded or skeleton) ---
    return (
        <DndProvider backend={HTML5Backend}>
            <div className="text-white p-8 bg-gray-900 min-h-screen">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold">Tickets:</h1>
                        <p className="text-gray-400 mt-1">Manage your project tickets and track progress</p>
                    </div>
                    <span className='flex'>
                        <CreateTicketDialog
                            projectId={projectId}
                            onTicketCreated={fetchTickets} // Pass the function to refresh tickets
                            triggerButtonClassName="bg-green-600 mr-2 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
                        />
                        
                        {admin && (
                            <AddMembersDialog
                            projectId={projectId}
                            currentMembers={projectMembers}
                            onMembersUpdated={fetchProjectDetails} // Refresh members after adding
                            triggerButtonClassName="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
                        />
                            )}
                      
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
                    <Column status="To Do" tickets={toDo} moveTicket={moveTicket} isLoading={loading} />
                    <Column status="In Progress" tickets={inProgress} moveTicket={moveTicket} isLoading={loading} />
                    <Column status="Done" tickets={done} moveTicket={moveTicket} isLoading={loading} />
                </div>
                <style jsx>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 8px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: #3C4155;
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background-color: #6B7280;
                        border-radius: 10px;
                        border: 2px solid #3C4155;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background-color: #9CA3AF;
                    }
                `}</style>
            </div>
        </DndProvider>
    );
}