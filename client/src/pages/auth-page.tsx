import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { Redirect } from "wouter";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm({
    resolver: zodResolver(insertUserSchema.pick({ username: true, password: true }))
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema)
  });

  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md p-6">
          <div className="flex justify-center mb-8">
            <div className="flex items-center">
              <img 
                src="/solospace-logo.png" 
                alt="SoloSpace" 
                className="h-12 w-auto mr-3"
              />
              <span className="font-semibold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500">
                SoloSpace
              </span>
            </div>
          </div>

          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="login-username">Username</Label>
                    <Input id="login-username" {...loginForm.register("username")} />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input type="password" id="login-password" {...loginForm.register("password")} />
                  </div>
                  <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                    Login
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="register-username">Username</Label>
                    <Input id="register-username" {...registerForm.register("username")} />
                  </div>
                  <div>
                    <Label htmlFor="register-displayName">Display Name</Label>
                    <Input id="register-displayName" {...registerForm.register("displayName")} />
                  </div>
                  <div>
                    <Label htmlFor="register-password">Password</Label>
                    <Input type="password" id="register-password" {...registerForm.register("password")} />
                  </div>
                  <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                    Register
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
        <div className="max-w-lg text-primary-foreground">
          <h1 className="text-4xl font-bold mb-4">Welcome to Our Community</h1>
          <p className="text-lg opacity-90">
            Join our vibrant community to connect with others, share your thoughts, and engage in meaningful discussions.
          </p>
        </div>
      </div>
    </div>
  );
}