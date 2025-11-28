'use client';

import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { FiSearch, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import { useDebounce } from '@/hooks/useDebounce';

interface User {
  id: string;
  username: string;
  fullname: string;
  image: string | null;
  isPublic: boolean;
}

interface UserSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserSearchModal({ isOpen, onClose }: UserSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    const searchUsers = async () => {
      if (!debouncedSearch.trim()) {
        setUsers([]);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      setHasSearched(true);
      try {
        const response = await fetch(
          `/api/user/search?q=${encodeURIComponent(debouncedSearch)}`
        );
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error('Error searching users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    searchUsers();
  }, [debouncedSearch]);

  const handleClose = () => {
    setSearchQuery('');
    setUsers([]);
    setHasSearched(false);
    onClose();
  };

  const handleUserClick = () => {
    handleClose();
  };

  return (
    <Dialog title="Find People" isOpen={isOpen} onClose={handleClose}>
      <div className="p-6">
        {/* Search Input */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search by username or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<FiSearch className="w-4 h-4" />}
            autoFocus
          />
        </div>

        {/* Results */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <Link
                key={user.id}
                href={`/users/${user.username}`}
                onClick={handleUserClick}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
              >
                <Avatar src={user.image} alt={user.fullname} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {user.fullname}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    @{user.username}
                  </p>
                </div>
                {!user.isPublic && (
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    Private
                  </span>
                )}
              </Link>
            ))
          ) : hasSearched && !loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FiUser className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-foreground font-medium mb-1">No users found</p>
              <p className="text-sm text-muted-foreground">
                Try searching with a different username or name
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FiSearch className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-foreground font-medium mb-1">
                Search for people
              </p>
              <p className="text-sm text-muted-foreground">
                Find friends and other users on Track Verse
              </p>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
