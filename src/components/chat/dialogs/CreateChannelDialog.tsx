import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { chatChannelsAPI } from '@/services/chat/realtime-chat.service';
import { logger } from '@/services/logger';

const createChannelSchema = z.object({
  name: z.string()
    .min(1, 'Channel name is required')
    .max(50, 'Channel name must be 50 characters or less')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Channel name can only contain letters, numbers, hyphens, and underscores'),
  description: z.string()
    .max(200, 'Description must be 200 characters or less')
    .optional(),
  topic: z.string()
    .max(100, 'Topic must be 100 characters or less')
    .optional(),
  type: z.enum(['public', 'private']),
});

type CreateChannelFormValues = z.infer<typeof createChannelSchema>;

interface CreateChannelDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onChannelCreated?: () => void;
}

export const CreateChannelDialog: React.FC<CreateChannelDialogProps> = ({
  isOpen,
  onOpenChange,
  onChannelCreated,
}) => {
  const { toast } = useToast();
  
  const form = useForm<CreateChannelFormValues>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: '',
      description: '',
      topic: '',
      type: 'public',
    },
  });

  const onSubmit = async (data: CreateChannelFormValues) => {
    try {
      await chatChannelsAPI.createChannel(
        data.name,
        data.description,
        data.topic,
        data.type
      );

      toast({
        title: "Success",
        description: `Channel #${data.name} created successfully`,
      });

      form.reset();
      onOpenChange(false);
      onChannelCreated?.();
      
    } catch (error) {
      logger.error('Error creating channel:', error);
      toast({
        title: "Error",
        description: "Failed to create channel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Channel</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. general, announcements"
                      {...field}
                      className="font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What's this channel about?"
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Channel topic or purpose"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Channel Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="public" />
                        <Label htmlFor="public" className="flex-1">
                          <div className="font-medium">Public</div>
                          <div className="text-sm text-muted-foreground">
                            Anyone in the team can join and see the channel
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="private" />
                        <Label htmlFor="private" className="flex-1">
                          <div className="font-medium">Private</div>
                          <div className="text-sm text-muted-foreground">
                            Only invited members can join and see the channel
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Creating...' : 'Create Channel'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};