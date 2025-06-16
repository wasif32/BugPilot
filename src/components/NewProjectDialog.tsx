"use client"

import { useState } from "react";
import { Plus } from "lucide-react";
import api from "@/lib/api"; // Adjust this path if your API utility is elsewhere
import { AxiosError } from "axios";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
    DialogClose,
  } from "@/components/ui/dialog"; // Assuming these are your Shadcn UI components
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
  
	  // Add the onProjectCreated prop to the interface
	  interface NewProjectDialogProps {
		onProjectCreated?: () => void; // Optional callback for when a project is successfully created
	  }

  export function NewProjectDialog({onProjectCreated}: NewProjectDialogProps) {
	// Local state for new project creation
	const [open, setOpen] = useState(false);
	const [projectName, setProjectName] = useState("");
	const [projectDescription, setProjectDescription] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	  const [submissionError, setSubmissionError] = useState<string | null>(null);

	const handleSubmitNewProject = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setSubmissionError(null);
		try {
			const response = await api.post("/projects", {
				name: projectName,
				description: projectDescription,
			});
			console.log("New project created successfully:", response.data);
			setOpen(false);
			setProjectName("");
			setProjectDescription("");

			// Call the callback function if it exists
			if (onProjectCreated) {
				onProjectCreated();
			  }
		} catch (error) {
			console.error("Failed to create project:", error);
			if (error instanceof AxiosError && error.response) {
				setSubmissionError(
					error.response.data.message || "Failed to create project. Please try again."
				);
			} else {
				setSubmissionError("An unexpected error occurred. Please try again.");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					className="flex items-center justify-center bg-amber-600 hover:bg-amber-700 gap-3 w-full px-4 py-2.5 text-white font-semibold rounded-md shadow-md"
					variant="default"
				>
					<Plus className="!h-6 !w-6" />
					<span>New Project</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px] bg-gray-800 p-6 rounded-lg shadow-xl">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold text-white">
						Create New Project
					</DialogTitle>
					<DialogDescription className="text-gray-400">
						Enter your new project details.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmitNewProject} className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="projectName" className="text-right text-gray-300">
							Name
						</Label>
						<Input
							id="projectName"
							name="projectName"
							value={projectName}
							placeholder="e.g., Website Redesign"
							onChange={(e) => setProjectName(e.target.value)}
							className="col-span-3 bg-gray-700 border-none focus:!border-white focus:!ring-white focus:outline-none rounded-md text-white"
							required
						/>
					</div>
					<div className="grid grid-cols-4 items-start gap-4">
						<Label htmlFor="projectDescription" className="text-right text-gray-300 mt-2">
							Description
						</Label>
						<Textarea
							id="projectDescription"
							name="projectDescription"
							value={projectDescription}
							onChange={(e) => setProjectDescription(e.target.value)}
							placeholder="A brief overview of the project goals..."
							className="col-span-3 bg-gray-700 h-24 border-none focus:!border-white focus:!ring-white focus:outline-none rounded-md text-white"
						/>
					</div>
					{submissionError && (
						<p className="col-span-4 text-red-500 text-sm text-center">
							{submissionError}
						</p>
					)}
					<DialogFooter className="flex justify-end gap-2 mt-4">
						<DialogClose asChild>
							<Button
								type="button"
								variant="outline"
								className="bg-gray-700 text-white hover:bg-gray-600 border-none"
								disabled={isSubmitting}
							>
								Cancel
							</Button>
						</DialogClose>
						<Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={isSubmitting}>
							Save Project
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}