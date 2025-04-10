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
import { Key, AtSign, Phone, ShieldCheck } from "lucide-react";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  roleIds: z.array(z.string()).min(1, "Select at least one role"),
  generatePassword: z.boolean().default(true),
  isAdmin: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  onUserAdded: () => void;
}

export function UserForm({ onUserAdded }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

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
      roleIds: [],
      generatePassword: true,
      isAdmin: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const passwordToSend = UserService.generateRandomPassword();
      
      await UserService.createUser({
        username: data.username,
        email: data.email,
        phoneNumber: data.phoneNumber,
        roleIds: data.roleIds,
        generatePassword: true
      });

      setGeneratedPassword(passwordToSend);
      
      let successMessage = `User ${data.username} created successfully!`;
      toast.success(successMessage);
      
      if (data.isAdmin) {
        toast("Admin role assigned", {
          description: "This user has been given administrator privileges"
        });
      }
      
      if (!generatedPassword) {
        form.reset();
      }
      
      onUserAdded();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create user");
    } finally {
      setIsSubmitting(false);
    }
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
                In a real application, this would be sent to the user via email or SMS.
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

            <Separator className="my-4" />
            
            <FormField
              control={form.control}
              name="roleIds"
              render={() => (
                <FormItem>
                  <FormLabel>Roles</FormLabel>
                  <FormDescription>
                    Assign one or more roles to this user
                  </FormDescription>
                  <Card className="mt-2">
                    <ScrollArea className="h-[200px]">
                      <CardContent className="pt-4">
                        {roles.map((role) => (
                          <FormField
                            key={role.id}
                            control={form.control}
                            name="roleIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={role.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 py-2"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(role.id)}
                                      onCheckedChange={(checked) => {
                                        const updatedRoles = checked
                                          ? [...field.value, role.id]
                                          : field.value.filter((id) => id !== role.id);
                                        field.onChange(updatedRoles);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {role.name}
                                    {role.name.toLowerCase() === 'admin' && (
                                      <Badge variant="outline" className="ml-2 bg-purple-500/10">Admin</Badge>
                                    )}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </CardContent>
                    </ScrollArea>
                  </Card>
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
