
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

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  roleIds: z.array(z.string()).min(1, "Select at least one role"),
  generatePassword: z.boolean().default(false),
  password: z.string().min(6, "Password must be at least 6 characters").optional()
    .refine(val => val !== undefined || val === '', {
      message: "Password is required if not auto-generating",
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface UserFormProps {
  onUserAdded: () => void;
}

export function UserForm({ onUserAdded }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(true);

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
      generatePassword: false,
      password: "",
    },
  });

  const generatePassword = form.watch("generatePassword");

  // Update password visibility based on generate password toggle
  const onGeneratePasswordChange = (checked: boolean) => {
    setShowPasswordField(!checked);
    if (checked) {
      form.setValue("password", ""); // Clear password field if auto-generating
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      let passwordToSend = data.password;
      
      // If generating password, create one and notify about it
      if (data.generatePassword) {
        passwordToSend = UserService.generateRandomPassword();
        // In a real app, this would be sent via email/SMS
        console.log("Generated password:", passwordToSend);
      }

      // Create the user with the form data
      await UserService.createUser({
        username: data.username,
        email: data.email,
        password: passwordToSend,
        phoneNumber: data.phoneNumber,
        roleIds: data.roleIds,
        generatePassword: data.generatePassword
      });

      let successMessage = "User created successfully!";
      if (data.generatePassword) {
        successMessage += " A password has been generated and would be sent to the user.";
      }
      
      toast.success(successMessage);
      form.reset();
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
              <FormLabel>Email</FormLabel>
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
              <FormLabel>Cell Phone</FormLabel>
              <FormControl>
                <Input placeholder="Enter cell phone number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="generatePassword"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Generate Random Password</FormLabel>
                <FormDescription>
                  System will generate a secure password and send it to the user
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    onGeneratePasswordChange(checked);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {showPasswordField && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter password" 
                    type="password" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Separator className="my-4" />
        
        <FormField
          control={form.control}
          name="roleIds"
          render={() => (
            <FormItem>
              <FormLabel>Roles</FormLabel>
              <FormDescription>
                Select one or more roles for this user
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
      </form>
    </Form>
  );
}
