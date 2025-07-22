
export function useOfflineMessages() {
  const handleOfflineMessage = (
    message: any,
    chatType: string,
    recipientId: string,
    userId: string,
    attachments: any[]
  ) => {
    // Store message locally for offline handling
    console.log('Handling offline message:', message);
  };

  return { handleOfflineMessage };
}
