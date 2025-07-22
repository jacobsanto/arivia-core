import { useState, useMemo } from 'react';
import { Message } from '@/hooks/useChatTypes';

export const useMessageSearch = (messages: Message[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    
    const query = searchQuery.toLowerCase();
    return messages.filter(message => 
      message.content.toLowerCase().includes(query) ||
      message.sender.toLowerCase().includes(query)
    );
  }, [messages, searchQuery]);

  const searchResultsCount = filteredMessages.length;
  const hasResults = searchQuery.trim() && searchResultsCount > 0;

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchActive(false);
  };

  const toggleSearch = () => {
    setIsSearchActive(!isSearchActive);
    if (isSearchActive) {
      clearSearch();
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    filteredMessages,
    searchResultsCount,
    hasResults,
    isSearchActive,
    setIsSearchActive,
    clearSearch,
    toggleSearch
  };
};