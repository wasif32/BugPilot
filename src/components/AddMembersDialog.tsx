"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { UserPlus, X } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

// Interfaces
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

interface AddMembersDialogProps {
  projectId: string;
  currentMembers: PopulatedProjectMember[];
  onMembersUpdated: () => void;
  triggerButtonClassName?: string;
}

interface MemberDisplayProps {
  member: PopulatedProjectMember;
  onRemove?: (memberId: string) => void;
  isRemovable?: boolean;
}

// Helper UI: Member Display
const MemberDisplay: React.FC<MemberDisplayProps> = ({ member, onRemove, isRemovable }) => (
  <div className="flex items-center justify-between p-2 border-b border-gray-700 last:border-b-0">
    <div className="flex flex-col">
      <span className="text-white font-medium">{member.user.name}</span>
      <span className="text-gray-400 text-sm">{member.user.email}</span>
    </div>
    {isRemovable && onRemove && (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(member.user._id)}
        className="hover:bg-red-900/20"
      >
        <X className="h-4 w-4 text-red-500" />
      </Button>
    )}
  </div>
);

// Main Component
const AddMembersDialog: React.FC<AddMembersDialogProps> = ({
  projectId,
  currentMembers,
  onMembersUpdated,
  triggerButtonClassName,
}) => {
  const { token, user } = useAuth();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<UserDetails[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserDetails[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserRole = currentMembers.find((m) => m.user._id === user?.id)?.role;

  const membersToDisplay = useMemo(
    () => currentMembers.filter((m) => m.user._id !== user?.id),
    [currentMembers, user?.id]
  );

  const allExcludedUserIds = useMemo(
    () => [
      ...currentMembers.map((m) => m.user._id),
      ...selectedUsers.map((u) => u._id),
    ],
    [currentMembers, selectedUsers]
  );

  const handleSearch = useCallback(async (email: string) => {
    if (!token || !email.trim()) return setSearchResults([]);

    setIsSearchingUsers(true);
    try {
      const res = await api.get<UserDetails[]>(
        `/users/search?email=${email}&projectId=${projectId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const filtered = res.data.filter((u) => !allExcludedUserIds.includes(u._id));
      setSearchResults(filtered);
    } catch (err) {
      console.error("User search error:", err);
      setSearchResults([]);
    } finally {
      setIsSearchingUsers(false);
    }
  }, [token, projectId, allExcludedUserIds]);

useEffect(() => {
    const handler = setTimeout(() => {
        if (searchEmail.trim()) {
            handleSearch(searchEmail);
        } else {
            // Clear only when searchEmail is empty
            setSearchResults([]);
        }
    }, 300);

    return () => {
        clearTimeout(handler);
    };
}, [searchEmail, handleSearch]);


  const handleAdd = async () => {
    if (selectedUsers.length === 0) {
      return setError("Please select users to add.");
    }
    try {
      const payload = selectedUsers.map((u) => ({ user: u._id, role: "developer" }));
      await api.post(`/projects/${projectId}/members`, { newMembers: payload }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onMembersUpdated();
      setSearchEmail("");
      setSelectedUsers([]);
      setSearchResults([]);
      setError(null);
      setIsDialogOpen(false);
    } catch (err: any) {
      console.error("Add members error:", err);
      setError(err.response?.data?.message || "Failed to add members.");
    }
  };

  const handleRemove = async (memberUserId: string) => {
    if (memberUserId === user?.id) return alert("You can't remove yourself.");
    if (!confirm("Remove this member?")) return;

    try {
      await api.delete(`/projects/${projectId}/members/${memberUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onMembersUpdated();
    } catch (err: any) {
      console.error("Remove member error:", err);
      setError(err.response?.data?.message || "Failed to remove member.");
    }
  };

  const handleDialogToggle = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setSelectedUsers([]);
      setSearchEmail("");
      setSearchResults([]);
      setError(null);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogToggle}>
      <DialogTrigger asChild>
        <Button className={triggerButtonClassName}>
          <UserPlus size={20} />
          <span>Add Members</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#2B2E3E] text-white border-[#3C4155]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Manage Project Members</DialogTitle>
          <DialogDescription className="text-gray-400">
            Add or remove members for this project.
          </DialogDescription>
        </DialogHeader>

        {/* Search Users */}
        <div className="space-y-2 py-4">
          <Label>Search by Email</Label>
          <Command className="rounded-lg border border-[#3C4155] bg-gray-800">
            <CommandInput
              placeholder="Search for user email..."
              value={searchEmail}
              onValueChange={setSearchEmail}
              className="h-9 focus:ring-0 text-white placeholder-gray-400"
            />
            <CommandList className="max-h-[150px] overflow-y-auto">
              {isSearchingUsers ? (
                <CommandEmpty>Searching...</CommandEmpty>
              ) : searchResults.length === 0 && searchEmail ? (
                <CommandEmpty>No users found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {searchResults.map((user) => (
                    <CommandItem
                      key={user._id}
                      value={user.email}
                      onSelect={() => {
                        setSelectedUsers((prev) => [...prev, user]);
                        setSearchEmail('');
                    }}
                    
                      className="cursor-pointer text-white hover:bg-[#3C4155]"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-gray-400 text-sm">{user.email}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="space-y-2">
            <Label>Users to Add</Label>
            <div className="flex flex-wrap gap-2 p-2 rounded-md border border-[#191a20] bg-gray-800 min-h-[40px]">
              {selectedUsers.map((user) => (
                <Badge key={user._id} className="bg-blue-600 text-white flex items-center gap-1">
                  {user.name}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1 text-white"
                    onClick={() => setSelectedUsers((prev) => prev.filter((u) => u._id !== user._id))}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Current Members */}
        <div className="space-y-2 mt-4">
          <Label>
            Current Project Members ({membersToDisplay.length})
          </Label>
          <ScrollArea className="h-[200px] w-full rounded-md border border-[#3C4155] bg-gray-800 p-2">
            {membersToDisplay.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No members yet.</p>
            ) : (
              membersToDisplay.map((member) => (
                <MemberDisplay
                  key={member._id}
                  member={member}
                  onRemove={handleRemove}
                  isRemovable={currentUserRole === "admin"}
                />
              ))
            )}
          </ScrollArea>
        </div>

        {/* Error & Actions */}
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleDialogToggle(false)} className="text-gray-400 border-gray-400 hover:bg-gray-800">
            Cancel
          </Button>
          <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
            Add Selected Members
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddMembersDialog;

