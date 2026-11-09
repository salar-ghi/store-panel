
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageSquare, 
  Search, 
  Send, 
  User,
  Clock,
  MoreVertical,
  Phone,
  Video,
  Image,
  Paperclip,
  Heart,
  Trash,
  Archive,
  Bell,
  BellOff,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { UserService } from "@/services/user-service";

interface MessageItem {
  id: number;
  userId: string | number;
  text: string;
  time: string;
  isMe: boolean;
}

export default function Messages() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | number | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: rawUsers = [], isLoading } = useQuery({
    queryKey: ["chat-users"],
    queryFn: async () => {
      try {
        const u = await UserService.getAllUsers();
        return u.map((user) => ({
          id: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || 'کاربر',
          avatar: "/placeholder.svg",
          lastMessage: user.email || user.phoneNumber || "",
          time: "-",
          unread: 0,
          online: false,
        }));
      } catch {
        return [];
      }
    },
  });

  const queryClient = useQueryClient();
  const setUsers = (next: typeof rawUsers) => queryClient.setQueryData(["chat-users"], next);
  const users = rawUsers;
  const effectiveUserId = selectedUserId ?? (users.length > 0 ? users[0].id : null);
  const selectedUser = users.find((user) => user.id === effectiveUserId);
  
  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    
    const newMessage = {
      id: messages.length + 1,
      userId: selectedUserId,
      text: messageText,
      time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };
    
    setMessages([...messages, newMessage]);
    setMessageText("");
    
    // Mark messages as read when we reply
    if (selectedUser && selectedUser.unread > 0) {
      const updatedUsers = users.map(user => 
        user.id === selectedUserId ? { ...user, unread: 0 } : user
      );
      setUsers(updatedUsers);
    }
  };
  
  const handleSelectUser = (userId: string | number) => {
    setSelectedUserId(userId);
    
    // Mark messages as read when we select the conversation
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, unread: 0 } : user
    );
    setUsers(updatedUsers);
  };

  const userMessages = messages.filter(msg => msg.userId === selectedUserId);
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = users.reduce((sum, user) => sum + user.unread, 0);

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">پیام‌ها</h2>
          <p className="text-muted-foreground">گفتگو با کاربران و مشتریان</p>
        </div>
        {totalUnread > 0 && (
          <Badge variant="secondary" className="gap-1">
            <MessageSquare className="h-4 w-4" />
            {totalUnread} پیام خوانده نشده
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 col-span-1">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>گفتگوها</CardTitle>
              <Badge variant="outline">{users.length}</Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجوی گفتگو..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <ScrollArea className="h-[500px]">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">
                  هیچ کاربری یا گفتگویی یافت نشد
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 cursor-pointer",
                      effectiveUserId === user.id ? "bg-indigo-100 dark:bg-indigo-900/20" : "",
                      "hover:bg-indigo-50 dark:hover:bg-indigo-900/10"
                    )}
                    onClick={() => handleSelectUser(user.id)}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {user.online && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{user.name}</h3>
                        <span className="text-xs text-muted-foreground">{user.time}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                          {user.lastMessage}
                        </p>
                        {user.unread > 0 && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                            {user.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 col-span-1 lg:col-span-2">
          {!selectedUser ? (
            <div className="flex h-[600px] items-center justify-center flex-col gap-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">یک گفتگو را برای شروع انتخاب کنید</p>
            </div>
          ) : (
            <>
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                      <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{selectedUser.name}</h3>
                        {selectedUser.online && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                            آنلاین
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {selectedUser.online 
                          ? "در حال گفتگو" 
                          : "آخرین بازدید: امروز، 10:45"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" title="تماس صوتی">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="تماس تصویری">
                      <Video className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast.success("گفتگو بایگانی شد")}>
                          <Archive className="mr-2 h-4 w-4" />
                          بایگانی گفتگو
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success("اعلان‌ها خاموش شد")}>
                          <BellOff className="mr-2 h-4 w-4" />
                          خاموش کردن اعلان‌ها
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success("گفتگو حذف شد")}>
                          <Trash className="mr-2 h-4 w-4" />
                          حذف گفتگو
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[440px] p-4">
                  {userMessages.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground">
                      هنوز پیامی ارسال نشده است
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userMessages.map((message) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex",
                            message.isMe ? "justify-end" : "justify-start"
                          )}
                        >
                          {!message.isMe && (
                            <Avatar className="h-8 w-8 mr-2">
                              <AvatarImage
                                src={selectedUser.avatar}
                                alt={selectedUser.name}
                              />
                              <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={cn(
                              "max-w-[70%] rounded-lg px-4 py-2",
                              message.isMe
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}
                          >
                            <p>{message.text}</p>
                            <div
                              className={cn(
                                "text-xs mt-1",
                                message.isMe
                                  ? "text-primary-foreground/70"
                                  : "text-muted-foreground"
                              )}
                            >
                              {message.time}
                            </div>
                          </div>
                          {message.isMe && (
                            <Avatar className="h-8 w-8 ml-2">
                              <AvatarImage src="/placeholder.svg" alt="پشتیبانی" />
                              <AvatarFallback>پ</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              <CardFooter className="border-t p-3">
                <div className="flex items-center w-full gap-2">
                  <Button variant="ghost" size="icon" title="پیوست فایل">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="ارسال تصویر">
                    <Image className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="پیام خود را بنویسید..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} className="gap-1">
                    <Send className="h-4 w-4" />
                    ارسال
                  </Button>
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
