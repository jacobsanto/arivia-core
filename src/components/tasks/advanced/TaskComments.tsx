import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  comment: string;
  created_at: string;
  user_id: string;
}

interface TaskCommentsProps {
  taskId: string;
  taskType: "housekeeping" | "maintenance";
}

const TaskComments = ({ taskId, taskType }: TaskCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [taskId, taskType]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("task_comments")
        .select(`
          id,
          comment,
          created_at,
          user_id
        `)
        .eq("task_id", taskId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      // Get tenant_id from current user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.user.id)
        .single();

      const { error } = await supabase
        .from("task_comments")
        .insert({
          task_id: taskId,
          user_id: user.user.id,
          tenant_id: user.user.id, // Using user ID as tenant for now
          comment: newComment.trim(),
        });

      if (error) throw error;

      setNewComment("");
      await fetchComments();
      
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully",
      });
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Comment */}
        <div className="space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
              size="sm"
            >
              <Send className="h-3 w-3 mr-1" />
              Post Comment
            </Button>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-4">
              Loading comments...
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-3 bg-muted/30 rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getInitials("User")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      User
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{comment.comment}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskComments;