// components/TicketDetailsPage.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import api from '@/lib/api';
import { Calendar, Users, Target, ClipboardList, Loader2, Edit, Trash, PlusCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from "sonner"

// Re-using interfaces from the main TicketsPage for consistency
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
  // New fields for screenshots and comments
  screenshots?: string[]; // Array of image URLs
  comments?: {
    _id: string;
    user: TicketUser;
    text: string;
    createdAt: string;
  }[];
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getPriorityColor = (priority: ITicket['priority']) => {
  switch (priority) {
    case 'High': return 'text-red-400';
    case 'Medium': return 'text-yellow-400';
    case 'Low': return 'text-green-400';
    default: return 'text-gray-400';
  }
};

export default function TicketDetailsPage() {
  const { user, token } = useAuth();
  const { ticketId } = useParams() as { ticketId: string };
  const router = useRouter();

  const [ticket, setTicket] = useState<ITicket | null>(null);
  const [projectMembers, setProjectMembers] = useState<PopulatedProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<ITicket['priority']>('Low');
  const [editAssignees, setEditAssignees] = useState<string[]>([]); // Array of user IDs
  const [newComment, setNewComment] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingTicket, setDeletingTicket] = useState(false);
  const [postingComment, setPostingComment] = useState(false);

  const isCreator = user?.id === ticket?.createdBy._id;

  const fetchTicketDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    if (!token || !ticketId) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get<ITicket>(`/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTicket(data);
      setEditTitle(data.title);
      setEditDescription(data.description || '');
      setEditPriority(data.priority);
      setEditAssignees(data.assignees.map(a => a._id));

      // Fetch project members for assignee selection
      if (data.project) {
        const projectRes = await api.get<IProject>(`/projects/${data.project}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjectMembers(projectRes.data.members || []);
      }
    } catch (err) {
      console.error("Failed to fetch ticket details:", err);
      setError("Failed to load ticket details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [token, ticketId]);

  useEffect(() => {
    fetchTicketDetails();
  }, [fetchTicketDetails]);

  const handleUpdateTicket = async () => {
    if (!ticket) return;
    try {
      const updatedTicketData = {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        assignees: editAssignees,
      };
      await api.put(`/tickets/${ticketId}`, updatedTicketData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast("Ticket Updated", {
        description: "Ticket details have been successfully updated.",
      });
      
      setIsEditing(false);
      fetchTicketDetails(); // Re-fetch to ensure all data is consistent
    } catch (err) {
      console.error("Failed to update ticket:", err);
      setError("Failed to update ticket. Please try again.");
      toast("Update Failed", {
        description: "There was an error updating the ticket.",
      });
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticket) return;
    setDeletingTicket(true);
    try {
      await api.delete(`/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast("Ticket Deleted", {
        description: "The ticket has been successfully deleted.",
      });
      router.push(`/home/${ticket.project}/tickets`); // Redirect to the tickets page of the project
    } catch (err) {
      console.error("Failed to delete ticket:", err);
      setError("Failed to delete ticket. Please try again.");
      toast("Deletion Failed", {
        description: "There was an error deleting the ticket.",
      });
    } finally {
      setDeletingTicket(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !ticketId || !user) return;
    setPostingComment(true);
    try {
      const response = await api.post(`/tickets/${ticketId}/comments`, { text: newComment }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTicket(prev => prev ? { ...prev, comments: [...(prev.comments || []), response.data] } : prev);
      setNewComment('');
      toast("Comment Added", {
        description: "Your comment has been added.",
        className: "!bg-green-500 !text-white !border-green-700"
      });
    } catch (err) {
      console.error("Failed to add comment:", err);
      setError("Failed to add comment. Please try again.");
      toast("Comment Failed", {
        description: "There was an error adding your comment.",
        className: "!bg-red-500 !text-white !border-red-700"
      });
    } finally {
      setPostingComment(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !ticketId) return;

    const formData = new FormData();
    formData.append('screenshot', file); // 'screenshot' should match your backend's expected field name

    setUploadingImage(true);
    try {
      // Assuming your API has an endpoint like /tickets/:id/upload-screenshot
      const response = await api.post(`/tickets/${ticketId}/upload-screenshot`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setTicket(prev => prev ? { ...prev, screenshots: [...(prev.screenshots || []), response.data.imageUrl] } : prev);
      toast("Screenshot Uploaded", {
        description: "The screenshot has been successfully uploaded.",
        className: "!bg-green-500 !text-white !border-green-700"
      });
    } catch (err) {
      console.error("Failed to upload screenshot:", err);
      setError("Failed to upload screenshot. Please try again.");
      toast("Upload Failed", {
        description: "There was an error uploading the screenshot.",
        className: "!bg-red-500 !text-white !border-red-700"
      });
    } finally {
      setUploadingImage(false);
      event.target.value = ''; // Clear the input so the same file can be selected again
    }
  };

  if (loading) {
    return (
      <div className="text-white p-8 bg-gray-900 min-h-screen">
        <Skeleton className="h-10 w-1/2 mb-4 bg-gray-700" />
        <Skeleton className="h-6 w-1/3 mb-6 bg-gray-700" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Skeleton className="h-4 w-3/4 mb-2 bg-gray-700" />
            <Skeleton className="h-4 w-full mb-2 bg-gray-700" />
            <Skeleton className="h-4 w-1/2 mb-4 bg-gray-700" />
            <Skeleton className="h-20 w-full mb-4 bg-gray-700" />
          </div>
          <div>
            <Skeleton className="h-4 w-1/4 mb-2 bg-gray-700" />
            <Skeleton className="h-4 w-1/3 mb-2 bg-gray-700" />
            <Skeleton className="h-4 w-1/2 mb-4 bg-gray-700" />
            <Skeleton className="h-32 w-full mb-4 bg-gray-700" />
          </div>
        </div>
        <Skeleton className="h-4 w-1/4 mb-4 bg-gray-700 mt-8" />
        <div className="flex gap-4">
          <Skeleton className="h-24 w-48 bg-gray-700" />
          <Skeleton className="h-24 w-48 bg-gray-700" />
        </div>
        <Skeleton className="h-4 w-1/4 mb-4 mt-8 bg-gray-700" />
        <Skeleton className="h-10 w-full mb-4 bg-gray-700" />
        <Skeleton className="h-20 w-full bg-gray-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-900 text-red-500 p-4">
        <p className="text-xl font-semibold mb-4">{error}</p>
        <Button onClick={fetchTicketDetails} className="bg-blue-600 hover:bg-blue-700 text-white">
          Retry
        </Button>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-900 text-gray-400 p-4">
        <p className="text-xl font-semibold">Ticket not found.</p>
      </div>
    );
  }

  return (
    <div className="text-white p-8 bg-gray-900 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">{ticket.title}</h1>
          <p className="text-gray-400 mt-1">Details for this ticket</p>
        </div>
        <div className="flex gap-2">
          {isCreator && (
            <>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Edit size={18} /> {isEditing ? 'Cancel Edit' : 'Edit Ticket'}
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="flex items-center gap-2"
                    disabled={deletingTicket}
                  >
                    {deletingTicket ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash size={18} />
                    )}
                    Delete Ticket
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#2B2E3E] text-white border-[#3C4155]">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-400">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                      This action cannot be undone. This will permanently delete your ticket and remove its data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-600 hover:bg-gray-700 text-white border-none">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteTicket} className="bg-red-600 hover:bg-red-700 text-white">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="bg-[#222530] rounded-lg p-6 shadow-xl mb-8">
          <h2 className="text-2xl font-semibold mb-4">Edit Ticket</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="text-gray-300 mb-1 block">Title</Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-[#3C4155] border-none text-white focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <Label htmlFor="priority" className="text-gray-300 mb-1 block">Priority</Label>
              <Select value={editPriority} onValueChange={(value: ITicket['priority']) => setEditPriority(value)}>
                <SelectTrigger className="w-full bg-[#3C4155] border-none text-white focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Select Priority" />
                </SelectTrigger>
                <SelectContent className="bg-[#2B2E3E] text-white border-[#3C4155]">
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="description" className="text-gray-300 mb-1 block">Description</Label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={5}
                className="bg-[#3C4155] border-none text-white focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {isCreator && (
              <div className="md:col-span-2">
                <Label htmlFor="assignees" className="text-gray-300 mb-1 block">Assignees</Label>
                <Select onValueChange={(value) => setEditAssignees(prev => {
                  if (prev.includes(value)) return prev.filter(id => id !== value);
                  return [...prev, value];
                })} value=""> {/* Value needs to be controlled if it's multiselect, or reset after selection */}
                  <SelectTrigger className="w-full bg-[#3C4155] border-none text-white focus:ring-blue-500 focus:border-blue-500">
                    <SelectValue placeholder="Add Assignee" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2B2E3E] text-white border-[#3C4155]">
                    {projectMembers.map(member => (
                      <SelectItem key={member.user._id} value={member.user._id}>
                        {member.user.name} {editAssignees.includes(member.user._id) && "(Assigned)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2 flex flex-wrap gap-2">
                  {editAssignees.map(assigneeId => {
                    const assignedMember = projectMembers.find(m => m.user._id === assigneeId);
                    return assignedMember ? (
                      <span key={assigneeId} className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                        {assignedMember.user.name}
                        <button
                          onClick={() => setEditAssignees(prev => prev.filter(id => id !== assigneeId))}
                          className="ml-1 text-white hover:text-gray-200"
                        >
                          &times;
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
          <Button onClick={handleUpdateTicket} className="mt-6 bg-green-600 hover:bg-green-700 text-white">
            Save Changes
          </Button>
        </div>
      ) : (
        <div className="bg-[#222530] rounded-lg p-6 shadow-xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-gray-300 text-sm mb-1">Description:</p>
              <p className="text-lg mb-4">{ticket.description || 'No description provided.'}</p>

              <div className="flex items-center text-sm mb-2">
                <Target size={18} className={`mr-2 ${getPriorityColor(ticket.priority)}`} />
                <span className={`${getPriorityColor(ticket.priority)} font-semibold`}>{ticket.priority} Priority</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm mb-2">
                <Users size={18} className="mr-2" />
                <span>
                  Assigned to: {ticket.assignees?.length ? ticket.assignees.map(a => a.name).join(', ') : 'Unassigned'}
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center text-gray-400 text-sm mb-2">
                <ClipboardList size={18} className="mr-2" />
                <span>Created by: {ticket.createdBy?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm mb-2">
                <Calendar size={18} className="mr-2" />
                <span>Created on: {formatDate(ticket.createdAt)}</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm mb-2">
                <Calendar size={18} className="mr-2" />
                <span>Last Updated: {formatDate(ticket.updatedAt)}</span>
              </div>
              <div className="flex items-center text-gray-400 text-sm mb-2">
                <span className="font-semibold mr-2">Status:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium
                  ${ticket.status === 'To Do' ? 'bg-gray-500 text-white' :
                    ticket.status === 'In Progress' ? 'bg-yellow-500 text-white' :
                      'bg-green-500 text-white'}`}
                >
                  {ticket.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screenshots Section */}
      <div className="bg-[#222530] rounded-lg p-6 shadow-xl mb-8">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <PlusCircle size={24} className="mr-2" /> Screenshots
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          {ticket.screenshots && ticket.screenshots.length > 0 ? (
            ticket.screenshots.map((src, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-[#3C4155]">
                <img
                  src={src}
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          ) : (
            <p className="text-gray-400 col-span-full">No screenshots uploaded yet.</p>
          )}
        </div>
        <div>
          <Label htmlFor="screenshot-upload" className="sr-only">Upload Screenshot</Label>
          <Input
            id="screenshot-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden" // Hide the default input
            disabled={uploadingImage}
          />
          <Button
            onClick={() => document.getElementById('screenshot-upload')?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle size={18} />
            )}
            Upload Screenshot
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-[#222530] rounded-lg p-6 shadow-xl">
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <MessageCircle size={24} className="mr-2" /> Comments
        </h2>
        <div className="space-y-4 mb-6 max-h-80 overflow-y-auto custom-scrollbar pr-2">
          {ticket.comments && ticket.comments.length > 0 ? (
            ticket.comments.map((comment) => (
              <div key={comment._id} className="bg-[#2B2E3E] p-3 rounded-md border border-[#3C4155]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-blue-300">{comment.user.name}</span>
                  <span className="text-gray-500 text-xs">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-gray-200 text-sm">{comment.text}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No comments yet. Be the first to comment!</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="flex-grow bg-[#3C4155] border-none text-white focus:ring-blue-500 focus:border-blue-500"
            disabled={postingComment}
          />
          <Button
            onClick={handleAddComment}
            className="bg-purple-600 hover:bg-purple-700 text-white self-end flex items-center gap-2"
            disabled={postingComment || !newComment.trim()}
          >
            {postingComment ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle size={18} />
            )}
            Post Comment
          </Button>
        </div>
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
  );
}