
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { UserService } from "@/services/user-service";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Key, 
  AtSign, 
  Phone, 
  ShieldCheck, 
  Bell, 
  FileText,
  Check,
  Users
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  description: z.string().optional(),
  roleIds: z.array(z.string()).min(1, "Select at least one role"),
  generatePassword: z.boolean().default(true),
  isAdmin: z.boolean().default(false),
  notificationMethod: z.enum(["email", "sms", "both"]).default("email"),
});

type FormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  onUserAdded: () => void;
}

export function UserForm({ onUserAdded }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: UserService.getAllRoles,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      phoneNumber: "",
      description: "",
      roleIds: [],
      generatePassword: true,
      isAdmin: false,
      notificationMethod: "email",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const passwordToSend = UserService.generateRandomPassword();
      
      const user = await UserService.createUser({
        username: data.username,
        email: data.email,
        phoneNumber: data.phoneNumber,
        description: data.description,
        roleIds: data.roleIds,
        generatePassword: true,
        isAdmin: data.isAdmin,
        notificationMethod: data.notificationMethod
      });

      setGeneratedPassword(passwordToSend);
      
      let successMessage = `User ${data.username} created successfully!`;
      toast.success(successMessage);
      
      if (data.isAdmin) {
        toast("Admin role assigned", {
          description: "This user has been given administrator privileges"
        });
      }
      
      toast.success(`Credentials will be sent via ${data.notificationMethod}`, {
        description: data.notificationMethod === "both" 
          ? "User will receive login details via email and SMS" 
          : `User will receive login details via ${data.notificationMethod}`
      });
      
      if (!generatedPassword) {
        form.reset();
        setSelectedRoles([]);
      }
      
      onUserAdded();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => {
      const newSelection = prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId];
      
      form.setValue('roleIds', newSelection);
      return newSelection;
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
        {generatedPassword ? (
          <div className="mb-6 space-y-4">
            <div className="rounded-lg border p-4 bg-muted/20">
              <h3 className="font-medium mb-2 flex items-center">
                <Key className="h-4 w-4 mr-2 text-purple-500" />
                Generated Password
              </h3>
              <p className="text-sm mb-2">A password has been generated for this user:</p>
              <div className="font-mono bg-background p-3 rounded border text-center">
                {generatedPassword}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This password will be sent to the user via the selected notification method.
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setGeneratedPassword(null);
                  form.reset();
                }}
              >
                Create Another User
              </Button>
            </div>
          </div>
        ) : (
          <>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <AtSign className="h-4 w-4 mr-1 text-muted-foreground" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Phone className="h-4 w-4 mr-1 text-muted-foreground" />
                    Cell Phone
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter cell phone number" {...field} />
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
                  <FormLabel className="flex items-center">
                    <FileText className="h-4 w-4 mr-1 text-muted-foreground" />
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter user description or notes (optional)" 
                      className="resize-none min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAdmin"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center">
                      <ShieldCheck className="h-4 w-4 mr-1 text-purple-500" />
                      Administrator
                    </FormLabel>
                    <FormDescription>
                      Grant this user administrator privileges
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notificationMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Bell className="h-4 w-4 mr-1 text-muted-foreground" />
                    Notification Method
                  </FormLabel>
                  <FormDescription>
                    How should we send the login credentials to this user?
                  </FormDescription>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1 mt-2"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="email" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Email only
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="sms" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          SMS only
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="both" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Both Email and SMS
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator className="my-4" />
            
            <FormField
              control={form.control}
              name="roleIds"
              render={() => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                    Roles
                  </FormLabel>
                  <FormDescription>
                    Assign one or more roles to this user
                  </FormDescription>
                  <div className="mt-3 space-y-4">
                    {roles.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {roles.map((role) => (
                          <div 
                            key={role.id} 
                            className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors ${
                              selectedRoles.includes(role.id) 
                                ? "bg-purple-50 border-purple-200" 
                                : "hover:bg-gray-50"
                            }`}
                            onClick={() => handleRoleToggle(role.id)}
                          >
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                checked={selectedRoles.includes(role.id)}
                                onCheckedChange={() => handleRoleToggle(role.id)}
                                className="data-[state=checked]:bg-purple-500 data-[state=checked]:text-white"
                              />
                              <div>
                                <p className="font-medium">{role.name}</p>
                                {role.permissions && role.permissions.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {role.permissions.slice(0, 2).map((permission, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {permission}
                                      </Badge>
                                    ))}
                                    {role.permissions.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{role.permissions.length - 2} more
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            {selectedRoles.includes(role.id) && (
                              <Check className="h-4 w-4 text-purple-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed p-6 text-center">
                        <p className="text-muted-foreground">No roles available</p>
                        <p className="text-sm text-muted-foreground mt-1">Create roles first to assign them to users</p>
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating..." : "Create User"}
            </Button>
          </>
        )}
      </form>
    </Form>
  );
}
