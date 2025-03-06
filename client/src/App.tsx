import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { NotificationToast } from "@/components/layout/notification-toast";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import FeedPage from "@/pages/feed-page";
import SpacesPage from "@/pages/spaces-page";
import MembersPage from "@/pages/members-page";
import LeaderboardPage from "@/pages/leaderboard-page";
import DiscussionsPage from "@/pages/discussions-page";
import CoursesPage from "@/pages/courses-page";
import MessagesPage from "@/pages/messages-page";
import UserApprovalsPage from "@/pages/admin/user-approvals";
import CourseManagementPage from "@/pages/admin/course-management";
import RoleManagementPage from "@/pages/admin/role-management";
import BookmarksPage from "@/pages/bookmarks-page";
import TasksPage from "@/pages/tasks-page";
import { ProtectedRoute } from "./lib/protected-route";
import CustomSlugPage from "@/pages/custom-slug-page";
import EmailSettingsPage from "@/pages/settings/email-settings-page";
import ThemeSettingsPage from "@/pages/settings/theme-settings-page";
import CreateCoursePage from "@/pages/courses/create";
import LessonPage from "@/pages/courses/lesson-page";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/feed" component={FeedPage} />
      <ProtectedRoute path="/spaces" component={SpacesPage} />
      <ProtectedRoute path="/members" component={MembersPage} />
      <ProtectedRoute path="/leaderboard" component={LeaderboardPage} />
      <ProtectedRoute path="/discussions" component={DiscussionsPage} />
      <ProtectedRoute path="/courses" component={CoursesPage} />
      <ProtectedRoute path="/courses/create" component={CreateCoursePage} />
      <ProtectedRoute path="/courses/lessons/:lessonId" component={LessonPage} />
      <ProtectedRoute path="/messages" component={MessagesPage} />
      <ProtectedRoute path="/bookmarks" component={BookmarksPage} />
      <ProtectedRoute path="/tasks" component={TasksPage} />
      <ProtectedRoute path="/custom-slug" component={CustomSlugPage} />
      <ProtectedRoute path="/settings/email" component={EmailSettingsPage} />
      <ProtectedRoute path="/settings/theme" component={ThemeSettingsPage} />
      <ProtectedRoute path="/admin/course-management" component={CourseManagementPage} />
      <ProtectedRoute path="/admin/user-approvals" component={UserApprovalsPage} />
      <ProtectedRoute path="/admin/role-management" component={RoleManagementPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
        <NotificationToast />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;