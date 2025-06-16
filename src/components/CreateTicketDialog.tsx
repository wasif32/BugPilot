// app/components/CreateTicketDialog.tsx
"use client";

import React, { useState } from "react";
import { PlusCircle } from "lucide-react"; // Using PlusCircle for "New Ticket" button
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api"; // Your API utility
import { useAuth } from "@/components/AuthProvider"; // Assuming you need auth token for API calls
import { AxiosError } from "axios"; // For better error handling

// Define the props for the CreateTicketDialog component
interface CreateTicketDialogProps {
  projectId: string;
  onTicketCreated: () => void; // Callback to refresh tickets after creation
  triggerButtonClassName?: string;
}

export function CreateTicketDialog({
  projectId,
  onTicketCreated,
  triggerButtonClassName,
}: CreateTicketDialogProps) {
  const { token } = useAuth(); // Get the authentication token

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium"); // Default to Medium
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setIsSubmitting(true);
    setError(null); // Clear previous errors

    if (!title.trim()) {
      setError("Ticket title cannot be empty.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Make the API call to create the ticket
      const response = await api.post(
        `/tickets/`, // API endpoint for creating tickets within a project
        {
          title,
          description,
            priority,
          project: projectId, // Pass the project ID
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the auth token
          },
        }
      );

      console.log("Ticket created successfully:", response.data);
      onTicketCreated(); // Notify parent component to refresh ticket list
      setIsDialogOpen(false); // Close the dialog
      // Reset form fields
      setTitle("");
      setDescription("");
      setPriority("Medium");
    } catch (err) {
      console.error("Failed to create ticket:", err);
      if (err instanceof AxiosError && err.response) {
        setError(
          err.response.data.message || "Failed to create ticket. Please try again."
        );
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to reset state when the dialog is closed
  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setError(null);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button className={triggerButtonClassName}>
          <PlusCircle size={20} />
          <span>Create New Ticket</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#2B2E3E] text-white border-[#3C4155]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Ticket</DialogTitle>
          <DialogDescription className="text-gray-400">
            Fill in the details for your new bug report or feature request.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateTicket} className="grid gap-4 py-4">
          {/* Ticket Title */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right text-gray-300">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Fix login button styling"
              className="col-span-3 bg-gray-700 border-none focus:!border-white focus:!ring-white focus:outline-none rounded-md text-white"
              required
            />
          </div>

          {/* Ticket Description */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right text-gray-300 mt-2">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide details about the bug or feature..."
              className="col-span-3 bg-gray-700 h-24 border-none focus:!border-white focus:!ring-white focus:outline-none rounded-md text-white"
            />
          </div>

          {/* Priority Dropdown */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right text-gray-300">
              Priority
            </Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="col-span-3 bg-gray-700 border-none focus:!border-white focus:!ring-white rounded-md text-white">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 text-white border-[#3C4155]">
                <SelectGroup>
                  <SelectLabel className="text-gray-400">Priority Levels</SelectLabel>
                  <SelectItem value="Low" className="focus:bg-gray-600">Low</SelectItem>
                  <SelectItem value="Medium" className="focus:bg-gray-600">Medium</SelectItem>
                  <SelectItem value="High" className="focus:bg-gray-600">High</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm col-span-4 text-center">{error}</p>}

          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogClose(false)}
              className="text-gray-400 border-gray-400 hover:bg-gray-800"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Ticket"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}